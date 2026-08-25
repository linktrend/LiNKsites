/** EXT-LS-01 consumer proof lanes. Verdicts are PASS, HOLD, or FAIL only. */

export const GATE_ID = 'EXT-LS-01'
export const LAYOUT_ID = 'a1'
export const PLAN_IDS = Object.freeze(['a', 'b', 'c', 'l'])
export const PLAN_CAPACITIES = Object.freeze({ a: 30, b: 15, c: 6, l: 0 })
export const ENTRY_ID = 'master-template-type-1'
export const RELEASE_VERSION = '2.0.0-a1.1'

/** Provider identities consumed only as comparison pins. No provider checkout. */
export const EXPECTED_PROVIDER_PIN = Object.freeze({
  protectedDevelopmentCommit: '1c3eb99b640483e1a66421ab6c118a17309c4568',
  protectedDevelopmentTree: '2e75c3350939d1a66876dd61c57b0dc09f652dce',
  artifactTreeSha1: 'a8c6c23fd41a5f0eb9221276998f96862a50119f',
  manifestSha256: 'd681e5305b611aa5247a0fa1711ce75e0a1734e121e6790e50c802b26c1c9697',
  inventorySha256: 'ad743168022139e7e70bd38ae19c56503cdfc2c4fcc912ece154f4f17b70cc98',
  dependencyLockSha256: '59f4db72af5de4731c68ee44b525f494c6cd067b42f8da310c345829f1b09c23',
  payloadProjectionSha256: 'b096c013b53edf6fbb30e7794830ec462a5ff47c5b085d43218e91541e0af84a',
  releaseReceiptSha256: '2668e0df4d317c4a0d4c9fbd1be7fe5f70f7024195bb310c8644849bf949de57',
})

export const LANES = Object.freeze([
  'materialization_without_provider_checkout',
  'resolver_plan_a',
  'resolver_plan_b',
  'resolver_plan_c',
  'resolver_plan_l',
  'payload_projection',
  'server_html',
  'browser',
  'accessibility',
  'visual',
  'link',
  'seo',
  'privacy',
  'existing_site_pin_and_rollback',
])

export const FORBIDDEN_OVERALL_VERDICTS = Object.freeze([
  'ACCEPT',
  'ACCEPTED',
  'ADMITTED',
  'SELECTABLE',
  'PRODUCTION',
  'PRODUCTION_READY',
  'PROVIDER_CONFORMANCE',
  'PROTECTED_INTEGRATION',
  'PROTECTED_INTEGRATED',
])

export const HOLD_PROVIDER_OR_A1_ABSENT = 'provider_or_a1_receipt_absent'
export const HOLD_LANE_EVIDENCE_ABSENT = 'lane_evidence_absent'
