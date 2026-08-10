import pg from 'pg'
import type { PostgresRuntimeDependencies, PostgresExecutor } from './postgres-runtime.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The only production database composition for W2-02.
 *
 * This deliberately uses one connected pg Client rather than a pool: the
 * runtime's transaction boundary uses BEGIN/COMMIT and must stay on one
 * connection while advisory locks and state mutations execute. The client is
 * configured with the tenant session setting consumed by the Supabase RLS
 * policies. There is no PGlite, file, or schema-creation fallback here.
 */
export async function createPostgresRuntimeDependencies(): Promise<PostgresRuntimeDependencies> {
  const databaseUri = process.env.DATABASE_URI?.trim()
  const orgId = process.env.W2_02_ORG_ID?.trim()
  if (!databaseUri) throw new Error('W2-02 production requires DATABASE_URI')
  if (!/^postgres(?:ql)?:\/\//i.test(databaseUri)) throw new Error('W2-02 DATABASE_URI must be a PostgreSQL connection string')
  if (!orgId || !UUID.test(orgId)) throw new Error('W2-02 production requires W2_02_ORG_ID as a UUID tenant key')

  const client = new pg.Client({
    connectionString: databaseUri,
    application_name: 'linksites-program-orchestrator-w2-02',
    options: `-c app.org_id=${orgId}`,
  })
  await client.connect()

  const db: PostgresExecutor = {
    query: async (sql, params) => {
      const result = await client.query(sql, params)
      return { rows: result.rows as Record<string, unknown>[] }
    },
    end: async () => { await client.end() },
  }
  return { db, close: db.end }
}
