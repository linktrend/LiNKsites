import type { Payload } from 'payload'
import { CacheKeys, cacheGet, cacheInvalidatePattern, cacheSet } from '@/payload/utils/cache'

type HelpArticle = {
  id: number | string
  title?: string
  description?: string | null
  searchKeywords?: string | null
  content?: unknown
  popularity?: number | null
  slug: string
  category?: number | { id?: number | string; name?: string } | null
}

export interface HelpSearchResult {
  id: number
  title: string
  excerpt: string
  slug: string
  category: string
  score: number
  popularity: number
}

export interface HelpSearchOptions {
  query: string
  siteId: string
  locale?: string
  limit?: number
}

/**
 * Calculate search relevance score
 */
function calculateScore(article: HelpArticle, query: string): number {
  const queryLower = query.toLowerCase()
  let score = 0

  // Title exact match: 100 points
  if (article.title?.toLowerCase() === queryLower) {
    score += 100
  }
  // Title contains query: 50 points
  else if (article.title?.toLowerCase().includes(queryLower)) {
    score += 50
  }

  // Search keywords match: 30 points per keyword
  if (article.searchKeywords) {
    const keywords = article.searchKeywords
      .toLowerCase()
      .split(',')
      .map((k: string) => k.trim())
    keywords.forEach((keyword: string) => {
      if (keyword === queryLower) {
        score += 30
      } else if (keyword.includes(queryLower) || queryLower.includes(keyword)) {
        score += 15
      }
    })
  }

  // Content contains query: 20 points
  if (article.content && typeof article.content === 'string') {
    if (article.content.toLowerCase().includes(queryLower)) {
      score += 20
    }
  }

  // Description contains query: 15 points
  if (article.description?.toLowerCase().includes(queryLower)) {
    score += 15
  }

  // Boost by popularity (0-10 points based on view count)
  const popularityBoost = Math.min(article.popularity || 0, 10)
  score += popularityBoost

  return score
}

/**
 * Search help articles with weighted ranking
 */
export async function searchHelpArticles(
  options: HelpSearchOptions,
  payload: Payload,
): Promise<HelpSearchResult[]> {
  const { query, siteId, locale = 'en', limit = 10 } = options

  const cacheKey = CacheKeys.publishedList(siteId, locale, 'help-articles', `search:${query}:${limit}`)
  const cached = await cacheGet<HelpSearchResult[]>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Fetch all help articles for the site
    const articles = await payload.find({
      collection: 'help-articles',
      where: {
        site: { equals: siteId },
        status: { equals: 'published' },
      },
      locale: locale as never,
      fallbackLocale: false,
      depth: 0,
      limit: 100, // Fetch more for better ranking
    })

    // Calculate scores and sort
    const scoredResults = (articles.docs as HelpArticle[])
      .map((article) => {
        const articleId = typeof article.id === 'string' ? Number(article.id) : article.id
        return {
          id: articleId,
          title: article.title || '',
          excerpt: article.description || '',
          slug: article.slug,
          category: typeof article.category === 'number' ? '' : article.category?.name || '',
          score: calculateScore(article, query),
          popularity: article.popularity || 0,
        }
      })
      .filter((result) => result.score > 0) // Only include relevant results
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit)

    await cacheSet(cacheKey, scoredResults)
    return scoredResults
  } catch (error) {
    console.error('Help search error:', error)
    return []
  }
}

/**
 * Get related articles based on category and keywords
 */
export async function getRelatedArticles(
  articleId: string,
  siteId: string,
  locale: string,
  payload: Payload,
  limit: number = 5,
): Promise<HelpSearchResult[]> {
  const cacheKey = CacheKeys.publishedList(siteId, locale, 'help-articles', `related:${articleId}:${limit}`)
  const cached = await cacheGet<HelpSearchResult[]>(cacheKey)
  if (cached) return cached

  try {
    // Fetch the source article
    const article = (await payload.findByID({
      collection: 'help-articles',
      id: articleId,
      locale: locale as never,
      fallbackLocale: false,
      depth: 0,
    })) as HelpArticle

    if (!article) return []

    const categoryId =
      typeof article.category === 'object' && article.category
        ? article.category.id
        : article.category

    // Find articles in same category
    const related = await payload.find({
      collection: 'help-articles',
      where: {
        site: { equals: siteId },
        status: { equals: 'published' },
        id: { not_equals: articleId },
        category: { equals: categoryId ?? undefined },
      },
      locale: locale as never,
      fallbackLocale: false,
      limit,
      sort: '-popularity', // Sort by popularity
      depth: 0,
    })

    const results = (related.docs as HelpArticle[]).map((doc) => ({
      id: typeof doc.id === 'string' ? Number(doc.id) : doc.id,
      title: doc.title || '',
      excerpt: doc.description || '',
      slug: doc.slug,
      category: typeof doc.category === 'number' ? '' : doc.category?.name || '',
      score: 0,
      popularity: doc.popularity || 0,
    }))
    await cacheSet(cacheKey, results)
    return results
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return []
  }
}

/**
 * Track article view for popularity ranking
 */
export async function trackArticleView(
  articleId: string,
  payload: Payload,
): Promise<void> {
  try {
    const article = await payload.findByID({
      collection: 'help-articles',
      id: articleId,
      depth: 0,
      fallbackLocale: false,
    })

    if (!article) return

    const currentPopularity = typeof (article as HelpArticle).popularity === 'number' ? (article as HelpArticle).popularity || 0 : 0

    await payload.update({
      collection: 'help-articles',
      id: articleId,
      data: {
        popularity: currentPopularity + 1,
        lastViewedAt: new Date().toISOString(),
      },
      depth: 0,
      fallbackLocale: false,
    })
    await cacheInvalidatePattern('help-articles')
  } catch (error) {
    console.error('Error tracking article view:', error)
  }
}
