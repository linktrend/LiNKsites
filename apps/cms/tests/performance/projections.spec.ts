import { describe, expect, it } from 'vitest'
import { applyProjectionToParams, buildProjection } from '@/payload/utils/projections'

describe('projection utilities', () => {
  it('builds the shared list projection with workflow metadata', () => {
    const fields = buildProjection({ includeWorkflow: true })
    expect(fields).toContain('id')
    expect(fields).toContain('title')
    expect(fields).toContain('reviewState')
    expect(fields).toContain('translationState')
    expect(fields).not.toContain('body')
  })

  it('merges include and exclude sets', () => {
    const fields = buildProjection({ include: ['submittedBy'], exclude: ['name'] })
    expect(fields).toContain('submittedBy')
    expect(fields).not.toContain('name')
    expect(fields).toContain('slug')
  })

  it('applies projection to URLSearchParams', () => {
    const params = applyProjectionToParams(new URLSearchParams(), { include: ['custom'] })
    expect(params.get('select[id]')).toBe('true')
    expect(params.get('select[custom]')).toBe('true')
  })
})
