import type { WorkingContentPackage } from '../../src/workingContent.js'

export const workingContentFixture: WorkingContentPackage = {
  schemaVersion: { major: 1, minor: 0 },
  templateId: 'marketing-smb-v1',
  content: {
    pages: [
      {
        pageId: 'page-home',
        route: '/',
        sections: [
          {
            sectionId: 'section-hero',
            componentId: 'SignupHero',
            content: { lang: 'en', copy: 'A clear home page' },
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
  libraryRefs: [{ libraryId: 'component.hero', sha: '0123456789abcdef0123456789abcdef01234567' }],
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
              content: { lang: 'en', revision: 'A clearer home page with the same asset receipt.' },
            },
          ],
        },
      ],
    },
  }
}
