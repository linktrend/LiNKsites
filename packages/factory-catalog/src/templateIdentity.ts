/**
 * Canonical template identities used by the LiNKsites factory.
 *
 * The identity is deliberately separate from a release version. A site or
 * receipt may select another version of the same template without changing
 * the template's stable identity.
 */
export const MASTER_TEMPLATE_ID = 'master-template-type-1' as const
export const MASTER_TEMPLATE_VERSION = '1.0.0' as const
export const LEGACY_MARKETING_TEMPLATE_ID = 'marketing-smb-v1' as const

export type TemplateId = string
