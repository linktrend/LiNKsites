'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

const ApiKeyManager: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle')
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [docId, setDocId] = useState<string | null>(null)

  // Derive user ID from the admin URL: /admin/collections/users/<id>
  useEffect(() => {
    if (typeof window === 'undefined') return
    const parts = window.location.pathname.split('/').filter(Boolean)
    const maybeId = parts[parts.length - 1]
    if (maybeId && maybeId !== 'create') {
      setDocId(maybeId)
    } else {
      setDocId(null)
    }
  }, [])

  const canGenerate = useMemo(() => Boolean(docId), [docId])

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !docId) {
      setError('Save the user before generating an API key.')
      return
    }
    setStatus('loading')
    setError(null)
    setApiKey(null)
    try {
      const res = await fetch(`/api/users/${docId}/api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed with status ${res.status}`)
      }
      const body = (await res.json()) as { apiKey?: string }
      if (!body.apiKey) {
        throw new Error('API key not returned')
      }
      setApiKey(body.apiKey)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to generate API key')
    }
  }, [canGenerate, docId])

  const handleCopy = useCallback(async () => {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey)
      setStatus('success')
    } catch {
      setError('Failed to copy to clipboard')
      setStatus('error')
    }
  }, [apiKey])

  return (
    <div style={{ border: '1px solid var(--theme-elevation-100)', padding: '1rem', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <h4 style={{ margin: 0 }}>API Key</h4>
        <button
          type="button"
          className="btn btn--style-primary"
          onClick={handleGenerate}
          disabled={!canGenerate || status === 'loading'}
        >
          {status === 'loading' ? 'Generating…' : 'Generate'}
        </button>
      </div>
      <p style={{ marginTop: '0.5rem', marginBottom: '0.75rem', color: 'var(--theme-elevation-600)' }}>
        Generates a new API key for this user. Store it securely—this value is only shown once.
      </p>
      {apiKey && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            borderRadius: 6,
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-100)',
            wordBreak: 'break-all',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)' }}>{apiKey}</div>
          <button
            type="button"
            className="btn btn--style-secondary"
            style={{ marginTop: '0.5rem' }}
            onClick={handleCopy}
          >
            Copy
          </button>
        </div>
      )}
      {status === 'error' && error && (
        <div style={{ marginTop: '0.5rem', color: 'var(--theme-error-500)' }}>Error: {error}</div>
      )}
    </div>
  )
}

export default ApiKeyManager
