export enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

export interface YouTubeSyncConfig {
  channelId?: string
  playlistIds?: string[]
  apiKey: string
  autoSyncEnabled: boolean
  syncFrequency?: 'hourly' | 'daily' | 'weekly'
  lastSyncedAt?: string
}

export interface ApprovalWorkflow {
  status: ApprovalStatus
  requestedAt?: string
  requestedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectionReason?: string
}

export interface PublishStatus {
  status: 'draft' | 'published'
  publishedAt?: string
}

export interface SEOMetadata {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  noIndex?: boolean
}

export interface LocalizedContent {
  locale: string
  content: unknown
}

export interface SiteContext {
  id: string
  name: string
  domain: string
  defaultLanguage: string
}

// Re-export from permissions for convenience
export { PermissionFlag, type RolePermissions } from '@/utils/permissions'
export { type SitePermissionOverride, type ResolvedPermissions } from '@/utils/resolvePermissions'
export { type WorkflowRequest, type UserWithSites } from '@/types/PayloadRequestExtended'
