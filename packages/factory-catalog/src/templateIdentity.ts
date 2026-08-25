/**
 * Canonical template identities used by the LiNKsites factory.
 *
 * The identity is deliberately separate from a release version. A site or
 * receipt may select another version of the same template without changing
 * the template's stable identity.
 */
export const MASTER_TEMPLATE_ID = 'master-template-type-1' as const
export const MASTER_TEMPLATE_VERSION = '2.0.0-a1.1' as const
export const MASTER_TEMPLATE_SOURCE_COMMIT_SHA = '1635a64f1d90efd049c959a7cf38ebac7ccbfdac' as const
export const MASTER_TEMPLATE_SOURCE_TREE_SHA = '873c4acc582050b416fb5a8bc59990345711df46' as const
export const LEGACY_MARKETING_TEMPLATE_ID = 'marketing-smb-v1' as const

export type TemplateId = string
