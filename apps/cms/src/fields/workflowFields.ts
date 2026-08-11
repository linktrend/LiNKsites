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

const identifier = (value: unknown): string | undefined =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : undefined

const resolveSiteId = (input?: unknown, fallback?: unknown): string | undefined => {
  const read = (value?: unknown): string | undefined => {
    if (!value) return undefined
    const direct = identifier(value)
    if (direct) return direct
    if (isRecord(value)) {
      const site = identifier(value.site)
      if (site) return site
      if (isRecord(value.site)) return identifier(value.site.id)
      return identifier(value.id)
    }
    return undefined
  }

  return read(input) ?? read(fallback)
}

const isPrivatePreviewPublication = (data: unknown, originalDoc: unknown): boolean => {
  const current = isRecord(data) ? data : {}
  const stored = isRecord(originalDoc) ? originalDoc : {}
  return (current.previewEnvironment ?? stored.previewEnvironment) === 'private-preview' &&
    (current.publicActivation ?? stored.publicActivation) === false
}

const isPrivatePreviewPublisher = (user: unknown): boolean =>
  isRecord(user) && Array.isArray(user.roles) && user.roles.some((role) =>
    (typeof role === 'string' && role === 'private-preview-publisher') ||
    (isRecord(role) && role.name === 'private-preview-publisher'),
  )

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
    // This Program transition is separately gated and is published only to the
    // authenticated private-preview audience.  It must not fabricate a human
    // approval record or require the service publisher to receive broad
    // approval authority merely because Payload's workflow metadata exists.
    if (!(
      isPrivatePreviewPublisher(req?.user) &&
      isPrivatePreviewPublication(data, originalDoc)
    ) && data.autoApproved !== true) {
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
