#!/usr/bin/env node
import { redactedConfigFingerprint, validateRuntimeConfig } from '../config/runtime-contract.mjs'

const [service] = process.argv.slice(2)
if (!service) {
  console.error('usage: node deploy/scripts/validate-runtime-config.mjs <cms|web-master|autowork-worker|program-orchestrator>')
  process.exit(64)
}

try {
  const result = validateRuntimeConfig(process.env, service)
  if (!result.ok) {
    console.error(JSON.stringify({ status: 'invalid_configuration', service, schemaVersion: result.schemaVersion, errors: result.errors.map(({ name, error }) => ({ name, error })) }))
    process.exit(78)
  }
  console.log(JSON.stringify({ status: 'valid_configuration', service, schemaVersion: result.schemaVersion, configurationFingerprint: redactedConfigFingerprint(process.env, service) }))
} catch (error) {
  console.error(JSON.stringify({ status: 'invalid_configuration', service, error: error instanceof Error ? error.message : 'unknown error' }))
  process.exit(64)
}
