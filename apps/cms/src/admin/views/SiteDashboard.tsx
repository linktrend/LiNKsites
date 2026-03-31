'use client'

import React from 'react'
import { AdminViewShell } from '@/admin/components/AdminViewShell'
import { SiteSelector } from '@/components/SiteSelector'
import { SiteSelectorProvider, useOptionalSiteSelector } from '@/components/SiteSelectorContext'
import { usePersistentSelection } from '@/admin/hooks/usePersistentSelection'
import { StalenessMonitor } from '@/admin/components/StalenessMonitor'
import { TranslationQueueWidget } from '@/admin/components/TranslationQueueWidget'
import { WorkflowStatusWidget } from '@/admin/components/WorkflowStatusWidget'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Calendar } from 'lucide-react'

const SiteDashboardContent: React.FC = () => {
  const siteSelector = useOptionalSiteSelector()
  const [localSiteId, setLocalSiteId] = usePersistentSelection<string>({
    storageKey: 'admin.site',
    queryParam: 'site',
  })
  const siteId = siteSelector?.siteId ?? localSiteId
  const setSiteId = siteSelector?.setSiteId ?? setLocalSiteId

  return (
    <AdminViewShell name="Site Dashboard">
      <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
            <p className="text-muted-foreground mt-1">
              Manage content, workflows, and health for your sites.
            </p>
          </div>
          <div className="w-full md:w-72">
            <SiteSelector value={siteId} onChange={setSiteId} />
          </div>
        </div>

        {!siteId ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-muted/10">
            <p className="text-lg text-muted-foreground font-medium">Please select a site to view the command center.</p>
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               <TranslationQueueWidget />
               <WorkflowStatusWidget />
               <StalenessMonitor />
            </div>

            {/* Content Calendar Placeholder */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Content Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
                  <p className="text-muted-foreground">Calendar View Coming Soon</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminViewShell>
  )
}

export const SiteDashboard: React.FC = () => (
  <SiteSelectorProvider>
    <SiteDashboardContent />
  </SiteSelectorProvider>
)

export default SiteDashboard
