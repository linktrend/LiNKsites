import type {
  CheckboxField,
  DateField,
  Field,
  FieldHook,
  RelationshipField,
  SelectField,
} from 'payload'
import { approvalFieldAccess, publishFieldAccess } from '@/access'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { getAutoApproveSetting, normalizeWorkflowStatus } from '@/utils/workflow'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const resolveSiteId = (input?: unknown, fallback?: unknown): string | undefined => {
  const read = (value?: unknown): string | undefined => {
    if (!value) return undefined
    if (typeof value === 'string') return value
    if (isRecord(value)) {
      if (typeof value.site === 'string') return value.site
      if (isRecord(value.site) && typeof value.site.id === 'string') return value.site.id
      if (typeof value.id === 'string') return value.id
    }
    return undefined
  }

  return read(input) ?? read(fallback)
}

const resolveUserId = (input: unknown): string | undefined => {
  if (!input) return undefined
  if (typeof input === 'string') return input
  if (typeof input === 'number') return String(input)
  if (isRecord(input)) {
    if (typeof input.id === 'string' || typeof input.id === 'number') {
      return String(input.id)
    }
    if (typeof input._id === 'string' || typeof input._id === 'number') {
      return String(input._id)
    }
    if (typeof input.value === 'string' || typeof input.value === 'number') {
      return String(input.value)
    }
  }
  return undefined
}

const workflowStatusHook: FieldHook = async ({ data, originalDoc, req, value }) => {
  if (!data) return value

  const previousStatus = normalizeWorkflowStatus(
    typeof originalDoc?.status === 'string' ? originalDoc.status : undefined,
  )
  const requestedStatus = normalizeWorkflowStatus(typeof value === 'string' ? value : previousStatus)
  let nextStatus = requestedStatus || 'draft'
  const statusChanged = nextStatus !== previousStatus

  if (!statusChanged) {
    return nextStatus
  }

  const now = new Date().toISOString()
  const userId = resolveUserId(req?.user)

  const clearReviewMeta = () => {
    data.reviewedBy = null
    data.reviewedAt = null
  }

  const clearPublishedMeta = () => {
    data.publishedAt = null
  }

  if (nextStatus === 'draft') {
    data.submittedBy = null
    clearReviewMeta()
    data.autoApproved = false
    clearPublishedMeta()
    return nextStatus
  }

  if (nextStatus === 'pending') {
    if (previousStatus === 'draft') {
      const fallbackSubmitter =
        resolveUserId(data.submittedBy) ?? resolveUserId(originalDoc?.submittedBy)
      data.submittedBy = userId ?? fallbackSubmitter ?? null
    } else if (data.submittedBy === undefined) {
      data.submittedBy = resolveUserId(originalDoc?.submittedBy) ?? null
    }

    clearReviewMeta()
    data.autoApproved = false
    clearPublishedMeta()

    const siteId = resolveSiteId(data, originalDoc)
    if (siteId && (await getAutoApproveSetting(req as WorkflowRequest, siteId))) {
      nextStatus = 'published'
      data.status = 'published'
      data.autoApproved = true
      data.reviewedBy = null
      data.reviewedAt = now
      data.publishedAt = now
    }
  }

  if (previousStatus === 'published' && nextStatus !== 'published') {
    clearPublishedMeta()
  }

  if (nextStatus === 'published' && previousStatus !== 'published') {
    if (data.autoApproved !== true) {
      data.autoApproved = false
      data.reviewedBy = userId ?? resolveUserId(originalDoc?.reviewedBy) ?? null
      data.reviewedAt = now
    }

    data.publishedAt = now
  }

  return nextStatus
}

const workflowStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending Review', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
] as const satisfies SelectField['options']

const workflowStatusField = {
  name: 'status',
  type: 'select',
  label: 'Workflow Status',
  required: true,
  defaultValue: 'draft',
  options: workflowStatusOptions,
  admin: {
    position: 'sidebar',
    description: 'Content workflow state',
  },
  hooks: {
    beforeChange: [workflowStatusHook],
  },
  access: {
    update: publishFieldAccess,
    create: publishFieldAccess,
  },
} satisfies SelectField

export const workflowFields = [
  workflowStatusField,
  {
    name: 'submittedBy',
    type: 'relationship',
    relationTo: 'users',
    label: 'Submitted By',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
    access: {
      update: approvalFieldAccess,
    },
  } satisfies RelationshipField,
  {
    name: 'reviewedBy',
    type: 'relationship',
    relationTo: 'users',
    label: 'Reviewed By',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
    access: {
      update: approvalFieldAccess,
    },
  } satisfies RelationshipField,
  {
    name: 'reviewedAt',
    type: 'date',
    label: 'Reviewed At',
    admin: {
      position: 'sidebar',
      readOnly: true,
      date: {
        pickerAppearance: 'dayAndTime',
      },
    },
    access: {
      update: approvalFieldAccess,
    },
  } satisfies DateField,
  {
    name: 'autoApproved',
    type: 'checkbox',
    label: 'Auto Approved',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
    access: {
      update: approvalFieldAccess,
    },
  } satisfies CheckboxField,
  {
    name: 'publishedAt',
    type: 'date',
    label: 'Published At',
    admin: {
      position: 'sidebar',
      readOnly: true,
      date: {
        pickerAppearance: 'dayAndTime',
      },
    },
    access: {
      update: publishFieldAccess,
    },
  } satisfies DateField,
] satisfies Field[]
