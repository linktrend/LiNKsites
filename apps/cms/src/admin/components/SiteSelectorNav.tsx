'use client'

import React, { useCallback } from 'react'
import { SiteSelector } from '@/components/SiteSelector'
import { usePersistentSelection } from '@/admin/hooks/usePersistentSelection'

/**
 * SiteSelectorNav - Navigation wrapper for SiteSelector
 * 
 * This component integrates the SiteSelector into Payload's admin navigation.
 * It handles site selection changes and updates the URL to trigger collection filtering.
 */
export const SiteSelectorNav: React.FC = () => {
  const [siteId, setSiteId] = usePersistentSelection<string>({
    storageKey: 'admin.site',
    queryParam: 'site',
  })

  const handleSiteChange = useCallback((newSiteId: string) => {
    // Update the persistent selection (localStorage + URL)
    setSiteId(newSiteId)
    
    // Check if we're on a collection list view
    const currentPath = window.location.pathname
    const isCollectionView = currentPath.startsWith('/admin/collections/')
    
    if (isCollectionView) {
      // Update URL with new site parameter
      const url = new URL(window.location.href)
      url.searchParams.set('site', newSiteId)
      
      // Reload the page to apply the filter
      // Note: This is necessary because Payload's list views don't automatically
      // react to URL parameter changes without a reload
      window.location.href = url.toString()
    }
  }, [setSiteId])

  return (
    <div style={{ 
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--theme-elevation-150)',
      backgroundColor: 'var(--theme-elevation-0)'
    }}>
      <SiteSelector 
        value={siteId} 
        onChange={handleSiteChange}
        persistKey="admin.site"
        queryParam="site"
      />
    </div>
  )
}

export default SiteSelectorNav
