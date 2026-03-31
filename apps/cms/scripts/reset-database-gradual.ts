import pg from 'pg'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const { Client } = pg

type QueryRow = Record<string, any>

async function resetDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  })

  try {
    await client.connect()
    console.log('✓ Connected to database')

    // Get all tables in the public schema
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `)

    console.log(`Found ${result.rows.length} tables to drop`)

    // Drop tables one by one with CASCADE
    for (const row of result.rows) {
      const tableName = row.tablename
      try {
        await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`)
        console.log(`  ✓ Dropped ${tableName}`)
      } catch (err: any) {
        console.log(`  ⚠ Warning dropping ${tableName}:`, err.message)
      }
    }

    // Drop all enums
    const enumResult = await client.query(`
      SELECT t.typname as enumname
      FROM pg_type t 
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typtype = 'e' 
      AND n.nspname = 'public'
    `)

    console.log(`\nFound ${enumResult.rows.length} enums to drop`)

    for (const row of enumResult.rows) {
      const enumName = row.enumname
      try {
        await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`)
        console.log(`  ✓ Dropped enum ${enumName}`)
      } catch (err: any) {
        console.log(`  ⚠ Warning dropping enum ${enumName}:`, err.message)
      }
    }

    // Drop all sequences
    const seqResult = await client.query(`
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
    `)

    console.log(`\nFound ${seqResult.rows.length} sequences to drop`)

    for (const row of seqResult.rows) {
      const seqName = row.sequence_name
      try {
        await client.query(`DROP SEQUENCE IF EXISTS "${seqName}" CASCADE`)
        console.log(`  ✓ Dropped sequence ${seqName}`)
      } catch (err: any) {
        console.log(`  ⚠ Warning dropping sequence ${seqName}:`, err.message)
      }
    }

    console.log('\n🎉 Database reset successfully!')
    console.log('All tables, enums, and sequences have been dropped.')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await client.end()
  }
}

resetDatabase()
