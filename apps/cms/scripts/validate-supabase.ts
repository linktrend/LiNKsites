import fs from 'node:fs'
import path from 'node:path'

const rootDir = path.resolve(process.cwd(), '../../')
const migrationsDir = path.resolve(rootDir, 'supabase/migrations')

const sqlFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))

const namingPattern = /^\d{8}_\d{6}_lsites_[a-z0-9_]+\.sql$/
const nonCompliant = sqlFiles.filter((file) => !namingPattern.test(file))
if (nonCompliant.length > 0) {
  throw new Error(`Non-compliant migration names: ${nonCompliant.join(', ')}`)
}

if (sqlFiles.length === 0) {
  throw new Error('No Supabase migration files found.')
}

const missingDown = sqlFiles.filter((file) => {
  const contents = fs.readFileSync(path.resolve(migrationsDir, file), 'utf-8')
  return !contents.includes('-- migrate:down')
})

if (missingDown.length > 0) {
  throw new Error(`Missing down migration markers in: ${missingDown.join(', ')}`)
}

console.log('[supabase] Migrations present and include down markers.')
