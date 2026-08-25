import { describe, expect, it } from 'vitest'
import { ArticlesBlock } from '@/blocks/ArticlesBlock'
import { CTABlock } from '@/blocks/CTABlock'
import { HeroBlock } from '@/blocks/HeroBlock'
import { OfferShowcaseBlock } from '@/blocks/OfferShowcaseBlock'

const REQUIRED_FIELDS = ['reactSymbol', 'libraryComponentId', 'semanticId', 'workingSectionId']

describe('LS-04 Payload block schema', () => {
  it('declares every semantic projection field emitted by draft promotion', () => {
    for (const block of [HeroBlock, CTABlock, OfferShowcaseBlock, ArticlesBlock]) {
      expect(block.fields.map((field) => field.name)).toEqual(expect.arrayContaining(REQUIRED_FIELDS))
    }
  })
})
