import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const cmsRequire = createRequire(new URL('../../package.json', import.meta.url))
const payloadRequire = createRequire(cmsRequire.resolve('payload'))
const ajvRequire = createRequire(payloadRequire.resolve('ajv'))
const cssRequire = createRequire(cmsRequire.resolve('autoprefixer'))
const tailwindRequire = createRequire(cmsRequire.resolve('tailwindcss'))

describe('resolved CMS transitive security patches', () => {
  it('Payload AJV resolves the patched fast-uri release', () => {
    expect(ajvRequire('fast-uri/package.json').version).toBe('3.1.6')
    const uri = ajvRequire('fast-uri')
    // GHSA-f65p-4m7j-42xc: malformed input must not normalize into a private host.
    expect(uri.parse('http://[fc00::not-hex]/private').error).toBeTruthy()
  })

  it('the CSS compiler resolves the patched Browserslist release', () => {
    expect(cssRequire('browserslist/package.json').version).toBe('4.28.7')
    expect(cssRequire('browserslist')('last 1 chrome version').length).toBeGreaterThan(0)
  })

  it('Tailwind resolves the patched selector parser', () => {
    expect(tailwindRequire('postcss-selector-parser/package.json').version).toBe('6.1.3')
    expect(tailwindRequire('postcss-selector-parser')().processSync('.private-preview')).toBe('.private-preview')
  })
})
