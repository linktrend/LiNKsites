'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Clock } from 'lucide-react'

export const WorkflowStatusWidget: React.FC = () => {
  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Workflow Bottlenecks</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
         <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">Review</Badge>
                <span className="text-sm font-medium">Awaiting Approval</span>
              </div>
              <span className="text-xl font-bold">4</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500 text-blue-600">Draft</Badge>
                <span className="text-sm font-medium">In Drafting</span>
              </div>
              <span className="text-xl font-bold">8</span>
            </div>

            <div className="h-[1px] w-full bg-border my-2" />
            
            <div className="text-xs text-muted-foreground text-center">
              Avg. Time to Publish: <span className="font-mono text-foreground">2.4 days</span>
            </div>
         </div>
      </CardContent>
    </Card>
  )
}
