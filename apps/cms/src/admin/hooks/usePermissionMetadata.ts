import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@payloadcms/ui/providers/Auth'
import type { User } from '@/payload-types'
import { PermissionFlag } from '@/utils/permissions'
import { hasLocaleAccess, resolvePermissions } from '@/utils/resolvePermissions'

export type PermissionMetadata = {
  canPublish: boolean
  canApprove: boolean
  canDelete: boolean
  canUpdate: boolean
  canTranslate: boolean
  loading: boolean
}

const cache: Record<string, PermissionMetadata> = {}

export const usePermissionMetadata = (siteId?: string, locale?: string): PermissionMetadata => {
  const { user } = useAuth()
  const cacheKey = useMemo(() => `${siteId || 'global'}:${locale || 'default'}`, [locale, siteId])
  const [state, setState] = useState<PermissionMetadata>(() => cache[cacheKey] ?? {
    canPublish: false,
    canApprove: false,
    canDelete: false,
    canUpdate: false,
    canTranslate: false,
    loading: true,
  })
  const resolvedOnce = useRef(false)

  useEffect(() => {
    let cancelled = false
    const compute = () => {
      if (cancelled) return
      const typedUser = (user as unknown as User | null) ?? null
      const permissions = resolvePermissions(typedUser, siteId)
      const localeAllowed = locale ? hasLocaleAccess(typedUser, locale) : true
      const next: PermissionMetadata = {
        canPublish: localeAllowed && permissions[PermissionFlag.PUBLISH],
        canApprove: localeAllowed && permissions[PermissionFlag.APPROVE],
        canDelete: localeAllowed && permissions[PermissionFlag.DELETE],
        canUpdate: localeAllowed && permissions[PermissionFlag.UPDATE],
        canTranslate:
          localeAllowed && (permissions[PermissionFlag.UPDATE] || permissions[PermissionFlag.PUBLISH]),
        loading: false,
      }
      cache[cacheKey] = next
      setState(next)
      resolvedOnce.current = true
    }

    compute()
    return () => {
      cancelled = true
    }
  }, [cacheKey, locale, siteId, user])

  return state
}
