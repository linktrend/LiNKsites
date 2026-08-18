/**
 * Step 3 preview seam — unused stub.
 *
 * A later proof-only flag, parallel to LINKSITES_W2_04_LOCAL_PROOF, would seed
 * projected master-template starter pages into disposable Payload and reuse
 * `/en/demo/<token>`. This module does not start that harness, does not admit
 * the draft, and does not treat marketing-smb-v1 as the master.
 */
export const MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF_FLAG =
  'LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF' as const

export const W2_04_LOCAL_PROOF_FLAG = 'LINKSITES_W2_04_LOCAL_PROOF' as const
export const LEGACY_LOCAL_PROOF_TEMPLATE_ID = 'marketing-smb-v1' as const

export interface MasterTemplatePreviewSeam {
  mode: 'preview_seam_stub'
  implemented: false
  productionSelectable: false
  parallelTo: typeof W2_04_LOCAL_PROOF_FLAG
  proofFlag: typeof MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF_FLAG
  wouldReuseRoute: '/en/demo/<token>'
  wouldSeed: 'projected starter pages into disposable Payload'
  notTheOldDemo: true
  oldDemoTemplateId: typeof LEGACY_LOCAL_PROOF_TEMPLATE_ID
}

export function describeMasterTemplatePreviewSeam(): MasterTemplatePreviewSeam {
  return {
    mode: 'preview_seam_stub',
    implemented: false,
    productionSelectable: false,
    parallelTo: W2_04_LOCAL_PROOF_FLAG,
    proofFlag: MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF_FLAG,
    wouldReuseRoute: '/en/demo/<token>',
    wouldSeed: 'projected starter pages into disposable Payload',
    notTheOldDemo: true,
    oldDemoTemplateId: LEGACY_LOCAL_PROOF_TEMPLATE_ID,
  }
}

/** Always false until step 3 implements the disposable harness. */
export function isMasterTemplateLookAndFeelProofHarnessEnabled(
  env: NodeJS.ProcessEnv = process.env,
): false {
  void env[MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF_FLAG]
  return false
}
