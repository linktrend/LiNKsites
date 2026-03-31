import React, { useMemo, useRef, useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'

export interface DocumentSummary {
  id: string
  title: string
  status?: string
  updatedAt?: string
  collectionSlug: string
  autoApproved?: boolean
  lastModifiedBy?: string
}

interface DocumentListTableProps {
  documents: DocumentSummary[]
  sort?: { field: keyof Pick<DocumentSummary, 'title' | 'status' | 'updatedAt'>; direction: 'asc' | 'desc' }
  onSortChange?: (next: { field: keyof Pick<DocumentSummary, 'title' | 'status' | 'updatedAt'>; direction: 'asc' | 'desc' }) => void
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  loading?: boolean
  optimisticStatuses?: Record<string, 'pending' | 'error'>
  filterPlaceholder?: string
  onFilterChange?: (next: string) => void
}

const headerStyle: React.CSSProperties = { textAlign: 'left', padding: '0.5rem' }
const buttonStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#e5ecfa',
  cursor: 'pointer',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
}

export const DocumentListTable: React.FC<DocumentListTableProps> = ({
  documents,
  sort,
  onSortChange,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  loading,
  optimisticStatuses,
  filterPlaceholder = 'Filter by title…',
  onFilterChange,
}) => {
  const [localFilter, setLocalFilter] = useState('')
  const filterTimer = useRef<number | undefined>(undefined)

  React.useEffect(
    () => () => {
      if (filterTimer.current) {
        window.clearTimeout(filterTimer.current)
      }
    },
    [],
  )

  const sorted = useMemo(() => {
    const base = [...documents]
    if (sort) {
      base.sort((a, b) => {
        const aValue = (a[sort.field] ?? '') as string
        const bValue = (b[sort.field] ?? '') as string
        const comparison = String(aValue).localeCompare(String(bValue))
        return sort.direction === 'asc' ? comparison : -comparison
      })
    }
    if (localFilter.trim().length === 0) return base
    return base.filter((doc) => doc.title.toLowerCase().includes(localFilter.trim().toLowerCase()))
  }, [documents, localFilter, sort])

  const totalPages = total && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : undefined

  if (!documents.length && !loading) {
    return <p style={{ opacity: 0.8 }}>No content found for this site.</p>
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Filter</span>
          <input
            type="search"
            placeholder={filterPlaceholder}
            defaultValue={localFilter}
            onChange={(event) => {
              const next = event.target.value
              setLocalFilter(next)
              if (filterTimer.current) {
                window.clearTimeout(filterTimer.current)
              }
              filterTimer.current = window.setTimeout(() => onFilterChange?.(next), 250)
            }}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.04)',
              color: '#f4f8ff',
            }}
          />
        </label>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={headerStyle}>
              <button
                type="button"
                style={buttonStyle}
                onClick={() =>
                  onSortChange?.({
                    field: 'title',
                    direction: sort?.field === 'title' && sort.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                Title {sort?.field === 'title' ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
              </button>
            </th>
            <th style={headerStyle}>
              <button
                type="button"
                style={buttonStyle}
                onClick={() =>
                  onSortChange?.({
                    field: 'status',
                    direction: sort?.field === 'status' && sort.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                Status {sort?.field === 'status' ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
              </button>
            </th>
            <th style={headerStyle}>
              <button
                type="button"
                style={buttonStyle}
                onClick={() =>
                  onSortChange?.({
                    field: 'updatedAt',
                    direction: sort?.field === 'updatedAt' && sort.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                Updated {sort?.field === 'updatedAt' ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
              </button>
            </th>
            <th style={headerStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((doc) => {
            const optimisticState = optimisticStatuses?.[doc.id]
            return (
              <tr key={`${doc.collectionSlug}-${doc.id}`}>
                <td style={{ padding: '0.5rem', fontWeight: 600 }}>
                  {doc.title || doc.id}
                  {optimisticState === 'pending' && (
                    <span style={{ marginLeft: '0.35rem', fontSize: '0.8rem', opacity: 0.7 }}>(updating…)</span>
                  )}
                  {optimisticState === 'error' && (
                    <span style={{ marginLeft: '0.35rem', fontSize: '0.8rem', color: '#ffb4b4' }}>(failed)</span>
                  )}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <StatusBadge status={doc.status || 'draft'} autoApproved={doc.autoApproved} />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : '—'}
                  {doc.lastModifiedBy && (
                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.65 }}>
                      by {doc.lastModifiedBy}
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <a
                    href={`/admin/collections/${doc.collectionSlug}/${doc.id}`}
                    style={{ color: '#00bcd4', fontWeight: 600 }}
                  >
                    Edit
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {totalPages && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <button
            className="btn btn--secondary"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange?.(page - 1)}
            aria-label="Previous page"
          >
            Previous
          </button>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Page {page} {total ? `of ${totalPages}` : ''}
          </div>
          <button
            className="btn btn--secondary"
            disabled={totalPages ? page >= totalPages || loading : true}
            onClick={() => onPageChange?.(page + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default DocumentListTable
