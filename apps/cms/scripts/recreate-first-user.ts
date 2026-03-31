import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

type QueryRow = Record<string, any>

async function recreateUser() {
  console.log('🚀 Recreating first user...\n')

  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  try {
    // Delete existing user
    console.log('Deleting existing user...')
    await client.query('DELETE FROM users_rels WHERE parent_id = 1')
    await client.query('DELETE FROM users WHERE id = 1')
    console.log('✓ Deleted existing user\n')

    // Get site and language IDs
    const sites = await client.query('SELECT id FROM sites ORDER BY id')
    const allSiteIds = sites.rows.map((row: QueryRow) => row.id)
    
    const languages = await client.query('SELECT id FROM languages ORDER BY id')
    const allLanguageIds = languages.rows.map((row: QueryRow) => row.id)
    
    const roleId = 1 // Super Admin role we created before

    // Create user WITHOUT password fields - let Payload handle it
    // We'll use the Payload API to set the password
    const userInsert = await client.query(
      `INSERT INTO users (
        email, first_name, last_name, 
        enable_a_p_i_key, login_attempts, lock_until,
        updated_at, created_at
      ) VALUES ($1, $2, $3, false, 0, NULL, NOW(), NOW()) 
      RETURNING id`,
      ['sysadmin@linktrend.media', 'System', 'Admin']
    )

    const userId = userInsert.rows[0].id
    console.log('✓ Created user:', userId)

    // Link user to role
    await client.query(
      'INSERT INTO users_rels ("order", parent_id, path, roles_id) VALUES ($1, $2, $3, $4)',
      [0, userId, 'role', roleId]
    )
    console.log('✓ Linked user to Super Admin role')

    // Link user to all sites
    for (let i = 0; i < allSiteIds.length; i++) {
      await client.query(
        'INSERT INTO users_rels ("order", parent_id, path, sites_id) VALUES ($1, $2, $3, $4)',
        [i, userId, 'assignedSites', allSiteIds[i]]
      )
    }
    console.log('✓ Assigned user to', allSiteIds.length, 'site(s)')

    console.log('\n✅ User recreated! Now setting password via Payload API...')
    console.log('\n⚠️  IMPORTANT: The user exists but has NO PASSWORD yet.')
    console.log('We need to use Payload\'s forgot-password or update API to set it.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

recreateUser()
