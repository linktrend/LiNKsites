#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const requiredAlerts = [
  'LiNKsitesFoundationTargetDown',
  'LiNKsitesFoundationRuntimeAttention',
  'LiNKsitesFoundationRuntimeMetricsMissing',
  'LiNKsitesFoundationBackupStale',
  'LiNKsitesFoundationRestoreRehearsalStale',
]
const secretLiteral = /((?:api[_-]?key|access[_-]?token|preview[_-]?token|password|secret)\s*[:=]\s*)[^\s,}]+|ltfx\.[a-z0-9.]+|postgresql:\/\/[^:\s]+:[^@\s]+@/i
const forbiddenIntake = 'linksites_program_intake_enabled != 0'

function unquote(value) {
  const trimmed = value.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function extractAlerts(text) {
  if (!/^groups:\n/m.test(text)) throw new Error('rules file must start with a Prometheus groups document')
  const chunks = text.split(/\n\s*- alert: /).slice(1)
  if (chunks.length === 0) throw new Error('rules file contains no alert rules')
  return chunks.map((chunk, index) => {
    const lines = chunk.split('\n')
    const alert = lines[0].trim()
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(alert)) throw new Error(`invalid alert name at rule ${index + 1}`)
    const field = (name) => {
      const match = chunk.match(new RegExp(`(?:^|\\n)\\s*${name}:\\s*(.+)`))
      return match ? unquote(match[1]) : null
    }
    const expr = field('expr')
    const severity = chunk.match(/\n\s*severity:\s*(\S+)/)?.[1]
    const summary = field('summary')
    if (!expr) throw new Error(`${alert} is missing expr`)
    if (!severity) throw new Error(`${alert} is missing labels.severity`)
    if (!summary) throw new Error(`${alert} is missing annotations.summary`)
    if (/https?:\/\/[^\s]*token=/i.test(chunk)) throw new Error(`${alert} contains a token-bearing URL`)
    if (/\b(for|labels|annotations):\s*$/m.test(chunk) === false && !chunk.includes('\n        for:') && !chunk.includes('\n        labels:')) {
      throw new Error(`${alert} is missing for/labels/annotations structure`)
    }
    return { alert, expr, labels: { severity }, annotations: { summary } }
  })
}

export function validateMonitoringSource(repositoryRoot = root) {
  const rulesPath = resolve(repositoryRoot, 'deploy/monitoring/server03-foundation.rules.yml')
  const planPath = resolve(repositoryRoot, 'deploy/monitoring/isolated-restore.plan.json')
  const operationsPath = resolve(repositoryRoot, 'deploy/OPERATIONS.md')
  const rulesText = readFileSync(rulesPath, 'utf8')
  const operations = readFileSync(operationsPath, 'utf8')
  const plan = JSON.parse(readFileSync(planPath, 'utf8'))
  const errors = []
  if (secretLiteral.test(rulesText) || secretLiteral.test(operations) || secretLiteral.test(JSON.stringify(plan))) {
    errors.push('monitoring or operations source contains a credential-shaped literal')
  }
  if (rulesText.includes(forbiddenIntake)) errors.push('rules must not alert on expected intake being enabled')
  let alerts = []
  try {
    alerts = extractAlerts(rulesText)
  } catch (error) {
    errors.push(`rules yaml parse failed: ${error.message}`)
  }
  for (const name of requiredAlerts) {
    if (!alerts.some((rule) => rule.alert === name)) errors.push(`missing required alert ${name}`)
  }
  if (!alerts.some((rule) => String(rule.expr).includes('linksites_program_dead_letters_total'))) {
    errors.push('dead-letter signal is missing')
  }
  if (!alerts.some((rule) => String(rule.expr).includes('linksites_program_active_issues'))) {
    errors.push('active-issues signal is missing')
  }
  if (plan.productionProject !== 'linksites-foundation') errors.push('plan must name only the LiNKsites production project')
  if (plan.restoreExecuted !== false) errors.push('plan must not claim a restore receipt')
  if (plan.neverOverwriteProduction !== true) errors.push('plan must forbid production overwrite')
  if (!plan.isolatedRestore?.cleanupOwnResourcesOnly) errors.push('plan must clean up only its own resources')
  const restorePattern = new RegExp(plan.isolatedRestore.projectNamePattern)
  if (restorePattern.test('linksites-foundation')) errors.push('restore project pattern matches production')
  if (!operations.includes('linksites-restore-rehearsal-')) errors.push('OPERATIONS.md must name the isolated restore project prefix')
  if (!operations.includes('STOP')) errors.push('OPERATIONS.md must include exact STOP conditions')
  if (!operations.includes('five-digest') && !operations.includes('five digest')) {
    errors.push('OPERATIONS.md must document rollback to the prior five-digest manifest')
  }
  for (const name of plan.longRunningServices) {
    if (!operations.includes(name)) errors.push(`OPERATIONS.md missing long-running service ${name}`)
  }
  let promtool = null
  try {
    execFileSync('promtool', ['check', 'rules', rulesPath], { cwd: repositoryRoot, encoding: 'utf8' })
    promtool = 'passed'
  } catch (error) {
    if (error && error.code === 'ENOENT') promtool = 'absent'
    else errors.push(`promtool check rules failed: ${error.stderr || error.message}`)
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return {
    schemaVersion: '1.0.0',
    result: 'passed',
    rules: rulesPath,
    alerts: alerts.map((rule) => rule.alert),
    promtool,
    restoreExecuted: false,
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validate-rules.mjs')) {
  const report = validateMonitoringSource(root)
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
}
