/**
 * Relationship Integrity Module
 * 
 * This module provides comprehensive validation and resolution of relationships
 * between offers, resources (articles), case studies, videos, and FAQs.
 * 
 * Design Principles:
 * - Type-safe relationship resolution
 * - Graceful handling of broken references
 * - Validation helpers for CMS data integrity
 * - Safe for vertical template extension
 */

import type { 
  Offer, 
  Resource, 
  Case, 
  Video, 
  Faq,
  CmsPayload 
} from './cms/schema';

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

/**
 * All possible relationship types in the system
 */
export type RelationshipType = 
  | 'offer-to-resources'      // Offer.relatedResources -> Resource[]
  | 'resource-to-offer'       // Resource.offerSlug -> Offer
  | 'case-to-offers'          // Case.relatedOffers -> Offer[]
  | 'video-to-videos'         // Video.relatedVideos -> Video[]
  | 'video-to-articles'       // Video.relatedArticles -> Resource[]
  | 'faq-to-offer';           // Faq.offerSlug -> Offer

/**
 * Relationship mapping configuration
 */
export const RELATIONSHIP_MAP = {
  'offer-to-resources': {
    source: 'offers',
    target: 'resources',
    field: 'relatedResources',
    description: 'Offers can reference multiple related articles/resources'
  },
  'resource-to-offer': {
    source: 'resources',
    target: 'offers',
    field: 'offerSlug',
    description: 'Resources can be associated with one offer'
  },
  'case-to-offers': {
    source: 'cases',
    target: 'offers',
    field: 'relatedOffers',
    description: 'Case studies can reference multiple related offers'
  },
  'video-to-videos': {
    source: 'videos',
    target: 'videos',
    field: 'relatedVideos',
    description: 'Videos can reference other related videos'
  },
  'video-to-articles': {
    source: 'videos',
    target: 'resources',
    field: 'relatedArticles',
    description: 'Videos can reference related articles/resources'
  },
  'faq-to-offer': {
    source: 'faq',
    target: 'offers',
    field: 'offerSlug',
    description: 'FAQs can be associated with one offer'
  }
} as const;

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

export interface ValidationIssue {
  type: 'broken-reference' | 'missing-field' | 'invalid-type';
  severity: 'error' | 'warning';
  relationship: RelationshipType;
  sourceSlug: string;
  targetSlug?: string;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    totalIssues: number;
    errors: number;
    warnings: number;
    byRelationship: Record<RelationshipType, number>;
  };
}

// ============================================================================
// SAFE RESOLUTION HELPERS
// ============================================================================

/**
 * Safely resolve related resources for an offer
 * Returns only valid resources, logs warnings for broken references
 */
export function resolveOfferResources(
  offer: Offer,
  allResources: Resource[],
  options: { strict?: boolean } = {}
): { resources: Resource[]; brokenRefs: string[] } {
  const { strict = false } = options;
  const resources: Resource[] = [];
  const brokenRefs: string[] = [];

  for (const slug of offer.relatedResources) {
    const resource = allResources.find(r => r.slug === slug);
    if (resource) {
      resources.push(resource);
    } else {
      brokenRefs.push(slug);
      if (strict) {
        console.warn(
          `[Relationship Integrity] Offer "${offer.slug}" references non-existent resource "${slug}"`
        );
      }
    }
  }

  return { resources, brokenRefs };
}

/**
 * Safely resolve the offer for a resource
 */
export function resolveResourceOffer(
  resource: Resource,
  allOffers: Offer[],
  options: { strict?: boolean } = {}
): { offer: Offer | null; broken: boolean } {
  const { strict = false } = options;

  if (!resource.offerSlug) {
    return { offer: null, broken: false };
  }

  const offer = allOffers.find(o => o.slug === resource.offerSlug);
  
  if (!offer && strict) {
    console.warn(
      `[Relationship Integrity] Resource "${resource.slug}" references non-existent offer "${resource.offerSlug}"`
    );
  }

  return { offer: offer || null, broken: !offer };
}

/**
 * Safely resolve related offers for a case study
 */
export function resolveCaseOffers(
  caseStudy: Case,
  allOffers: Offer[],
  options: { strict?: boolean } = {}
): { offers: Offer[]; brokenRefs: string[] } {
  const { strict = false } = options;
  const offers: Offer[] = [];
  const brokenRefs: string[] = [];

  for (const slug of caseStudy.relatedOffers) {
    const offer = allOffers.find(o => o.slug === slug);
    if (offer) {
      offers.push(offer);
    } else {
      brokenRefs.push(slug);
      if (strict) {
        console.warn(
          `[Relationship Integrity] Case "${caseStudy.slug}" references non-existent offer "${slug}"`
        );
      }
    }
  }

  return { offers, brokenRefs };
}

/**
 * Safely resolve related videos for a video
 */
export function resolveRelatedVideos(
  video: Video,
  allVideos: Video[],
  options: { strict?: boolean } = {}
): { videos: Video[]; brokenRefs: string[] } {
  const { strict = false } = options;
  const videos: Video[] = [];
  const brokenRefs: string[] = [];

  for (const slug of video.relatedVideos) {
    const relatedVideo = allVideos.find(v => v.slug === slug && v.slug !== video.slug);
    if (relatedVideo) {
      videos.push(relatedVideo);
    } else {
      brokenRefs.push(slug);
      if (strict) {
        console.warn(
          `[Relationship Integrity] Video "${video.slug}" references non-existent video "${slug}"`
        );
      }
    }
  }

  return { videos, brokenRefs };
}

/**
 * Safely resolve related articles for a video
 */
export function resolveVideoArticles(
  video: Video,
  allResources: Resource[],
  options: { strict?: boolean } = {}
): { articles: Resource[]; brokenRefs: string[] } {
  const { strict = false } = options;
  const articles: Resource[] = [];
  const brokenRefs: string[] = [];

  for (const slug of video.relatedArticles) {
    const article = allResources.find(r => r.slug === slug);
    if (article) {
      articles.push(article);
    } else {
      brokenRefs.push(slug);
      if (strict) {
        console.warn(
          `[Relationship Integrity] Video "${video.slug}" references non-existent article "${slug}"`
        );
      }
    }
  }

  return { articles, brokenRefs };
}

/**
 * Safely resolve the offer for a FAQ
 */
export function resolveFaqOffer(
  faq: Faq,
  allOffers: Offer[],
  options: { strict?: boolean } = {}
): { offer: Offer | null; broken: boolean } {
  const { strict = false } = options;

  if (!faq.offerSlug) {
    return { offer: null, broken: false };
  }

  const offer = allOffers.find(o => o.slug === faq.offerSlug);
  
  if (!offer && strict) {
    console.warn(
      `[Relationship Integrity] FAQ references non-existent offer "${faq.offerSlug}"`
    );
  }

  return { offer: offer || null, broken: !offer };
}

// ============================================================================
// COMPREHENSIVE VALIDATION
// ============================================================================

/**
 * Validate all relationships in the CMS payload
 * Returns a detailed report of any integrity issues
 */
export function validateRelationships(payload: CmsPayload): ValidationReport {
  const issues: ValidationIssue[] = [];

  // Validate offer -> resources relationships
  for (const offer of payload.offers) {
    const { brokenRefs } = resolveOfferResources(offer, payload.resources);
    for (const ref of brokenRefs) {
      issues.push({
        type: 'broken-reference',
        severity: 'warning',
        relationship: 'offer-to-resources',
        sourceSlug: offer.slug,
        targetSlug: ref,
        message: `Offer "${offer.slug}" references non-existent resource "${ref}"`
      });
    }
  }

  // Validate resource -> offer relationships
  for (const resource of payload.resources) {
    if (resource.offerSlug) {
      const { broken } = resolveResourceOffer(resource, payload.offers);
      if (broken) {
        issues.push({
          type: 'broken-reference',
          severity: 'warning',
          relationship: 'resource-to-offer',
          sourceSlug: resource.slug,
          targetSlug: resource.offerSlug,
          message: `Resource "${resource.slug}" references non-existent offer "${resource.offerSlug}"`
        });
      }
    }
  }

  // Validate case -> offers relationships
  for (const caseStudy of payload.cases) {
    const { brokenRefs } = resolveCaseOffers(caseStudy, payload.offers);
    for (const ref of brokenRefs) {
      issues.push({
        type: 'broken-reference',
        severity: 'warning',
        relationship: 'case-to-offers',
        sourceSlug: caseStudy.slug,
        targetSlug: ref,
        message: `Case "${caseStudy.slug}" references non-existent offer "${ref}"`
      });
    }
  }

  // Validate video -> videos relationships
  for (const video of payload.videos) {
    const { brokenRefs: videoBrokenRefs } = resolveRelatedVideos(video, payload.videos);
    for (const ref of videoBrokenRefs) {
      issues.push({
        type: 'broken-reference',
        severity: 'warning',
        relationship: 'video-to-videos',
        sourceSlug: video.slug,
        targetSlug: ref,
        message: `Video "${video.slug}" references non-existent video "${ref}"`
      });
    }

    // Validate video -> articles relationships
    const { brokenRefs: articleBrokenRefs } = resolveVideoArticles(video, payload.resources);
    for (const ref of articleBrokenRefs) {
      issues.push({
        type: 'broken-reference',
        severity: 'warning',
        relationship: 'video-to-articles',
        sourceSlug: video.slug,
        targetSlug: ref,
        message: `Video "${video.slug}" references non-existent article "${ref}"`
      });
    }
  }

  // Validate faq -> offer relationships
  for (const faq of payload.faq) {
    if (faq.offerSlug) {
      const { broken } = resolveFaqOffer(faq, payload.offers);
      if (broken) {
        issues.push({
          type: 'broken-reference',
          severity: 'warning',
          relationship: 'faq-to-offer',
          sourceSlug: `faq-${faq.question.substring(0, 30)}...`,
          targetSlug: faq.offerSlug,
          message: `FAQ references non-existent offer "${faq.offerSlug}"`
        });
      }
    }
  }

  // Generate summary
  const byRelationship: Record<RelationshipType, number> = {
    'offer-to-resources': 0,
    'resource-to-offer': 0,
    'case-to-offers': 0,
    'video-to-videos': 0,
    'video-to-articles': 0,
    'faq-to-offer': 0
  };

  let errors = 0;
  let warnings = 0;

  for (const issue of issues) {
    byRelationship[issue.relationship]++;
    if (issue.severity === 'error') errors++;
    if (issue.severity === 'warning') warnings++;
  }

  return {
    valid: issues.length === 0,
    issues,
    summary: {
      totalIssues: issues.length,
      errors,
      warnings,
      byRelationship
    }
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all resources related to an offer (both direct and indirect)
 * Direct: offer.relatedResources
 * Indirect: resources with offerSlug matching offer
 */
export function getAllOfferResources(
  offer: Offer,
  allResources: Resource[]
): Resource[] {
  const directRefs = new Set(offer.relatedResources);
  const resources: Resource[] = [];

  for (const resource of allResources) {
    // Include if directly referenced or if resource points to this offer
    if (directRefs.has(resource.slug) || resource.offerSlug === offer.slug) {
      resources.push(resource);
    }
  }

  return resources;
}

/**
 * Get all case studies related to an offer
 */
export function getOfferCaseStudies(
  offer: Offer,
  allCases: Case[]
): Case[] {
  return allCases.filter(c => c.relatedOffers.includes(offer.slug));
}

/**
 * Get all videos related to an offer (through articles)
 */
export function getOfferVideos(
  offer: Offer,
  allVideos: Video[],
  allResources: Resource[]
): Video[] {
  const offerResources = getAllOfferResources(offer, allResources);
  const resourceSlugs = new Set(offerResources.map(r => r.slug));

  return allVideos.filter(video => 
    video.relatedArticles.some(slug => resourceSlugs.has(slug))
  );
}

/**
 * Get all FAQs related to an offer
 */
export function getOfferFaqs(
  offer: Offer,
  allFaqs: Faq[]
): Faq[] {
  return allFaqs.filter(faq => faq.offerSlug === offer.slug);
}

/**
 * Print a human-readable validation report
 */
export function printValidationReport(report: ValidationReport): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push('RELATIONSHIP INTEGRITY VALIDATION REPORT');
  lines.push('='.repeat(80));
  lines.push('');
  
  if (report.valid) {
    lines.push('✅ All relationships are valid!');
    lines.push('');
    return lines.join('\n');
  }
  
  lines.push(`❌ Found ${report.summary.totalIssues} issue(s):`);
  lines.push(`   - Errors: ${report.summary.errors}`);
  lines.push(`   - Warnings: ${report.summary.warnings}`);
  lines.push('');
  
  lines.push('Issues by relationship type:');
  for (const [relationship, count] of Object.entries(report.summary.byRelationship)) {
    if (count > 0) {
      lines.push(`   - ${relationship}: ${count}`);
    }
  }
  lines.push('');
  
  lines.push('Detailed issues:');
  lines.push('-'.repeat(80));
  for (const issue of report.issues) {
    const icon = issue.severity === 'error' ? '❌' : '⚠️';
    lines.push(`${icon} [${issue.relationship}] ${issue.message}`);
  }
  lines.push('');
  
  return lines.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

const relationshipIntegrity = {
  // Resolution helpers
  resolveOfferResources,
  resolveResourceOffer,
  resolveCaseOffers,
  resolveRelatedVideos,
  resolveVideoArticles,
  resolveFaqOffer,
  
  // Validation
  validateRelationships,
  printValidationReport,
  
  // Utility functions
  getAllOfferResources,
  getOfferCaseStudies,
  getOfferVideos,
  getOfferFaqs,
  
  // Constants
  RELATIONSHIP_MAP
};

export default relationshipIntegrity;
