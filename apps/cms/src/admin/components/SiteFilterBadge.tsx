'use client'

import React, { useEffect, useState } from 'react'

/**
 * SiteFilterBadge - Visual indicator for active site filtering
 * 
 * This component displays a badge showing which site is currently being filtered.
 * It reads the site parameter from the URL and fetches the site name to display.
 */
export const SiteFilterBadge: React.FC = () => {
  const [siteName, setSiteName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Read site parameter from URL
    const url = new URL(window.location.href)
    const siteId = url.searchParams.get('site')

    if (!siteId || siteId === '__all__') {
      setSiteName(null)
      return
    }

    // Fetch site name
    setLoading(true)
    fetch(`/api/sites/${siteId}?depth=0`)
      .then((res) => res.json())
      .then((data) => {
        if (data.name) {
          setSiteName(data.name)
        } else if (data.domain) {
          setSiteName(data.domain)
        } else {
          setSiteName(`Site ${siteId}`)
        }
      })
      .catch(() => {
        setSiteName(`Site ${siteId}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (!siteName && !loading) {
    return null
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '0.375rem',
        backgroundColor: 'var(--theme-elevation-100)',
        border: '1px solid var(--theme-elevation-200)',
        fontSize: '0.875rem',
        color: 'var(--theme-text)',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'var(--theme-success-500)',
        }}
      />
      {loading ? (
        <span style={{ color: 'var(--theme-text-secondary)' }}>Loading...</span>
      ) : (
        <>
          <span style={{ fontWeight: 500 }}>Filtering:</span>
          <span>{siteName}</span>
        </>
      )}
    </div>
  )
}

export default SiteFilterBadge
