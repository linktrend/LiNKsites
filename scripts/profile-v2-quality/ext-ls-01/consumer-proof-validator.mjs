#!/usr/bin/env node
/**
 * Fail-closed EXT-LS-01 A1 consumer proof validator.
 *
 * Consumes candidate identities and optional consumer-owned receipts. It never
 * checks out LiNKlibraries, never claims ACCEPT / protected integration /
 * provider conformance / production proof, and HOLDs when the provider or A1
 * receipt is absent.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ENTRY_ID,
  EXPECTED_PROVIDER_PIN,
  FORBIDDEN_OVERALL_VERDICTS,
  GATE_ID,
  HOLD_LANE_EVIDENCE_ABSENT,
  HOLD_PROVIDER_OR_A1_ABSENT,
  LANES,
  LAYOUT_ID,
  PLAN_CAPACITIES,
  PLAN_IDS,
  RELEASE_VERSION,
} from './lanes.mjs'

const SHA1 = /^[0-9a-f]{40}$/
const SHA256 = /^[0-9a-f]{64}$/
const FORBIDDEN_CLAIM_RE = new RegExp(
  `\\b(${FORBIDDEN_OVERALL_VERDICTS.join('|')})\\b`,
  'i',
)

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const lane = (id, status, reason, details = {}) =>
  Object.freeze({ id, status, reason, details: Object.freeze(details) })

const collectStrings = (value, acc = []) => {
  if (typeof value === 'string') acc.push(value)
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, acc))
  else if (isRecord(value)) Object.values(value).forEach((item) => collectStrings(item, acc))
  return acc
}

const parseJsonFile = (path) => {
  try {
    return { ok: true, value: JSON.parse(readFileSync(path, 'utf8')) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'unreadable json' }
  }
}

const loadOptionalReceipt = (ref) => {
  if (ref == null || ref === '') return { present: false, reason: HOLD_PROVIDER_OR_A1_ABSENT }
  if (isRecord(ref)) return { present: true, value: ref }
  if (typeof ref !== 'string') return { present: false, invalid: `unsupported receipt reference: ${typeof ref}` }
  const loaded = parseJsonFile(resolve(ref))
  if (!loaded.ok) return { present: false, invalid: loaded.error }
  if (!isRecord(loaded.value)) return { present: false, invalid: 'receipt is not an object' }
  return { present: true, value: loaded.value }
}

const forbiddenClaims = (value) =>
  collectStrings(value).flatMap((text) => {
    const match = text.match(FORBIDDEN_CLAIM_RE)
    return match ? [`forbidden claim ${match[1].toUpperCase()}`] : []
  })

const identityErrors = (candidate) => {
  const errors = []
  if (!isRecord(candidate)) return ['candidate identity object is required']
  if (!SHA1.test(candidate.commit || '')) errors.push('candidate.commit must be a 40-character lowercase SHA-1')
  if (!SHA1.test(candidate.tree || '')) errors.push('candidate.tree must be a 40-character lowercase SHA-1')
  if (candidate.repository != null && candidate.repository !== 'linktrend/LiNKsites') {
    errors.push('candidate.repository must be linktrend/LiNKsites')
  }
  if (candidate.issue != null && Number(candidate.issue) !== 301) {
    errors.push('candidate.issue must be 301 for this validator')
  }
  return errors
}

const pinMismatch = (receipt) => {
  const errors = []
  const pin = isRecord(receipt.providerPin) ? receipt.providerPin : receipt
  const release = isRecord(receipt.release) ? receipt.release : pin
  if ((receipt.entryId || release.entryId) && (receipt.entryId || release.entryId) !== ENTRY_ID) {
    errors.push(`entryId must be ${ENTRY_ID}`)
  }
  if ((receipt.version || release.version) && (receipt.version || release.version) !== RELEASE_VERSION) {
    errors.push(`version must be ${RELEASE_VERSION}`)
  }
  for (const [key, expected] of Object.entries(EXPECTED_PROVIDER_PIN)) {
    const actual = pin[key] ?? release[key]
    if (actual != null && actual !== expected) errors.push(`provider pin mismatch: ${key}`)
  }
  return errors
}

const materializationLane = (receipt) => {
  if (receipt.providerCheckoutRequired === true || receipt.requiresProviderCheckout === true) {
    return lane('materialization_without_provider_checkout', 'FAIL', 'materialization requires a provider checkout')
  }
  if (receipt.liveProviderFetch === true || receipt.runtimeProviderFetch === true) {
    return lane('materialization_without_provider_checkout', 'FAIL', 'runtime live provider fetch is forbidden')
  }
  if (receipt.providerCheckoutRemoved !== true && receipt.providerCheckoutPresent === true) {
    return lane('materialization_without_provider_checkout', 'FAIL', 'provider checkout remains present at runtime')
  }
  const cacheTree = receipt.consumerCacheTree || receipt.consumerMaterializedTreeSha1
  if (!SHA1.test(cacheTree || '')) {
    return lane('materialization_without_provider_checkout', 'HOLD', HOLD_LANE_EVIDENCE_ABSENT, {
      missing: 'consumerCacheTree',
    })
  }
  if (receipt.providerCheckoutRemoved !== true) {
    return lane('materialization_without_provider_checkout', 'HOLD', HOLD_LANE_EVIDENCE_ABSENT, {
      missing: 'providerCheckoutRemoved',
    })
  }
  return lane('materialization_without_provider_checkout', 'PASS', 'local cache identity recorded without provider checkout')
}

const resolverLane = (receipt, planId) => {
  const id = `resolver_plan_${planId}`
  const resolver = isRecord(receipt.resolver) ? receipt.resolver : {}
  const plans = isRecord(resolver.plans) ? resolver.plans : resolver
  const plan = isRecord(plans[planId]) ? plans[planId] : null
  if (!plan) return lane(id, 'HOLD', HOLD_LANE_EVIDENCE_ABSENT, { planId })
  if (resolver.layoutId && resolver.layoutId !== LAYOUT_ID) {
    return lane(id, 'FAIL', `layout must be ${LAYOUT_ID}`, { planId, layoutId: resolver.layoutId })
  }
  if (plan.allHeroFlattening === true || resolver.allHeroFlattening === true) {
    return lane(id, 'FAIL', 'all-Hero flattening is forbidden', { planId })
  }
  if (plan.hiddenFallback === true || resolver.hiddenFallback === true) {
    return lane(id, 'FAIL', 'hidden fallback is forbidden', { planId })
  }
  if (plan.capacity !== PLAN_CAPACITIES[planId]) {
    return lane(id, 'FAIL', `plan ${planId} capacity must be ${PLAN_CAPACITIES[planId]}`, {
      planId,
      capacity: plan.capacity,
    })
  }
  if (planId === 'l' && plan.globalNavigation !== false && plan.minimalShell !== true) {
    return lane(id, 'FAIL', 'Type L must preserve a minimal/no-global-navigation shell', { planId })
  }
  if (plan.deterministic !== true) {
    return lane(id, 'HOLD', HOLD_LANE_EVIDENCE_ABSENT, { planId, missing: 'deterministic' })
  }
  return lane(id, 'PASS', `plan ${planId} resolver evidence present`, { planId, capacity: plan.capacity })
}

const payloadLane = (receipt) => {
  const payload = isRecord(receipt.payloadProjection) ? receipt.payloadProjection : null
  if (!payload) return lane('payload_projection', 'HOLD', HOLD_LANE_EVIDENCE_ABSENT)
  if (payload.productsDistinctFromServices !== true) {
    return lane('payload_projection', 'FAIL', 'Products must remain distinct from Services')
  }
  if (payload.preservesProviderSemanticIds !== true) {
    return lane('payload_projection', 'FAIL', 'provider semantic IDs must be preserved')
  }
  const digest = payload.sha256 || payload.payloadProjectionSha256
  if (digest && digest !== EXPECTED_PROVIDER_PIN.payloadProjectionSha256 && payload.bindExpectedProviderDigest === true) {
    return lane('payload_projection', 'FAIL', 'payload projection digest does not match the expected provider pin')
  }
  if (!SHA256.test(digest || '') && payload.readback !== true) {
    return lane('payload_projection', 'HOLD', HOLD_LANE_EVIDENCE_ABSENT, { missing: 'sha256 or readback' })
  }
  return lane('payload_projection', 'PASS', 'payload projection preserves semantic IDs and Products/Services')
}

const surfaceLane = (receipt, id, field) => {
  const surfaces = isRecord(receipt.surfaces) ? receipt.surfaces : receipt
  const surface = isRecord(surfaces[field]) ? surfaces[field] : surfaces[id]
  if (!isRecord(surface)) return lane(id, 'HOLD', HOLD_LANE_EVIDENCE_ABSENT, { field })
  if (surface.skipped === true || surface.status === 'skipped') {
    return lane(id, 'HOLD', 'skipped surface is not evidence', { field })
  }
  if (surface.status === 'fail' || surface.ok === false) {
    return lane(id, 'FAIL', `${id} recorded failure`, { field })
  }
  if (surface.status === 'pass' || surface.ok === true) {
    return lane(id, 'PASS', `${id} evidence recorded`, { field })
  }
  return lane(id, 'HOLD', HOLD_LANE_EVIDENCE_ABSENT, { field, missing: 'status' })
}

const rollbackLane = (receipt) => {
  const rollback = isRecord(receipt.rollback) ? receipt.rollback : null
  if (!rollback) return lane('existing_site_pin_and_rollback', 'HOLD', HOLD_LANE_EVIDENCE_ABSENT)
  if (rollback.existingSitePinned !== true) {
    return lane('existing_site_pin_and_rollback', 'FAIL', 'existing-site pin is required')
  }
  if (rollback.simulatedRollback !== true && rollback.rollbackTarget == null) {
    return lane('existing_site_pin_and_rollback', 'HOLD', HOLD_LANE_EVIDENCE_ABSENT, {
      missing: 'simulatedRollback',
    })
  }
  return lane('existing_site_pin_and_rollback', 'PASS', 'existing-site pin and rollback target recorded')
}

const overallFrom = (lanes, failures) => {
  if (failures.length) return 'FAIL'
  if (lanes.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (lanes.some((item) => item.status === 'HOLD')) return 'HOLD'
  return 'CANDIDATE_EVIDENCE_COMPLETE'
}

/**
 * @param {object} input
 * @returns {{ ok: boolean, overall: string, gateId: string, candidate: object, lanes: object[], holds: string[], errors: string[], claims: object }}
 */
export function evaluateConsumerProof(input) {
  const errors = []
  if (!isRecord(input)) {
    return Object.freeze({
      ok: false,
      overall: 'FAIL',
      gateId: GATE_ID,
      candidate: null,
      lanes: Object.freeze([]),
      holds: Object.freeze([]),
      errors: Object.freeze(['input must be an object']),
      claims: Object.freeze({
        accept: false,
        protectedIntegration: false,
        providerConformance: false,
        productionProof: false,
      }),
    })
  }

  errors.push(...identityErrors(input.candidate))
  errors.push(...forbiddenClaims(input))
  if (input.requireProviderCheckout === true) {
    errors.push('validator must not require a provider checkout')
  }
  if (typeof input.providerCheckoutPath === 'string' && input.providerCheckoutPath.length > 0) {
    errors.push('provider checkout path is not an allowed input')
  }

  const a1 = loadOptionalReceipt(input.a1Receipt ?? input.a1ReceiptPath)
  const provider = loadOptionalReceipt(input.providerReceipt ?? input.providerReceiptPath)
  const consumer = loadOptionalReceipt(input.consumerReceipt ?? input.consumerReceiptPath)
  for (const loaded of [a1, provider, consumer]) {
    if (loaded.invalid) errors.push(loaded.invalid)
  }

  const receiptPresent = a1.present || provider.present || consumer.present
  const merged = Object.assign(
    {},
    provider.present ? provider.value : {},
    a1.present ? a1.value : {},
    consumer.present ? consumer.value : {},
  )

  if (receiptPresent) errors.push(...pinMismatch(merged))

  const claims = Object.freeze({
    accept: false,
    protectedIntegration: false,
    providerConformance: false,
    productionProof: false,
  })

  if (errors.length) {
    return Object.freeze({
      ok: false,
      overall: 'FAIL',
      gateId: GATE_ID,
      candidate: isRecord(input.candidate) ? Object.freeze({ ...input.candidate }) : null,
      lanes: Object.freeze([]),
      holds: Object.freeze([]),
      errors: Object.freeze(errors),
      claims,
    })
  }

  if (!receiptPresent) {
    const holds = LANES.map((id) =>
      lane(id, 'HOLD', HOLD_PROVIDER_OR_A1_ABSENT),
    )
    return Object.freeze({
      ok: true,
      overall: 'HOLD',
      gateId: GATE_ID,
      candidate: Object.freeze({ ...input.candidate }),
      lanes: Object.freeze(holds),
      holds: Object.freeze([HOLD_PROVIDER_OR_A1_ABSENT]),
      errors: Object.freeze([]),
      claims,
      notes: Object.freeze([
        'Provider/A1 receipt is absent. EXT-LS-01 remains HOLD. This is not ACCEPT, protected integration, provider conformance, or production proof.',
      ]),
    })
  }

  const lanes = [
    materializationLane(merged),
    ...PLAN_IDS.map((planId) => resolverLane(merged, planId)),
    payloadLane(merged),
    surfaceLane(merged, 'server_html', 'serverHtml'),
    surfaceLane(merged, 'browser', 'browser'),
    surfaceLane(merged, 'accessibility', 'accessibility'),
    surfaceLane(merged, 'visual', 'visual'),
    surfaceLane(merged, 'link', 'link'),
    surfaceLane(merged, 'seo', 'seo'),
    surfaceLane(merged, 'privacy', 'privacy'),
    rollbackLane(merged),
  ]

  const holdReasons = [...new Set(lanes.filter((item) => item.status === 'HOLD').map((item) => item.reason))]
  const overall = overallFrom(lanes, [])
  return Object.freeze({
    ok: overall !== 'FAIL',
    overall,
    gateId: GATE_ID,
    candidate: Object.freeze({ ...input.candidate }),
    lanes: Object.freeze(lanes),
    holds: Object.freeze(holdReasons),
    errors: Object.freeze([]),
    claims,
    notes: Object.freeze([
      overall === 'CANDIDATE_EVIDENCE_COMPLETE'
        ? 'Candidate-bound evidence is complete for this validator only. Independent acceptance, protected integration, provider conformance, and production proof remain out of scope.'
        : 'Candidate-bound EXT-LS-01 validator result. Missing lanes stay HOLD. This is not ACCEPT or protected integration.',
    ]),
  })
}

const parseArgs = (argv) => {
  const out = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      out[key] = next
      i += 1
    } else out[key] = true
  }
  return out
}

export const exitCodeFor = (result) => {
  if (result.overall === 'FAIL') return 2
  if (result.overall === 'HOLD') return 0
  if (result.overall === 'CANDIDATE_EVIDENCE_COMPLETE') return 0
  return 2
}

const main = () => {
  const args = parseArgs(process.argv.slice(2))
  let input = {}
  if (args.input) {
    const loaded = parseJsonFile(resolve(String(args.input)))
    if (!loaded.ok) {
      process.stderr.write(`${loaded.error}\n`)
      process.exit(2)
    }
    input = loaded.value
  }
  if (args['candidate-commit'] || args['candidate-tree']) {
    input = {
      ...input,
      candidate: {
        ...(isRecord(input.candidate) ? input.candidate : {}),
        repository: 'linktrend/LiNKsites',
        issue: 301,
        commit: args['candidate-commit'] || input.candidate?.commit,
        tree: args['candidate-tree'] || input.candidate?.tree,
      },
    }
  }
  const result = evaluateConsumerProof(input)
  const rendered = `${JSON.stringify(result, null, 2)}\n`
  if (args.output) writeFileSync(resolve(String(args.output)), rendered)
  process.stdout.write(rendered)
  process.exit(exitCodeFor(result))
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) main()
