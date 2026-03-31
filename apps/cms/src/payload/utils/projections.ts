const CORE_FIELDS = [
  'id',
  'title',
  'name',
  'slug',
  'status',
  '_status',
  'site',
  'locale',
  'createdAt',
  'updatedAt',
] as const

const WORKFLOW_FIELDS = ['reviewState', 'translationState'] as const

type ProjectionField = (typeof CORE_FIELDS)[number] | (typeof WORKFLOW_FIELDS)[number] | string

type ProjectionOptions = {
  include?: ProjectionField[]
  exclude?: ProjectionField[]
  includeWorkflow?: boolean
}

const toSet = (fields: ProjectionField[] = []): Set<ProjectionField> => new Set(fields)

/**
 * Build the minimal field list used across list/queue endpoints.
 */
export const buildProjection = (options: ProjectionOptions = {}): ProjectionField[] => {
  const base = new Set<ProjectionField>(CORE_FIELDS)
  if (options.includeWorkflow) {
    WORKFLOW_FIELDS.forEach((field) => base.add(field))
  }

  const include = toSet(options.include)
  include.forEach((field) => base.add(field))

  const exclude = toSet(options.exclude)
  exclude.forEach((field) => base.delete(field))

  return Array.from(base)
}

/**
 * Append projection fields to a URLSearchParams instance using Payload's `select[field]=true` syntax.
 */
export const applyProjectionToParams = (
  params: URLSearchParams,
  options: ProjectionOptions = {},
): URLSearchParams => {
  const projection = buildProjection(options)
  projection.forEach((field) => params.set(`select[${field}]`, 'true'))
  return params
}

/**
 * Convenience helper that returns a new URLSearchParams with projection already applied.
 */
export const createProjectionParams = (options: ProjectionOptions = {}): URLSearchParams => {
  const params = new URLSearchParams()
  return applyProjectionToParams(params, options)
}

/**
 * Default query options for localized list queries.
 * Enforces shallow depth and no fallback locale expansion to avoid redundant reads.
 */
export const DEFAULT_LOCALE_QUERY = {
  depth: 1 as const,
  fallbackLocale: false as const,
}
