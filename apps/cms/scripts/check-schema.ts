import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

type QueryRow = {
  column_name: string
  data_type: string
  [key: string]: any
}

async function checkSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()
  
  // Check roles table columns
  const rolesColumns = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'roles'
    ORDER BY ordinal_position
  `)
  
  console.log('Roles table columns:')
  rolesColumns.rows.forEach((row: QueryRow) => console.log(`  - ${row.column_name}: ${row.data_type}`))
  
  // Check users table columns
  const usersColumns = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `)
  
  console.log('\nUsers table columns:')
  usersColumns.rows.forEach((row: QueryRow) => console.log(`  - ${row.column_name}: ${row.data_type}`))
  
  // Check for user relationship tables
  const userTables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND (table_name LIKE 'users_%' OR table_name LIKE '%_users')
    ORDER BY table_name
  `)
  
  console.log('\nUser-related tables:')
  userTables.rows.forEach((row: QueryRow) => console.log(`  - ${row.table_name}`))
  
  await client.end()
}

checkSchema().catch(console.error)
