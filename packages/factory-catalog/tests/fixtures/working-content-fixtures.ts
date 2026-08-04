import type { WorkingContentPackage } from '../../src/workingContent.js'

export const workingContentFixture: WorkingContentPackage = {
  schemaVersion: { major: 1, minor: 0 },
  content: {
    pages: [
      {
        pageId: 'page-home',
        route: '/',
        sections: [
          {
            sectionId: 'section-hero',
            componentId: 'Hero',
            content: { heading: 'A clear home page', body: 'Evidence-backed working copy.' },
          },
        ],
      },
    ],
  },
  assetRefs: [
    {
      assetId: 'asset-logo',
      sha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      source: 'asset://lead-demo/logo',
    },
  ],
  libraryRefs: [{ libraryId: 'component.hero', sha: 'library-sha-001' }],
  provenance: [
    {
      claimId: 'claim-hero-001',
      kind: 'generated_copy',
      sourceReferences: ['research://lead-demo/brief'],
      statement: 'The hero copy is generated from the lead research brief.',
    },
  ],
}

export function revisedWorkingContentFixture(): WorkingContentPackage {
  return {
    ...workingContentFixture,
    content: {
      pages: [
        {
          ...workingContentFixture.content.pages[0],
          sections: [
            {
              ...workingContentFixture.content.pages[0].sections[0],
              content: { heading: 'A clearer home page', body: 'Revised working copy with the same asset receipt.' },
            },
          ],
        },
      ],
    },
  }
}
