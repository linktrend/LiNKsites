import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@payloadcms/ui/providers/Auth'
import { useConfig } from '@payloadcms/ui/providers/Config'
import { useAdminToast } from '@/admin/components/AdminToastProvider'
import { usePersistentSelection } from '@/admin/hooks/usePersistentSelection'
import { formatError, isTransientError, withRetry } from '@/admin/utils/errors'
import { hasPermission } from '@/utils/resolvePermissions'
import { PermissionFlag } from '@/utils/permissions'
import type { User } from '@/payload-types'

interface SiteOption {
  id: string
  name: string
}

interface SiteSelectorProps {
  value?: string
  onChange: (siteId: string) => void
  persistKey?: string
  queryParam?: string
  disabled?: boolean
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({
  value,
  onChange,
  persistKey = 'admin.site',
  queryParam = 'site',
  disabled,
}) => {
  const { user } = useAuth()
  const { config } = useConfig()
  const { pushToast } = useAdminToast()
  const serverURL = config.serverURL ?? ''
  const [options, setOptions] = useState<SiteOption[]>([])
  const [loading, setLoading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [persistedSite, setPersistedSite, { ready }] = usePersistentSelection<string>({
    storageKey: persistKey,
    queryParam,
  })

  const assignedSiteIds = useMemo(() => {
    if (!Array.isArray(user?.assignedSites)) {
      return []
    }

    return user.assignedSites
      .map((site) => {
        if (!site) return null
        if (typeof site === 'string') return site
        if (typeof site === 'object' && site.id) return site.id
        return null
      })
      .filter((id): id is string => Boolean(id))
  }, [user])

  const canManageAllSites = useMemo(() => {
    return hasPermission(user as unknown as User, PermissionFlag.MANAGE_SITES)
  }, [user])

  useEffect(() => {
    if (!user) return

    const controller = new AbortController()
    setLoading(true)
    setInlineError(null)

    withRetry(
      async () => {
        const response = await fetch(
          `${serverURL}/api/sites?limit=200&depth=0&select[id]=true&select[name]=true&select[domain]=true`,
          {
            credentials: 'include',
            signal: controller.signal,
          },
        )
        if (!response.ok) {
          const formatted = await formatError('Failed to load sites', response)
          throw formatted
        }
        const payload = (await response.json()) as { docs?: { id: string; name?: string; domain?: string }[] }
        const docs = payload?.docs || []
        // If user can manage all sites, show all sites; otherwise filter by assigned sites
        const filtered = canManageAllSites 
          ? docs 
          : docs.filter((doc) => {
              if (assignedSiteIds.length === 0) return true
              return assignedSiteIds.includes(doc.id)
            })
        setOptions(
          filtered.map((doc) => ({
            id: doc.id,
            name: doc.name || doc.domain || `Site ${doc.id}`,
          })),
        )
      },
      { retries: 2, delayMs: 400 },
    ).catch((err: unknown) => {
      const normalized = err && typeof err === 'object' && 'message' in (err as Record<string, unknown>)
        ? (err as { message: string; status?: number })
        : null
      const message = normalized?.message || 'Unable to load sites'
      setInlineError(message)
      pushToast({
        tone: normalized?.status && isTransientError(normalized.status) ? 'info' : 'error',
        title: 'Site load failed',
        description: message,
      })
    }).finally(() => setLoading(false))

    return () => controller.abort()
  }, [assignedSiteIds, canManageAllSites, pushToast, serverURL, user])

  useEffect(() => {
    if (!ready) return
    const effective = value ?? persistedSite
    if (effective) {
      onChange(effective)
      return
    }

    if (!value && options.length > 0) {
      const next = options[0]?.id
      if (next) {
        setPersistedSite(next)
        onChange(next)
      }
    }
  }, [onChange, options, persistedSite, ready, setPersistedSite, value])

  if (loading && options.length === 0) {
    return (
      <div style={{ padding: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--theme-text)' }}>Loading sites…</p>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div style={{ padding: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--theme-text)' }}>
          No sites assigned to your user.
        </p>
        {inlineError && (
          <p style={{ color: 'var(--theme-error-500)', marginTop: '0.25rem', fontSize: '0.75rem' }}>
            {inlineError}
          </p>
        )}
      </div>
    )
  }

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--theme-text)' }}>Site</span>
      <div style={{ position: 'relative' }}>
        <select
          aria-label="Select site"
          value={value || persistedSite || (canManageAllSites ? '__all__' : options[0]?.id)}
          onChange={(event) => {
            setPersistedSite(event.target.value)
            onChange(event.target.value)
          }}
          disabled={disabled || loading}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--theme-elevation-150)',
            backgroundColor: disabled ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-50)',
            color: 'var(--theme-text)',
            width: '100%',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
          }}
        >
          {canManageAllSites && (
            <option value="__all__">All Sites</option>
          )}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {loading && (
          <span style={{ 
            position: 'absolute', 
            right: '2.5rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            fontSize: '0.75rem',
            color: 'var(--theme-text-secondary)'
          }}>
            ⟳
          </span>
        )}
        {inlineError && (
          <p style={{ 
            color: 'var(--theme-error-500)', 
            marginTop: '0.25rem', 
            fontSize: '0.75rem',
            margin: '0.25rem 0 0 0'
          }}>
            {inlineError}
          </p>
        )}
      </div>
    </label>
  )
}

export default SiteSelector
