'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type StalePage = {
  id: string
  title: string
  updatedAt: string
  slug: string
  collection: string
}

// Mock data - in real implementation this would come from an API
const MOCK_STALE_PAGES: StalePage[] = [
  { id: '1', title: 'Terms of Service', updatedAt: '2023-01-15T00:00:00Z', slug: 'terms', collection: 'pages' },
  { id: '2', title: 'Privacy Policy', updatedAt: '2023-02-20T00:00:00Z', slug: 'privacy', collection: 'pages' },
  { id: '3', title: 'About Us', updatedAt: '2023-03-10T00:00:00Z', slug: 'about', collection: 'pages' },
]

export const StalenessMonitor: React.FC = () => {
  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Stale Content Monitor</CardTitle>
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Pages not updated in 90+ days.
          </p>
          <div className="space-y-2">
            {MOCK_STALE_PAGES.map((page) => (
              <div key={page.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="font-medium truncate max-w-[150px]">{page.title}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(page.updatedAt))} ago
                </span>
              </div>
            ))}
          </div>
          {MOCK_STALE_PAGES.length === 0 && (
            <div className="text-sm text-green-500">All content is fresh!</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
