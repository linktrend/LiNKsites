export type OwningSiteIdentity = {
  id?: string | number
  orgId?: unknown
}

export function owningSiteMatchesTenant(
  requestedSiteId: string,
  tenantOrgId: string,
  site: OwningSiteIdentity,
): boolean {
  const owningOrgId = typeof site.orgId === 'string' ? site.orgId : ''
  return String(site.id) === requestedSiteId && owningOrgId.length > 0 && owningOrgId === tenantOrgId
}
