import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

type QueryRow = Record<string, any>

async function checkUser() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  // Check user
  const user = await client.query(
    'SELECT id, email, first_name, last_name, hash, salt, enable_a_p_i_key, login_attempts FROM users WHERE email = $1',
    ['sysadmin@linktrend.media']
  )
  
  console.log('User record:', user.rows[0])
  
  if (user.rows[0]) {
    // Check user role relationship
    const userRole = await client.query(
      'SELECT * FROM users_rels WHERE parent_id = $1 AND path = $2',
      [user.rows[0].id, 'role']
    )
    console.log('\nUser role relationship:', userRole.rows)
    
    // Check assigned sites
    const userSites = await client.query(
      'SELECT * FROM users_rels WHERE parent_id = $1 AND path = $2',
      [user.rows[0].id, 'assignedSites']
    )
    console.log('\nUser assigned sites:', userSites.rows)
    
    // Check password hash format
    console.log('\nPassword hash starts with:', user.rows[0].hash?.substring(0, 10))
    console.log('Salt value:', user.rows[0].salt?.substring(0, 10))
  }

  await client.end()
}

checkUser().catch(console.error)
