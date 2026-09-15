const CODEGEN_DATABASE_URI = 'postgresql://' + '127.0.0.1:5432/linksites_build'
const GAP43_TEST_PLACEHOLDER = /^ltfx\.db\.uri\.postgres(ql)?\./

export const resolveDatabaseUri = (
  configuredDatabaseUri: string | undefined,
  isPayloadCodegen: boolean,
): string | undefined => {
  if (isPayloadCodegen && configuredDatabaseUri && GAP43_TEST_PLACEHOLDER.test(configuredDatabaseUri)) {
    return CODEGEN_DATABASE_URI
  }

  return configuredDatabaseUri ?? (isPayloadCodegen ? CODEGEN_DATABASE_URI : undefined)
}
