import type { CollectionAfterChangeHook } from 'payload'
import type { TranslationQueue } from '@/payload-types'
import { applyTranslation } from '@/utils/translation'

type QueueAction = 'manual_complete' | 'ai_complete'

const isQueueAction = (value: unknown): value is QueueAction =>
  value === 'manual_complete' || value === 'ai_complete'

export const processTranslationQueueAction: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}): Promise<TranslationQueue> => {
  const metaSource = (req as { meta?: Record<string, unknown> }).meta?.source
  if (metaSource === 'n8n') {
    return doc
  }
  if (operation !== 'update') {
    return doc
  }

  const action = isQueueAction(req.data?.action) ? req.data.action : undefined
  const statusChangedToCompleted =
    previousDoc?.status !== 'completed' && (req.data?.status === 'completed' || doc.status === 'completed')

  if (
    !statusChangedToCompleted ||
    !action ||
    !doc?.documentId ||
    !doc?.collectionSlug ||
    !doc?.targetLocale ||
    !doc?.sourceLocale
  ) {
    return doc
  }

  try {
    await applyTranslation(
      req.payload,
      doc.collectionSlug,
      doc.documentId,
      doc.sourceLocale,
      doc.targetLocale,
      {
        context: {
          ...(req.context || {}),
          skipTranslationSync: true,
        },
        queueId: doc.id,
      },
    )
  } catch (error) {
    console.error('Failed to apply translation for queue item', { queueId: doc.id, error })
  }

  return doc
}
