import React from 'react'

interface StatusBadgeProps {
  status: string
  autoApproved?: boolean
}

const statusColors: Record<string, string> = {
  draft: '#546e7a',
  pending: '#fdd835',
  approved: '#26c6da',
  published: '#66bb6a',
  'auto-approved': '#42a5f5',
  rejected: '#ef5350',
  in_progress: '#ffb300',
  completed: '#66bb6a',
  success: '#66bb6a',
  error: '#ef5350',
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, autoApproved }) => {
  const normalized = status || 'draft'
  const displayStatus =
    autoApproved && normalized === 'published' ? ('auto-approved' as const) : normalized
  const color = statusColors[displayStatus] || '#90a4ae'
  return (
    <span
      style={{
        backgroundColor: color,
        color: '#061120',
        borderRadius: '999px',
        fontSize: '0.75rem',
        padding: '0.1rem 0.6rem',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {displayStatus.replace(/[-_]/g, ' ')}
    </span>
  )
}

export default StatusBadge
