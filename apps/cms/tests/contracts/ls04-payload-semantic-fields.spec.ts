import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ArticlesBlock } from '@/blocks/ArticlesBlock'
import { CTABlock } from '@/blocks/CTABlock'
import { HeroBlock } from '@/blocks/HeroBlock'
import { OfferShowcaseBlock } from '@/blocks/OfferShowcaseBlock'
import { migrations } from '../../src/migrations'

const REQUIRED_FIELDS = ['reactSymbol', 'libraryComponentId', 'semanticId', 'workingSectionId']
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')

describe('LS-04 Payload block schema', () => {
  it('declares every semantic projection field emitted by draft promotion', () => {
    for (const block of [HeroBlock, CTABlock, OfferShowcaseBlock, ArticlesBlock]) {
      expect(block.fields.map((field) => field.name)).toEqual(expect.arrayContaining(REQUIRED_FIELDS))
    }
  })

  it('keeps OfferShowcase offers as localized labels at the Payload boundary', () => {
    const offers = OfferShowcaseBlock.fields.find((field) => field.name === 'offers')

    expect(offers).toMatchObject({
      type: 'text',
      hasMany: true,
      localized: true,
      required: true,
    })
    expect(offers).not.toHaveProperty('relationTo')
  })

  it('proves LS-04 down() removes both semantic columns and text storage', async () => {
    const migration = migrations.find((candidate) => candidate.name === '20260825_000001_ls04_payload_semantic_fields')
    expect(migration).toBeDefined()
    const executed: string[] = []

    await migration!.down({
      db: {
        execute: async (statement: { queryChunks?: unknown }) => {
          executed.push(String(statement))
        },
      },
      payload: { logger: { info() {} } },
    } as never)

    expect(executed).toHaveLength(17)
    expect(executed.slice(0, -1)).toHaveLength(16)

    const source = readFileSync(new URL('../../src/migrations/20260825_000001_ls04_payload_semantic_fields.ts', import.meta.url), 'utf8')
    expect(source).toContain('DROP TABLE IF EXISTS "pages_texts" CASCADE')
    expect(source).toContain('DROP TABLE IF EXISTS "_pages_v_texts" CASCADE')
    expect(source.match(/DROP COLUMN IF EXISTS/g)).toHaveLength(4)
  })

  it('applies and rolls back against the exact baseline locale enum fixture', async () => {
    const migration = migrations.find(
      (candidate) => candidate.name === '20260825_000001_ls04_payload_semantic_fields',
    )
    expect(migration).toBeDefined()
    const fixture = readFileSync(
      join(repoRoot, 'apps/cms/tests/fixtures/ls04-payload-schema.sql'),
      'utf8',
    )
    const localeType = fixture.match(/CREATE TYPE\s+("public"\."_locales")/i)?.[1]
    expect(localeType).toBe('"public"."_locales"')

    const executed: string[] = []
    const db = {
      execute: async (statement: { queryChunks?: unknown }) => {
        const chunks = (statement.queryChunks ?? []) as Array<{ value?: string[] }>
        executed.push(chunks.flatMap((chunk) => chunk.value ?? []).join(''))
      },
    }

    await expect(
      migration!.up({ db, payload: { logger: { info() {} } } } as never),
    ).resolves.toBeUndefined()
    expect(executed).toHaveLength(17)
    const upSql = executed.join('\n')
    expect(upSql).toContain(`"locale" ${localeType}`)
    expect(upSql).not.toContain('"locale" "__locales"')

    await expect(
      migration!.down({ db, payload: { logger: { info() {} } } } as never),
    ).resolves.toBeUndefined()
    const downSql = executed.slice(17).join('\n')
    expect(downSql).toContain('DROP TABLE IF EXISTS "pages_texts" CASCADE')
    expect(downSql).toContain('DROP TABLE IF EXISTS "_pages_v_texts" CASCADE')
    expect(downSql.match(/DROP COLUMN IF EXISTS/g)).toHaveLength(64)
  })
})
