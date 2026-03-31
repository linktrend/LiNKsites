import type {
  CollectionAfterChangeHook,
  CollectionAfterReadHook,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
} from 'payload'
import { enforceSiteScope } from '@/hooks/enforceSiteScope'
import {
  PUBLISH_VALIDATED_COLLECTIONS,
  SITE_SCOPED_COLLECTIONS,
  TRANSLATABLE_COLLECTIONS,
} from '@/hooks/globalHookTargets'
import { syncTranslationsAfterChange } from '@/hooks/syncTranslations'
import { validatePublishPermissions } from '@/hooks/validatePublishPermissions'
import { validateSiteAccess, validateSiteAccessBeforeDelete } from '@/hooks/validateSiteAccess'

const applyGlobalHooksToCollection = (collection: CollectionConfig): CollectionConfig => {
  const hooks = collection.hooks || {}

  const afterRead: CollectionAfterReadHook[] = [...(hooks.afterRead || [])]
  if (SITE_SCOPED_COLLECTIONS.has(collection.slug)) {
    afterRead.push(enforceSiteScope)
  }
  const beforeChange: CollectionBeforeChangeHook[] = [...(hooks.beforeChange || [])]
  if (SITE_SCOPED_COLLECTIONS.has(collection.slug)) {
    beforeChange.push(validateSiteAccess)
  }
  if (PUBLISH_VALIDATED_COLLECTIONS.has(collection.slug)) {
    beforeChange.push(validatePublishPermissions)
  }

  const afterChange: CollectionAfterChangeHook[] = [...(hooks.afterChange || [])]
  if (TRANSLATABLE_COLLECTIONS.has(collection.slug)) {
    afterChange.push(syncTranslationsAfterChange)
  }

  const beforeDelete: CollectionBeforeDeleteHook[] = [...(hooks.beforeDelete || [])]
  if (SITE_SCOPED_COLLECTIONS.has(collection.slug)) {
    beforeDelete.push(validateSiteAccessBeforeDelete)
  }

  return {
    ...collection,
    hooks: {
      ...hooks,
      afterRead,
      beforeChange,
      afterChange,
      beforeDelete,
    },
  }
}

export const applyGlobalCollectionHooks = (
  collections: CollectionConfig[],
): CollectionConfig[] => collections.map(applyGlobalHooksToCollection)
