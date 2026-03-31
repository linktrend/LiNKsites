import React, { createContext, useContext, useMemo, useState } from 'react'

interface SiteSelectorContextValue {
  siteId?: string
  setSiteId: (next?: string) => void
}

const SiteSelectorContext = createContext<SiteSelectorContextValue | null>(null)

export const SiteSelectorProvider: React.FC<{
  initialSiteId?: string
  children: React.ReactNode
}> = ({ initialSiteId, children }) => {
  const [siteId, setSiteId] = useState<string | undefined>(initialSiteId)
  const value = useMemo(
    () => ({
      siteId,
      setSiteId,
    }),
    [siteId],
  )

  return <SiteSelectorContext.Provider value={value}>{children}</SiteSelectorContext.Provider>
}

export const useSiteSelector = (): SiteSelectorContextValue => {
  const context = useContext(SiteSelectorContext)

  if (!context) {
    throw new Error('useSiteSelector must be used within a SiteSelectorProvider')
  }

  return context
}

export const useOptionalSiteSelector = (): SiteSelectorContextValue | null => {
  return useContext(SiteSelectorContext)
}
