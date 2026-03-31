'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Globe } from 'lucide-react'

export const TranslationQueueWidget: React.FC = () => {
  // Mock data
  const stats = {
    pending: 12,
    inProgress: 5,
    completedToday: 3
  }

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Translation Queue</CardTitle>
        <Globe className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{stats.pending}</span>
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{stats.inProgress}</span>
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
          </div>
          
          <div className="pt-2">
             <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                <span>Completed Today</span>
                <Badge variant="secondary" className="bg-green-500/15 text-green-600 hover:bg-green-500/25">
                  {stats.completedToday}
                </Badge>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
