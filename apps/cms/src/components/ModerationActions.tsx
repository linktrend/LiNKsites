import React, { useMemo, useState } from 'react'
import { useConfig } from '@payloadcms/ui/providers/Config'
import { AdminErrorBoundary } from '@/admin/components/AdminErrorBoundary'
import { useAdminToast } from '@/admin/components/AdminToastProvider'
import { usePermissionMetadata } from '@/admin/hooks/usePermissionMetadata'
import { useConcurrentEditGuard } from '@/admin/hooks/useConcurrentEditGuard'
import { formatError, isTransientError, withRetry } from '@/admin/utils/errors'
import { StatusBadge } from '@/components/StatusBadge'

interface ModerationActionsProps {
  collectionSlug: string
  docId: string
  siteId?: string
  lastModified?: string
  lastModifiedBy?: string
  onChange?: () => void
  onActionComplete?: () => void
  onOptimisticState?: (status: 'approved' | 'draft', docId: string) => void
  onOptimisticError?: (docId: string) => void
}

type UpdateStatusRequest = {
  status: 'approved' | 'draft'
}

export const ModerationActions: React.FC<ModerationActionsProps> = ({
  collectionSlug,
  docId,
  siteId,
  lastModified,
  lastModifiedBy,
  onChange,
  onActionComplete,
  onOptimisticState,
  onOptimisticError,
}) => {
  const { config } = useConfig()
  const { pushToast } = useAdminToast()
  const serverURL = config.serverURL ?? ''
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const permissions = usePermissionMetadata(siteId)
  const guard = useConcurrentEditGuard({ lastModified, lastModifiedBy })

  const disabledReason = useMemo(() => {
    if (!siteId) return 'Missing site context'
    if (permissions.loading) return 'Checking permissions'
    if (!permissions.canApprove) return 'You do not have permission to perform this action'
    return null
  }, [permissions.canApprove, permissions.loading, siteId])

  const fetchLatestSnapshot = async () => {
    const response = await fetch(
      `${serverURL}/api/${collectionSlug}/${docId}?depth=0&select[updatedAt]=true&select[updatedBy]=true`,
      { credentials: 'include' },
    )
    if (!response.ok) {
      const formatted = await formatError('Unable to check for newer edits', response)
      throw formatted
    }
    const body = (await response.json()) as {
      updatedAt?: string
      updatedBy?: { email?: string; id?: string } | string
    }
    const snapshot = {
      lastModified: body.updatedAt,
      lastModifiedBy:
        typeof body.updatedBy === 'string' ? body.updatedBy : body.updatedBy?.email || body.updatedBy?.id,
    }
    return guard.compare(snapshot)
  }

  const submit = async (status: 'approved' | 'draft') => {
    if (disabledReason) {
      pushToast({ tone: 'error', title: 'Action blocked', description: disabledReason })
      return
    }
    setSubmitting(status === 'approved' ? 'approve' : 'reject')
    setResult(null)
    setError(null)

    try {
      const snapshot = await fetchLatestSnapshot()
      if (snapshot.conflict) {
        setShowConflictModal(true)
        setSubmitting(null)
        return
      }

      onOptimisticState?.(status, docId)
      const payload: UpdateStatusRequest = { status }
      const response = await withRetry(
        async () =>
          fetch(`${serverURL}/api/${collectionSlug}/${docId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(siteId ? { 'x-site-id': siteId } : {}),
            },
            body: JSON.stringify(payload),
          }),
        { retries: 1, delayMs: 400 },
      )

      if (!response.ok) {
        const formatted = await formatError('Failed to update status', response)
        onOptimisticError?.(docId)
        setError(formatted.message)
        pushToast({
          tone: isTransientError(formatted.status) ? 'info' : 'error',
          title: 'Update failed',
          description: formatted.message,
        })
        return
      }
      const successMessage = status === 'approved' ? 'Approved successfully' : 'Moved back to draft'
      setResult({
        type: 'success',
        message: successMessage,
      })
      pushToast({
        tone: 'success',
        title: 'Status updated',
        description: successMessage,
      })
      onChange?.()
      onActionComplete?.()
      guard.updateBaseline({
        lastModified: new Date().toISOString(),
        lastModifiedBy,
      })
    } catch (err) {
      const formatted = await formatError(err)
      onOptimisticError?.(docId)
      console.error('Failed to update moderation status', err)
      setError(formatted.message)
      pushToast({
        tone: 'error',
        title: 'Update failed',
        description: formatted.message,
      })
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <AdminErrorBoundary name="Moderation Actions">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn--primary"
            disabled={submitting !== null || Boolean(disabledReason)}
            onClick={() => submit('approved')}
            aria-disabled={submitting !== null || Boolean(disabledReason)}
            title={disabledReason ?? undefined}
          >
            {submitting === 'approve' ? 'Approving…' : 'Approve'}
          </button>
          <button
            className="btn btn--secondary"
            disabled={submitting !== null || Boolean(disabledReason)}
            onClick={() => submit('draft')}
            aria-disabled={submitting !== null || Boolean(disabledReason)}
            title={disabledReason ?? undefined}
          >
            {submitting === 'reject' ? 'Reverting…' : 'Send back'}
          </button>
        </div>
        {(result || error) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusBadge status={error ? 'error' : result?.type === 'success' ? 'success' : 'error'} />
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{error || result?.message}</span>
          </div>
        )}
        {guard.warning && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.65rem',
              background: 'rgba(255, 214, 102, 0.12)',
              border: '1px solid rgba(255, 214, 102, 0.4)',
              fontSize: '0.9rem',
            }}
          >
            This document was updated by {guard.warning.lastModifiedBy || 'another user'} at{' '}
            {guard.warning.lastModified ? new Date(guard.warning.lastModified).toLocaleString() : 'an unknown time'}.
          </div>
        )}
        {showConflictModal && (
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
              <h3 style={{ marginTop: 0 }}>Newer changes detected</h3>
              <p style={{ opacity: 0.85 }}>
                This document was updated after you opened the page. Reload to avoid overwriting someone else&apos;s
                work?
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button className="btn btn--secondary" onClick={() => setShowConflictModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn--secondary"
                  onClick={() => {
                    setShowConflictModal(false)
                    onChange?.()
                  }}
                >
                  Reload latest first
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    setShowConflictModal(false)
                    void submit('approved')
                  }}
                >
                  Overwrite anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminErrorBoundary>
  )
}

export default ModerationActions
