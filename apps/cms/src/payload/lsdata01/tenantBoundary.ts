export type OwningSiteIdentity = {
  id?: string | number
  orgId?: unknown
}

type TenantBoundaryInput = {
  data?: Record<string, unknown> | null
  user: unknown
  findOwningSite: (siteId: string, authenticatedUser: unknown) => Promise<OwningSiteIdentity>
}

const relationshipId = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return ''
}

export function owningSiteMatchesTenant(
  requestedSiteId: string,
  tenantOrgId: string,
  site: OwningSiteIdentity,
): boolean {
  const owningOrgId = typeof site.orgId === 'string' ? site.orgId : ''
  return String(site.id) === requestedSiteId && owningOrgId.length > 0 && owningOrgId === tenantOrgId
}

export async function assertOwningSiteTenantBoundary({
  data,
  user,
  findOwningSite,
}: TenantBoundaryInput): Promise<void> {
  const tenantOrgId = typeof data?.tenantOrgId === 'string' ? data.tenantOrgId : ''
  if (!tenantOrgId) throw new Error('Tenant authorization denied: tenantOrgId is required.')
  if (!user) throw new Error('Tenant authorization denied: unauthenticated actor.')

  const siteId = relationshipId(data?.site)
  if (!siteId) throw new Error('Tenant authorization denied: owning site is required.')

  const site = await findOwningSite(siteId, user)
  if (!owningSiteMatchesTenant(siteId, tenantOrgId, site)) {
    throw new Error('Tenant authorization denied: org boundary is fail-closed.')
  }
}
