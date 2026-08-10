#!/usr/bin/env node
import { spawn } from 'node:child_process'

const [service, ...command] = process.argv.slice(2)
if (!service || command.length === 0) {
  console.error('usage: node deploy/scripts/entrypoint.mjs <service> <command...>')
  process.exit(64)
}

const validator = spawn(process.execPath, ['/app/deploy/scripts/validate-runtime-config.mjs', service], { stdio: 'inherit', env: process.env })
validator.once('exit', (code) => {
  if (code !== 0) process.exit(code ?? 78)
  const child = spawn(command[0], command.slice(1), { stdio: 'inherit', env: process.env })
  const forward = (signal) => child.kill(signal)
  process.once('SIGTERM', () => forward('SIGTERM'))
  process.once('SIGINT', () => forward('SIGINT'))
  child.once('exit', (childCode, signal) => process.exitCode = childCode ?? (signal ? 1 : 0))
})
