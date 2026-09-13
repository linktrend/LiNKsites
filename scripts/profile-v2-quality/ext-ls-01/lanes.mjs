/** EXT-LS-01 consumer proof lanes. Verdicts are PASS, HOLD, or FAIL only. */

export const GATE_ID = 'EXT-LS-01'
export const LAYOUT_ID = 'a1'
export const PLAN_IDS = Object.freeze(['a', 'b', 'c', 'l'])
export const PLAN_CAPACITIES = Object.freeze({ a: 30, b: 15, c: 6, l: 0 })
export const ENTRY_ID = 'master-template-type-1'
export const RELEASE_VERSION = '2.0.0-a1.1'

/** Provider identities consumed only as comparison pins. No provider checkout. */
export const EXPECTED_PROVIDER_PIN = Object.freeze({
  protectedDevelopmentCommit: '998c02c29fae5acc429804d7e03dcc74df7e7a52',
  protectedDevelopmentTree: '63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3',
  artifactTreeSha1: '6aadb2dff52efe30f512ddb2a5510a881fc027e2',
  manifestSha256: 'b4e0b141631694101b8daf5494499160b31e2ba6cbe66d0ec622f9690d567026',
  inventorySha256: '29262c08e9db2797ff292dc8179965c0ed080064a0b71d1bb477c4e0d63f0f72',
  dependencyLockSha256: '59f4db72af5de4731c68ee44b525f494c6cd067b42f8da310c345829f1b09c23',
  payloadProjectionSha256: '884eaaa612a25167c84eb77dd271ee1413dabe6f08c56dc65464c5b464d2e4d6',
  releaseReceiptSha256: '9e53946b4dadcec3e939bd1f42bb41b1d8851d29ac7c2de3f4a66dcdd9ce1021',
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
