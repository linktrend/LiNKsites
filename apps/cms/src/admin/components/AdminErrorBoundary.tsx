import React, { useMemo, useState } from 'react'
import { useAdminToast } from '@/admin/components/AdminToastProvider'
import { formatError } from '@/admin/utils/errors'

type BoundaryProps = {
  children: React.ReactNode
  name?: string
}

type BoundaryState = { error: Error | null }

class BoundaryImpl extends React.Component<
  BoundaryProps & { onReset: () => void; onError: (error: Error) => void },
  BoundaryState
> {
  override readonly state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  override componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  override render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            padding: '1rem',
            borderRadius: '0.85rem',
            border: '1px solid rgba(239, 83, 80, 0.6)',
            background: 'rgba(239, 83, 80, 0.12)',
            color: '#f7dede',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Something went wrong</div>
          <div style={{ opacity: 0.9, marginBottom: '0.75rem' }}>{this.state.error.message}</div>
          <button
            className="btn btn--secondary"
            onClick={() => {
              this.setState({ error: null })
              this.props.onReset()
            }}
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export const AdminErrorBoundary: React.FC<BoundaryProps> = ({ children, name }) => {
  const { pushToast } = useAdminToast()
  const [resetKey, setResetKey] = useState(0)

  const boundary = useMemo(
    () => (
      <BoundaryImpl
        key={resetKey}
        name={name}
        onReset={() => setResetKey((value) => value + 1)}
        onError={(error) => {
          void formatError(error).then((formatted) => {
            pushToast({
              tone: 'error',
              title: name ? `${name} failed` : 'Unexpected error',
              description: formatted.message,
            })
          })
        }}
      >
        {children}
      </BoundaryImpl>
    ),
    [children, name, pushToast, resetKey],
  )

  return boundary
}
