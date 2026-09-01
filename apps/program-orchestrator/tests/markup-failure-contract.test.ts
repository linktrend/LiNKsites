import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateMarkupSafety } from '../src/adapters.ts'

test('markup failure contract reports security and accessibility independently', () => {
  assert.deepEqual(evaluateMarkupSafety({ copy: '<img src="safe.webp">' }), {
    security: true,
    accessibility: false,
  })
  assert.deepEqual(evaluateMarkupSafety({ copy: '<img src="safe.webp" alt="">', action: '<a href="javascript:alert(1)">go</a>' }), {
    security: false,
    accessibility: true,
  })
})

test('markup failure contract rejects nested and obfuscated active content', () => {
  assert.equal(evaluateMarkupSafety({ nested: [{ copy: '<svg onload = "steal()">' }] }).security, false)
  assert.equal(evaluateMarkupSafety({ nested: { url: 'javaScript : alert(1)' } }).security, false)
  assert.equal(evaluateMarkupSafety({ nested: { url: 'data : text/html,<script>alert(1)</script>' } }).security, false)
})

test('markup failure contract accepts explicit decorative and descriptive alternatives', () => {
  const result = evaluateMarkupSafety([
    '<img src="decorative.webp" alt="">',
    "<img src='service.webp' alt='Technician repairing a boiler'>",
  ])
  assert.deepEqual(result, { security: true, accessibility: true })
})
