import type { PayloadRequest } from 'payload'
import type { User } from '@/payload-types'

export interface UserWithSites extends User {
  assignedSites: User['assignedSites']
  role?: string
}

type RequestUser = PayloadRequest['user'] | UserWithSites

export type WorkflowRequest = PayloadRequest & {
  user?: RequestUser | null
  locale?: PayloadRequest['locale']
  data?: Record<string, unknown>
}
