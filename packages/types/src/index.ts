export type LocaleCode =
  | 'en'
  | 'es'
  | 'zh-tw'
  | 'zh-TW'
  | 'zh-cn'
  | 'zh-CN'
export type SiteId = string

/**
 * Shared data-contract version marker, per
 * docs/archive/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md: every data
 * contract carries an explicit MAJOR.MINOR schema_version, not a full
 * semver triple (that's reserved for npm package versions). Lives here
 * (packages/types) as the single canonical source so every contract
 * package (program-ledger, factory-catalog, etc.) imports the same type
 * rather than each declaring its own copy.
 */
export interface SchemaVersion {
  major: number
  minor: number
}

export { supabaseSchema, cmsSchemaMapping } from './data-contract'
