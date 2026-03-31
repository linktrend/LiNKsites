import pg from 'pg'
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

const { Client } = pg

type QueryRow = Record<string, any>

const FIRST_USER = {
  email: 'sysadmin@linktrend.media',
  password: 'cuhjyz-nabhap-muXpi9',
  firstName: 'System',
  lastName: 'Admin',
}

async function createFirstUser() {
  console.log('🚀 Creating first user directly in database...\n')

  const client = new Client({ connectionString: process.env.DATABASE_URI })

  try {
    await client.connect()
    console.log('✓ Connected to database')

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 AND first_name IS NOT NULL LIMIT 1',
      [FIRST_USER.email]
    )

    if (existingUser.rows.length > 0) {
      console.log('⚠️  User already exists:', FIRST_USER.email)
      console.log('✓ User ID:', existingUser.rows[0].id)
      process.exit(0)
    }

    // Get all sites
    const sites = await client.query('SELECT id FROM sites ORDER BY id')
    const allSiteIds = sites.rows.map((row: QueryRow) => row.id)
    console.log('✓ Found', allSiteIds.length, 'site(s)')

    // Get all languages
    const languages = await client.query('SELECT id FROM languages ORDER BY id')
    const allLanguageIds = languages.rows.map((row: QueryRow) => row.id)
    console.log('✓ Found', allLanguageIds.length, 'language(s)')

    // Get or create Super Admin role
    let roleResult = await client.query(
      "SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1"
    )

    let roleId: number

    if (roleResult.rows.length > 0) {
      roleId = roleResult.rows[0].id
      console.log('✓ Found Super Admin role:', roleId)
    } else {
      // Create Super Admin role with all permissions set to true
      console.log('⚠️  Super Admin role not found, creating...')
      const roleInsert = await client.query(
        `INSERT INTO roles (
          name, description, 
          permissions_read, permissions_create, permissions_update, permissions_delete,
          permissions_publish, permissions_approve, permissions_submit_for_review,
          permissions_manage_users, permissions_manage_roles, permissions_manage_sites,
          is_default, updated_at, created_at
        ) VALUES ($1, $2, true, true, true, true, true, true, true, true, true, true, false, NOW(), NOW()) 
        RETURNING id`,
        ['Super Admin', 'Full system access with all permissions']
      )
      roleId = roleInsert.rows[0].id
      console.log('✓ Created Super Admin role:', roleId)

      // Link role to all sites via roles_rels
      for (let i = 0; i < allSiteIds.length; i++) {
        await client.query(
          'INSERT INTO roles_rels ("order", parent_id, path, sites_id) VALUES ($1, $2, $3, $4)',
          [i, roleId, 'sites', allSiteIds[i]]
        )
      }
      console.log('✓ Linked role to all sites')
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(FIRST_USER.password, salt)

    // Insert user (using Payload CMS columns, not Supabase Auth)
    const userInsert = await client.query(
      `INSERT INTO users (
        email, hash, salt, first_name, last_name, 
        enable_a_p_i_key, login_attempts, lock_until,
        updated_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, false, 0, NULL, NOW(), NOW()) 
      RETURNING id`,
      [FIRST_USER.email, hashedPassword, salt, FIRST_USER.firstName, FIRST_USER.lastName]
    )

    const userId = userInsert.rows[0].id
    console.log('✓ Created user:', userId)

    // Link user to role via users_rels
    await client.query(
      'INSERT INTO users_rels ("order", parent_id, path, roles_id) VALUES ($1, $2, $3, $4)',
      [0, userId, 'role', roleId]
    )
    console.log('✓ Linked user to Super Admin role')

    // Link user to all sites via users_rels (assignedSites)
    for (let i = 0; i < allSiteIds.length; i++) {
      await client.query(
        'INSERT INTO users_rels ("order", parent_id, path, sites_id) VALUES ($1, $2, $3, $4)',
        [i, userId, 'assignedSites', allSiteIds[i]]
      )
    }
    console.log('✓ Assigned user to', allSiteIds.length, 'site(s)')

    // We would also need to link languages, but let's check if there's a languages_id column in users_rels
    const usersRelsColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users_rels' AND column_name LIKE '%language%'
    `)
    
    if (usersRelsColumns.rows.length > 0) {
      const languagesColumn = usersRelsColumns.rows[0].column_name
      for (let i = 0; i < allLanguageIds.length; i++) {
        await client.query(
          `INSERT INTO users_rels ("order", parent_id, path, ${languagesColumn}) VALUES ($1, $2, $3, $4)`,
          [i, userId, 'allowedLocales', allLanguageIds[i]]
        )
      }
      console.log('✓ Assigned user to', allLanguageIds.length, 'locale(s)')
    }

    console.log('\n✅ First user created successfully!')
    console.log('\nLogin credentials:')
    console.log('  Email:', FIRST_USER.email)
    console.log('  Password:', FIRST_USER.password)
    console.log('  Role: Super Admin (ID:', roleId, ')')
    console.log('  User ID:', userId)
    console.log('\n🔗 Login at: http://localhost:3000/admin/login')
    console.log('\n⚠️  Remember to start the dev server: pnpm dev')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating first user:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

createFirstUser()
