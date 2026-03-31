import type { CollectionConfig, Field, GlobalConfig, Payload, PayloadRequest } from 'payload'

type LocalizedDocsMap = Record<string, Record<string, unknown>>

const RESERVED_UPDATE_KEYS = new Set(['id', '_id', 'createdAt', 'updatedAt', 'versions'])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getFieldsFromConfig = (config: CollectionConfig | GlobalConfig): Field[] =>
  'fields' in config && Array.isArray(config.fields) ? config.fields : []

const isLocalizedField = (field: Field): boolean =>
  'localized' in field && Boolean((field as Record<string, unknown>).localized)

const collectLocalizedFieldPaths = (
  fields: Field[],
  prefix: string[],
  paths: string[],
): void => {
  for (const field of fields) {
    const name = 'name' in field ? field.name : undefined
    const nextPrefix = name ? [...prefix, name] : [...prefix]

    if (isLocalizedField(field)) {
      paths.push(nextPrefix.join('.'))
    }

    if (field.type === 'array' && Array.isArray(field.fields)) {
      collectLocalizedFieldPaths(field.fields, [...nextPrefix, '[*]'], paths)
      continue
    }

    if (field.type === 'blocks' && Array.isArray(field.blocks)) {
      for (const block of field.blocks) {
        collectLocalizedFieldPaths(block.fields || [], [...nextPrefix, block.slug], paths)
      }
      continue
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      collectLocalizedFieldPaths(field.fields, nextPrefix, paths)
    }
  }
}

export const extractLocalizedFieldPaths = (
  config: CollectionConfig | GlobalConfig,
): string[] => {
  const paths: string[] = []
  collectLocalizedFieldPaths(getFieldsFromConfig(config), [], paths)
  return paths
}

const hasLocaleValue = (value: unknown, locale: string): boolean => {
  if (value === undefined) {
    return false
  }
  if (value === null) {
    return true
  }
  if (Array.isArray(value)) {
    return true
  }
  if (isRecord(value)) {
    return Object.prototype.hasOwnProperty.call(value, locale)
      ? true
      : Object.keys(value).length > 0
  }
  return true
}

const allLocalizedFieldsPresent = (
  doc: Record<string, unknown>,
  fields: Field[],
  locale: string,
): boolean => {
  for (const field of fields) {
    const name = 'name' in field ? field.name : undefined
    const value = name ? doc?.[name] : undefined

    if (isLocalizedField(field)) {
      if (!hasLocaleValue(value, locale)) {
        return false
      }
      continue
    }

    if (field.type === 'array' && Array.isArray(field.fields)) {
      const localizedArray =
        isLocalizedField(field) && isRecord(value) && hasLocaleValue(value, locale)
          ? (isRecord(value) ? (value as Record<string, unknown>)[locale] : undefined)
          : value

      const items = Array.isArray(localizedArray) ? localizedArray : []
      if (
        items.some(
          (item) =>
            isRecord(item) && !allLocalizedFieldsPresent(item as Record<string, unknown>, field.fields, locale),
        )
      ) {
        return false
      }
      continue
    }

    if (field.type === 'blocks' && Array.isArray(field.blocks)) {
      const localizedBlocks =
        isLocalizedField(field) && isRecord(value) && hasLocaleValue(value, locale)
          ? (value as Record<string, unknown>)[locale]
          : value

      const blocksArray = Array.isArray(localizedBlocks) ? localizedBlocks : []
      for (const blockValue of blocksArray) {
        if (!isRecord(blockValue) || typeof blockValue.blockType !== 'string') {
          continue
        }
        const blockConfig = field.blocks.find((block) => block.slug === blockValue.blockType)
        if (!blockConfig) {
          continue
        }
        if (
          !allLocalizedFieldsPresent(
            blockValue as Record<string, unknown>,
            blockConfig.fields || [],
            locale,
          )
        ) {
          return false
        }
      }
      continue
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      if (
        !allLocalizedFieldsPresent(
          (isRecord(value) ? value : {}) as Record<string, unknown>,
          field.fields,
          locale,
        )
      ) {
        return false
      }
    }
  }

  return true
}

const resolveDocForLocale = (
  doc: Record<string, unknown> | LocalizedDocsMap,
  locale: string,
): Record<string, unknown> => {
  if (isRecord(doc) && isRecord((doc as LocalizedDocsMap)[locale])) {
    return (doc as LocalizedDocsMap)[locale] as Record<string, unknown>
  }

  if (isRecord(doc) && Object.keys(doc).length > 0 && !(locale in doc)) {
    return {}
  }

  return doc as Record<string, unknown>
}

export const detectMissingLocales = (
  doc: Record<string, unknown> | LocalizedDocsMap,
  config: CollectionConfig | GlobalConfig,
  locales: string[],
): string[] => {
  const fields = getFieldsFromConfig(config)

  return locales.filter((locale) => {
    const localizedDoc = resolveDocForLocale(doc, locale)
    return !allLocalizedFieldsPresent(localizedDoc, fields, locale)
  })
}

const copyLocalizedFields = (value: unknown, fields: Field[]): Record<string, unknown> => {
  const output: Record<string, unknown> = {}

  for (const field of fields) {
    const name = 'name' in field ? field.name : undefined
    const fieldValue = name && isRecord(value) ? value[name] : value

    if (isLocalizedField(field)) {
      if (fieldValue === undefined) {
        continue
      }
      if (name) {
        output[name] = fieldValue
      }
      continue
    }

    if (field.type === 'array' && Array.isArray(field.fields)) {
      if (!name) {
        continue
      }
      if (!Array.isArray(fieldValue)) {
        continue
      }
      const items = fieldValue
        .map((item) => {
          if (!isRecord(item)) {
            return null
          }
          const nested = copyLocalizedFields(item, field.fields)
          if (Object.keys(nested).length === 0) {
            return null
          }
          const merged: Record<string, unknown> = { ...nested }
          if (item.id) {
            merged.id = item.id
          }
          return merged
        })
        .filter(Boolean)

      if (items.length > 0) {
        output[name] = items
      }
      continue
    }

    if (field.type === 'blocks' && Array.isArray(field.blocks)) {
      if (!name) {
        continue
      }
      if (!Array.isArray(fieldValue)) {
        continue
      }
      const blocks = fieldValue
        .map((blockValue) => {
          if (!isRecord(blockValue) || typeof blockValue.blockType !== 'string') {
            return null
          }
          const blockConfig = field.blocks?.find((block) => block.slug === blockValue.blockType)
          if (!blockConfig) {
            return null
          }
          const nested = copyLocalizedFields(blockValue, blockConfig.fields || [])
          if (Object.keys(nested).length === 0) {
            return null
          }
          return {
            ...(blockValue.id ? { id: blockValue.id } : {}),
            blockType: blockValue.blockType,
            ...nested,
          }
        })
        .filter(Boolean)

      if (blocks.length > 0) {
        output[name] = blocks
      }
      continue
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      const nested = copyLocalizedFields(
        (isRecord(fieldValue) ? fieldValue : {}) as Record<string, unknown>,
        field.fields,
      )
      if (Object.keys(nested).length > 0 && name) {
        output[name] = nested
      } else if (Object.keys(nested).length > 0 && !name) {
        Object.assign(output, nested)
      }
    }
  }

  return output
}

export const applyTranslation = async (
  payload: Payload,
  collection: string,
  id: string,
  sourceLocale: string,
  targetLocale: string,
  options?: {
    context?: PayloadRequest['context']
    queueId?: string
  },
): Promise<void> => {
  const collectionConfig = payload.config.collections?.find((entry) => entry.slug === collection)
  if (!collectionConfig) {
    throw new Error(`Unable to locate collection config for ${collection}`)
  }

  const fields = getFieldsFromConfig(collectionConfig)
  if (fields.length === 0) {
    return
  }

  const sourceDoc = (await payload.findByID({
    collection: collection as never,
    id,
    locale: sourceLocale as never,
    depth: 0,
  })) as unknown as Record<string, unknown>

  const targetDoc = (await payload.findByID({
    collection: collection as never,
    id,
    locale: targetLocale as never,
    depth: 0,
  })) as unknown as Record<string, unknown>

  const localizedData = copyLocalizedFields(sourceDoc, fields)

  const sanitizedData = Object.fromEntries(
    Object.entries(localizedData).filter(([key]) => !RESERVED_UPDATE_KEYS.has(key)),
  )

  const status = (targetDoc as { _status?: string | null | undefined })._status
  const updateDraft =
    typeof status === 'string' && status.length > 0 && status.toLowerCase() !== 'published'

  await payload.update({
    collection: collection as never,
    id,
    locale: targetLocale as never,
    data: sanitizedData as never,
    depth: 0,
    draft: updateDraft,
    context: {
      ...(options?.context || {}),
      skipTranslationSync: true,
    },
  })

  const queueId = options?.queueId
  if (queueId) {
    await payload.delete({
      collection: 'translation-queue',
      id: queueId,
    })
    return
  }

  try {
    const existing = await payload.find({
      collection: 'translation-queue',
      where: {
        documentId: { equals: id },
        collectionSlug: { equals: collection },
        targetLocale: { equals: targetLocale },
      },
      depth: 0,
      limit: 1,
    })

    if (existing.docs[0]?.id) {
      await payload.delete({
        collection: 'translation-queue',
        id: existing.docs[0].id,
      })
    }
  } catch (error) {
    console.error('Failed to clean up translation queue entry', error)
  }
}
