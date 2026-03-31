import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

type ToastTone = 'info' | 'success' | 'error'

export type ToastPayload = {
  id?: string
  title?: string
  description?: string
  tone?: ToastTone
  durationMs?: number
}

type ToastInternal = Required<Pick<ToastPayload, 'id'>> & Omit<ToastPayload, 'id'>

interface AdminToastContextValue {
  pushToast: (toast: ToastPayload) => string
  dismissToast: (id: string) => void
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null)

const toneStyles: Record<ToastTone, { background: string; border: string }> = {
  info: { background: 'rgba(33, 150, 243, 0.12)', border: '1px solid rgba(33, 150, 243, 0.4)' },
  success: { background: 'rgba(102, 187, 106, 0.14)', border: '1px solid rgba(102, 187, 106, 0.45)' },
  error: { background: 'rgba(239, 83, 80, 0.15)', border: '1px solid rgba(239, 83, 80, 0.5)' },
}

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)

export const AdminToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastInternal[]>([])
  const timers = useRef<Record<string, number>>({})

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timer = timers.current[id]
    if (timer) {
      window.clearTimeout(timer)
      delete timers.current[id]
    }
  }, [])

  const pushToast = useCallback(
    (toast: ToastPayload) => {
      const id = toast.id ?? randomId()
      const toastWithDefaults: ToastInternal = {
        id,
        tone: toast.tone ?? 'info',
        title: toast.title,
        description: toast.description,
        durationMs: toast.durationMs ?? 5500,
      }
      setToasts((prev) => [...prev.filter((item) => item.id !== id), toastWithDefaults])

      if (toastWithDefaults.durationMs && toastWithDefaults.durationMs > 0) {
        timers.current[id] = window.setTimeout(() => dismissToast(id), toastWithDefaults.durationMs)
      }
      return id
    },
    [dismissToast],
  )

  useEffect(
    () => () => {
      Object.values(timers.current).forEach((timer) => window.clearTimeout(timer))
    },
    [],
  )

  const value = useMemo(() => ({ pushToast, dismissToast }), [dismissToast, pushToast])

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        role="status"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 9999,
          maxWidth: '22rem',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '0.75rem 0.9rem',
              borderRadius: '0.75rem',
              color: '#f5f7fb',
              background: toneStyles[toast.tone ?? 'info'].background,
              border: toneStyles[toast.tone ?? 'info'].border,
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
            }}
          >
            {toast.title && <div style={{ fontWeight: 700, marginBottom: toast.description ? 4 : 0 }}>{toast.title}</div>}
            {toast.description && <div style={{ fontSize: '0.9rem', lineHeight: 1.35 }}>{toast.description}</div>}
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'transparent',
                border: 'none',
                color: '#f5f7fb',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  )
}

export const useAdminToast = (): AdminToastContextValue => {
  const ctx = useContext(AdminToastContext)
  if (!ctx) {
    throw new Error('useAdminToast must be used within AdminToastProvider')
  }
  return ctx
}
