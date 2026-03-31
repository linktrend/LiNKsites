/**
 * Migration script to update collection slug references in the database
 * This updates relationship fields that reference the old collection slugs
 */

import { getPayload } from 'payload'
import config from '@/payload.config'

const slugMappings = {
  'offer-pages': 'offers',
  'case-study-pages': 'case-studies',
  'faq-pages': 'faq',
}

async function migrateCollectionSlugs() {
  console.log('Starting collection slug migration...')
  
  const payload = await getPayload({ config })

  // Update all collections that might have relationships to the old slugs
  const collectionsToCheck = [
    'articles',
    'help-articles',
    'article-pages',
    'help-article-pages',
    'video-pages',
  ]

  for (const collectionSlug of collectionsToCheck) {
    try {
      console.log(`\nChecking collection: ${collectionSlug}`)
      
      // Fetch all documents
      const { docs } = await payload.find({
        collection: collectionSlug as any,
        limit: 1000,
        depth: 0,
      })

      console.log(`Found ${docs.length} documents`)

      for (const doc of docs) {
        let needsUpdate = false
        const updates: any = {}

        // Check if document has content blocks
        if (doc.content && Array.isArray(doc.content)) {
          const updatedContent = doc.content.map((block: any) => {
            // Check RelatedContent blocks
            if (block.blockType === 'relatedContent' && block.content) {
              const updatedBlockContent = block.content.map((item: any) => {
                if (item.relationTo && item.relationTo in slugMappings) {
                  const newSlug = slugMappings[item.relationTo as keyof typeof slugMappings]
                  console.log(`  - Updating relationship from ${item.relationTo} to ${newSlug}`)
                  needsUpdate = true
                  return {
                    ...item,
                    relationTo: newSlug,
                  }
                }
                return item
              })
              
              return {
                ...block,
                content: updatedBlockContent,
              }
            }
            return block
          })

          if (needsUpdate) {
            updates.content = updatedContent
          }
        }

        // Update document if needed
        if (needsUpdate) {
          console.log(`  Updating document ${doc.id}`)
          await payload.update({
            collection: collectionSlug as any,
            id: doc.id,
            data: updates,
            depth: 0,
          })
        }
      }
    } catch (error) {
      console.error(`Error processing collection ${collectionSlug}:`, error)
    }
  }

  console.log('\n✅ Migration complete!')
  process.exit(0)
}

migrateCollectionSlugs().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
