#!/usr/bin/env ts-node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

type CollectionConfigLike = {
  slug?: string
  fields?: Array<Record<string, unknown>>
  access?: Record<string, unknown>
  hooks?: Record<string, unknown>
}

type PayloadConfigLike = {
  collections?: CollectionConfigLike[]
  localization?: { locales?: unknown[] }
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const log = (message: string) => console.log(`[prebuild] ${message}`)
const errors: string[] = []

const addError = (message: string) => {
  errors.push(message)
  console.error(`❌ ${message}`)
}

const safeImportConfig = async (): Promise<PayloadConfigLike | null> => {
  try {
    const configPath = path.resolve(rootDir, 'src/payload.config.ts')
    const configModule = await import(pathToFileURL(configPath).href)
    const config = (configModule?.default ?? null) as PayloadConfigLike | null
    if (!config || typeof config !== 'object') {
      addError('Payload config did not export a valid object')
      return null
    }
    return config
  } catch (error) {
    addError(`Failed to load payload config: ${(error as Error).message}`)
    return null
  }
}

const collectFields = (fields: Array<Record<string, unknown>> = []): Array<Record<string, unknown>> => {
  const collected: Array<Record<string, unknown>> = []
  for (const field of fields) {
    collected.push(field)
    const nested = (field as { fields?: Array<Record<string, unknown>> }).fields
    if (Array.isArray(nested)) {
      collected.push(...collectFields(nested))
    }
    const blocks = (field as { blocks?: Array<{ fields?: Array<Record<string, unknown>> }> }).blocks
    if (Array.isArray(blocks)) {
      for (const block of blocks) {
        if (Array.isArray(block.fields)) {
          collected.push(...collectFields(block.fields))
        }
      }
    }
  }
  return collected
}

const hasFieldNamed = (fields: Array<Record<string, unknown>>, name: string): boolean =>
  collectFields(fields).some((field) => field?.name === name)

const hasLocalizedField = (fields: Array<Record<string, unknown>>): boolean =>
  collectFields(fields).some((field) => field?.localized === true)

const validateCollections = (config: PayloadConfigLike) => {
  const { collections = [] } = config
  if (!Array.isArray(collections) || collections.length === 0) {
    addError('No collections found in payload config')
    return
  }

  const siteOptional = new Set([
    'sites',
    'site-domains',
    'languages',
    'roles',
    'users',
    'media',
    'payload-kv',
    'payload-locked-documents',
    'payload-preferences',
    'payload-migrations',
  ])

  for (const collection of collections) {
    if (!collection?.slug || typeof collection.slug !== 'string') {
      addError('Collection missing slug or slug is not a string')
      continue
    }

    const fields = Array.isArray(collection.fields) ? collection.fields : []
    const access = collection.access || {}
    const hooks = collection.hooks || {}

    const isSystem = collection.slug.startsWith?.('payload-') ?? false

    if (!siteOptional.has(collection.slug) && !isSystem && !hasFieldNamed(fields, 'site')) {
      addError(`Collection "${collection.slug}" is missing required "site" field`)
    }

    if (
      config.localization?.locales &&
      config.localization.locales.length > 1 &&
      !isSystem &&
      !siteOptional.has(collection.slug)
    ) {
      const localeFieldPresent =
        hasFieldNamed(fields, 'locale') ||
        hasFieldNamed(fields, 'targetLocale') ||
        hasFieldNamed(fields, 'sourceLocale') ||
        hasLocalizedField(fields)
      if (!localeFieldPresent) {
        addError(
          `Collection "${collection.slug}" has localization enabled but no locale-linked fields were detected`,
        )
      }
    }

    const requiredAccess = ['read', 'create', 'update', 'delete']
    for (const key of requiredAccess) {
      const entry = (access as Record<string, unknown>)[key]
      if (typeof entry !== 'function') {
        addError(`Collection "${collection.slug}" missing access control for "${key}"`)
      }
    }

    const hookGroups = ['beforeChange', 'afterChange', 'afterDelete']
    for (const group of hookGroups) {
      const hookList = (hooks as Record<string, unknown>)[group]
      if (hookList === undefined) continue
      if (!Array.isArray(hookList)) {
        addError(`Collection "${collection.slug}" hook group "${group}" is not an array`)
        continue
      }
      hookList.forEach((hook, index) => {
        if (typeof hook !== 'function') {
          addError(`Collection "${collection.slug}" hook "${group}[${index}]" is not a function`)
        }
      })
    }
  }
}

const runTypeCheck = () => {
  const tscResult = spawnSync(
    'pnpm',
    ['exec', 'tsc', '--noEmit', '--incremental', 'false', '--pretty', 'false'],
    {
      cwd: rootDir,
      stdio: 'pipe',
      env: process.env,
    },
  )

  if (tscResult.status !== 0) {
    const output = `${tscResult.stdout?.toString() ?? ''}${tscResult.stderr?.toString() ?? ''}`
    addError('TypeScript compilation failed (admin UI check).')
    console.error(output.trim())
  }
}

const loadEnvKeys = (filePath: string): Set<string> => {
  if (!fs.existsSync(filePath)) return new Set()
  const content = fs.readFileSync(filePath, 'utf8')
  return new Set(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split('=')[0] ?? ''),
  )
}

const validateEnvVars = () => {
  const envExamplePath = path.resolve(rootDir, '.env.example')
  const envLocalPath = path.resolve(rootDir, '.env.local')
  const documentedKeys: Array<string> = [
    ...Array.from(loadEnvKeys(envExamplePath)),
    ...Array.from(loadEnvKeys(envLocalPath)),
    ...Object.keys(process.env || {}),
  ].filter((key): key is string => typeof key === 'string' && key.length > 0)

  const documented = new Set<string>()
  documentedKeys.forEach((key) => documented.add(key))

  const required = [
    'WEBHOOK_SECRET',
    'N8N_WEBHOOK_URL',
    'N8N_WEBHOOK_SECRET',
    'PAYLOAD_CACHE_TTL_MS',
    'PAYLOAD_CACHE_CAPACITY',
    'YOUTUBE_WEBHOOK_SECRET',
  ]

  for (const key of required) {
    if (!documented.has(key)) {
      addError(`Missing required env variable "${key}" in .env.local or .env.example`)
    }
  }
}

const main = async () => {
  log('Starting prebuild validation...')
  const payloadConfig = await safeImportConfig()
  if (payloadConfig) {
    validateCollections(payloadConfig)
  }
  validateEnvVars()
  runTypeCheck()

  if (errors.length > 0) {
    log(`Validation failed with ${errors.length} issue(s).`)
    process.exit(1)
  }

  log('All checks passed.')
  process.exit(0)
}

void main()
