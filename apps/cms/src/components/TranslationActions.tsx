import React, { useMemo, useState } from 'react'
import { useConfig } from '@payloadcms/ui/providers/Config'
import { useAdminToast } from '@/admin/components/AdminToastProvider'
import { usePermissionMetadata } from '@/admin/hooks/usePermissionMetadata'
import { useConcurrentEditGuard } from '@/admin/hooks/useConcurrentEditGuard'
import { formatError, withRetry } from '@/admin/utils/errors'
import { StatusBadge } from '@/components/StatusBadge'

type TranslationActionProps = {
  queueId: string
  collection: string
  docId: string
  sourceLocale: string
  targetLocale: string
  siteId?: string
  lastModified?: string
  lastModifiedBy?: string
  onChange?: () => void
  onOptimisticState?: (queueId: string) => void
  onOptimisticError?: (queueId: string) => void
}

type TranslationQueueUpdateRequest = {
  status: 'completed'
  action: 'manual_complete' | 'ai_complete'
  notes: string
  completedAt: string
}

const formatErrorMessage = async (response: Response): Promise<string> => {
  const fallback = 'Failed to update translation'
  try {
    const text = await response.text()
    return text || fallback
  } catch {
    return fallback
  }
}

export const TranslationActions: React.FC<TranslationActionProps> = ({
  queueId,
  collection,
  docId,
  targetLocale,
  sourceLocale: _sourceLocale,
  siteId,
  lastModified,
  lastModifiedBy,
  onChange,
  onOptimisticState,
  onOptimisticError,
}) => {
  const { config } = useConfig()
  const serverURL = config.serverURL ?? ''
  const { pushToast } = useAdminToast()
  const permissions = usePermissionMetadata(siteId, targetLocale)
  const guard = useConcurrentEditGuard({ lastModified, lastModifiedBy })
  const [loading, setLoading] = useState<'ai' | 'complete' | null>(null)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [conflictAction, setConflictAction] = useState<TranslationQueueUpdateRequest['action'] | null>(null)
  const disabledReason = useMemo(() => {
    if (!siteId) return 'Missing site context'
    if (permissions.loading) return 'Checking permissions'
    if (!permissions.canTranslate) return 'You do not have permission to perform this action'
    return null
  }, [permissions.canTranslate, permissions.loading, siteId])

  const fetchLatestSnapshot = async () => {
    const response = await fetch(
      `${serverURL}/api/translation-queue/${queueId}?depth=0&select[updatedAt]=true&select[updatedBy]=true`,
      { credentials: 'include' },
    )
    if (!response.ok) {
      const formatted = await formatError('Unable to check translation status', response)
      throw formatted
    }
    const body = (await response.json()) as { updatedAt?: string; updatedBy?: { email?: string; id?: string } | string }
    const snapshot = {
      lastModified: body.updatedAt,
      lastModifiedBy:
        typeof body.updatedBy === 'string' ? body.updatedBy : body.updatedBy?.email || body.updatedBy?.id,
    }
    return guard.compare(snapshot)
  }

  const runAction = async (action: TranslationQueueUpdateRequest['action'], options?: { force?: boolean }) => {
    const isAI = action === 'ai_complete'
    if (disabledReason) {
      pushToast({ tone: 'error', title: 'Action blocked', description: disabledReason })
      return
    }
    setLoading(isAI ? 'ai' : 'complete')
    setResult(null)
    onOptimisticState?.(queueId)

    try {
      if (!options?.force) {
        const snapshot = await fetchLatestSnapshot()
        if (snapshot.conflict) {
          setConflictAction(action)
          onOptimisticError?.(queueId)
          setLoading(null)
          return
        }
      }

      const response = await withRetry(
        async () =>
          fetch(`${serverURL}/api/translation-queue/${queueId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(siteId ? { 'x-site-id': siteId } : {}),
            },
            body: JSON.stringify({
              status: 'completed',
              action,
              notes: isAI ? 'AI translation generated' : 'Translation completed',
              completedAt: new Date().toISOString(),
            } satisfies TranslationQueueUpdateRequest),
          }),
        { retries: 1, delayMs: 400 },
      )

      if (!response.ok) {
        const errorText = await formatErrorMessage(response)
        onOptimisticError?.(queueId)
        throw new Error(errorText)
      }

      const successMessage = 'Translation merged and queue entry removed.'
      setResult({
        type: 'success',
        message: successMessage,
      })
      pushToast({ tone: 'success', title: 'Translation updated', description: successMessage })
      guard.updateBaseline({
        lastModified: new Date().toISOString(),
        lastModifiedBy,
      })
      onChange?.()
    } catch (error) {
      console.error('Failed to complete translation', error)
      onOptimisticError?.(queueId)
      const formatted = error instanceof Error ? error.message : 'Unable to complete translation. Please retry.'
      setResult({
        type: 'error',
        message: formatted,
      })
      pushToast({
        tone: 'error',
        title: 'Translation failed',
        description: formatted,
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn btn--secondary"
          onClick={() => runAction('ai_complete')}
          disabled={loading !== null || Boolean(disabledReason)}
          aria-label={`Mark ${collection} ${docId} as AI translated to ${targetLocale}`}
          title={disabledReason ?? undefined}
        >
          {loading === 'ai' ? 'Running…' : 'AI Complete'}
        </button>
        <button
          className="btn btn--primary"
          onClick={() => runAction('manual_complete')}
          disabled={loading !== null || Boolean(disabledReason)}
          aria-label={`Mark ${collection} ${docId} as translated to ${targetLocale}`}
          title={disabledReason ?? undefined}
        >
          {loading === 'complete' ? 'Saving…' : 'Mark as Translated'}
        </button>
      </div>
      {result && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusBadge status={result.type === 'success' ? 'completed' : 'error'} />
          <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{result.message}</span>
        </div>
      )}
      {conflictAction && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
          }}
        >
          <div
            style={{
              background: '#0b1f33',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.08)',
              maxWidth: '420px',
              width: '100%',
              color: '#f4f8ff',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Newer translation exists</h3>
            <p style={{ opacity: 0.85 }}>
              This queue entry changed after you opened it. Reload to avoid losing newer edits, or overwrite anyway.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button className="btn btn--secondary" onClick={() => setConflictAction(null)}>
                Cancel
              </button>
              <button
                className="btn btn--secondary"
                onClick={() => {
                  setConflictAction(null)
                  onChange?.()
                }}
              >
                Reload latest first
              </button>
              <button
                className="btn btn--primary"
                onClick={() => {
                  const actionToRetry = conflictAction
                  setConflictAction(null)
                  void runAction(actionToRetry ?? 'manual_complete', { force: true })
                }}
              >
                Overwrite anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TranslationActions
