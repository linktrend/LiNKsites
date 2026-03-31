'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useConfig } from '@payloadcms/ui/providers/Config'
import { AdminViewShell } from '@/admin/components/AdminViewShell'
import { useAdminToast } from '@/admin/components/AdminToastProvider'
import { usePersistentSelection } from '@/admin/hooks/usePersistentSelection'
import { formatError, isTransientError, withRetry } from '@/admin/utils/errors'
import { ModerationActions } from '@/components/ModerationActions'
import { SiteSelector } from '@/components/SiteSelector'
import { StatusBadge } from '@/components/StatusBadge'
import { applyProjectionToParams } from '@/payload/utils/projections'

type SubmittedBy =
  | { email?: string; id?: string | number }
  | string
  | null
  | undefined

type PendingDoc = {
  id: string
  title?: string
  name?: string
  slug?: string
  updatedAt?: string
  submittedBy?: SubmittedBy
  status?: string
  autoApproved?: boolean
}

interface QueueItem {
  id: string
  title: string
  collectionSlug: string
  updatedAt?: string
  submittedBy?: SubmittedBy
  status?: string
  autoApproved?: boolean
}

const approvalCollections = [
  { slug: 'offer-pages', label: 'Offers' },
  { slug: 'case-study-pages', label: 'Case Studies' },
  { slug: 'video-pages', label: 'Videos' },
  { slug: 'testimonials', label: 'Testimonials' },
]

const fetchPendingForCollection = async (
  serverURL: string,
  collectionSlug: string,
  siteId: string,
): Promise<QueueItem[]> => {
  const params = applyProjectionToParams(new URLSearchParams(), {
    includeWorkflow: true,
    include: ['submittedBy', 'autoApproved'],
  })
  params.set('limit', '50')
  params.set('depth', '1')
  params.set('fallbackLocale', 'false')
  params.set('where[status][equals]', 'pending')
  params.set('where[site][equals]', siteId)
  params.set('sort', 'updatedAt')

  const response = await fetch(`${serverURL}/api/${collectionSlug}?${params.toString()}`, {
    credentials: 'include',
  })
  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      errorText || `Failed to load pending ${collectionSlug.replace(/-/g, ' ')} items`,
    )
  }
  const payload = (await response.json()) as { docs?: PendingDoc[] }
  const docs: PendingDoc[] = payload?.docs || []
  return docs.map((doc) => ({
    id: doc.id,
    title: doc.title || doc.name || doc.slug || doc.id,
    updatedAt: doc.updatedAt,
    submittedBy: doc.submittedBy,
    collectionSlug,
    status: doc.status,
    autoApproved: doc.autoApproved,
  }))
}

export const ApprovalQueue: React.FC = () => {
  const { config } = useConfig()
  const serverURL = config.serverURL ?? ''
  const { pushToast } = useAdminToast()
  const [siteId, setSiteId] = usePersistentSelection<string>({
    storageKey: 'admin.site',
    queryParam: 'site',
  })
  const [workflowTab, setWorkflowTab] = usePersistentSelection<'approval' | 'translation' | 'all'>({
    storageKey: 'admin.workflowTab',
    queryParam: 'workflowTab',
    defaultValue: 'approval',
  })
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, 'pending' | 'error'>>({})

  const loadQueue = useCallback(() => {
    if (!siteId) {
      setItems([])
      return
    }
    setLoading(true)
    setError(null)
    let cancelled = false

    withRetry(
      async () => {
        const results = await Promise.all(
          approvalCollections.map((collection) =>
            fetchPendingForCollection(serverURL, collection.slug, siteId),
          ),
        )
        if (!cancelled) {
          setItems(results.flat())
          setOptimisticStatuses({})
        }
      },
      { retries: 2, delayMs: 350 },
    )
      .catch(async (err) => {
        if (cancelled) return
        const formatted =
          'status' in (err as Record<string, unknown>) || 'message' in (err as Record<string, unknown>)
            ? await formatError(err as Error)
            : { message: 'Unable to load the approval queue right now.' }
        console.error('Failed to load approval queue', err)
        setError(formatted.message)
        pushToast({
          tone: isTransientError((formatted as { status?: number }).status) ? 'info' : 'error',
          title: 'Queue load failed',
          description: formatted.message,
        })
        setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [pushToast, serverURL, siteId])

  useEffect(() => {
    const cancel = loadQueue()
    return cancel
  }, [loadQueue])

  const tabContent = useMemo(
    () => ({
      approval: 'Approval',
      translation: 'Translation',
      all: 'All',
    }),
    [],
  )

  return (
    <AdminViewShell name="Approval Queue">
      <div style={{ padding: '2rem', color: '#f4f8ff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Approval Queue</h1>
            <p style={{ opacity: 0.7 }}>
              Editors push content into this queue for review before it goes live.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              {(['approval', 'translation', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  className="btn btn--secondary"
                  aria-pressed={workflowTab === tab}
                  onClick={() => setWorkflowTab(tab)}
                  style={{
                    opacity: workflowTab === tab ? 1 : 0.7,
                    border:
                      workflowTab === tab ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {tabContent[tab]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ minWidth: '18rem' }}>
            <SiteSelector value={siteId} onChange={setSiteId} />
          </div>
        </div>

        {workflowTab !== 'approval' && (
          <p style={{ marginTop: '1rem', opacity: 0.8 }}>
            Showing approval queue only. Switch tabs above to persist your preference when navigating.
          </p>
        )}

        {loading && <p>Loading pending entries…</p>}

        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: 'rgba(239, 83, 80, 0.15)',
              border: '1px solid rgba(239, 83, 80, 0.35)',
            }}
          >
            <p style={{ margin: 0, color: '#ffb4b4' }}>{error}</p>
          </div>
        )}

        {!siteId && !loading && (
          <p style={{ marginTop: '1.5rem', opacity: 0.8 }}>Select a site to view submissions.</p>
        )}

        {!loading && items.length === 0 && siteId && (
          <p style={{ marginTop: '2rem', opacity: 0.8 }}>No pending entries for this site.</p>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item) => (
            <div
              key={`${item.collectionSlug}-${item.id}`}
              style={{
                padding: '1rem',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.6 }}>
                    {item.collectionSlug}
                  </p>
                  <h3 style={{ margin: 0 }}>{item.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={item.status || 'pending'} autoApproved={item.autoApproved} />
                  <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                    Updated {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
                  </span>
                  {optimisticStatuses[item.id] === 'pending' && (
                    <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>Updating…</span>
                  )}
                  {optimisticStatuses[item.id] === 'error' && (
                    <span style={{ fontSize: '0.8rem', color: '#ffb4b4' }}>Failed</span>
                  )}
                </div>
              </div>
              {item.submittedBy && (
                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>
                  Submitted by{' '}
                  {typeof item.submittedBy === 'string'
                    ? item.submittedBy
                    : item.submittedBy?.email || item.submittedBy?.id || 'an editor'}
                </p>
              )}
              <ModerationActions
                collectionSlug={item.collectionSlug}
                docId={item.id}
                siteId={siteId}
                lastModified={item.updatedAt}
                lastModifiedBy={
                  typeof item.submittedBy === 'string'
                    ? item.submittedBy
                    : item.submittedBy?.email ||
                      (item.submittedBy?.id ? String(item.submittedBy.id) : undefined) ||
                      undefined
                }
                onActionComplete={loadQueue}
                onOptimisticState={(status, id) => {
                  setOptimisticStatuses((prev) => ({ ...prev, [id]: 'pending' }))
                  setItems((prev) =>
                    prev.map((existing) =>
                      existing.id === id
                        ? {
                            ...existing,
                            status: status === 'approved' ? 'approved' : 'draft',
                          }
                        : existing,
                    ),
                  )
                }}
                onOptimisticError={(id) => {
                  setOptimisticStatuses((prev) => ({ ...prev, [id]: 'error' }))
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </AdminViewShell>
  )
}

export default ApprovalQueue
