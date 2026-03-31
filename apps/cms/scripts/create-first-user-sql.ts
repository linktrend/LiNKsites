import pg from 'pg'
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

// Load environment variables
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

  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  })

  try {
    await client.connect()
    console.log('✓ Connected to database')

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
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
      // Create Super Admin role
      console.log('⚠️  Super Admin role not found, creating...')
      const roleInsert = await client.query(
        `INSERT INTO roles (name, description, permissions, updated_at, created_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING id`,
        [
          'Super Admin',
          'Full system access with all permissions',
          JSON.stringify([
            'read',
            'create',
            'update',
            'delete',
            'publish',
            'approve',
            'manage_users',
            'manage_roles',
            'manage_sites',
          ]),
        ]
      )
      roleId = roleInsert.rows[0].id
      console.log('✓ Created Super Admin role:', roleId)

      // Link role to all sites
      for (const siteId of allSiteIds) {
        await client.query(
          'INSERT INTO roles_rels (order, parent_id, path, sites_id) VALUES ($1, $2, $3, $4)',
          [0, roleId, 'sites', siteId]
        )
      }
      console.log('✓ Linked role to all sites')
    }

    // Hash password using bcrypt (Payload's default)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(FIRST_USER.password, salt)

    // Insert user
    const userInsert = await client.query(
      `INSERT INTO users (email, password, "firstName", "lastName", role, updated_at, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id`,
      [FIRST_USER.email, hashedPassword, FIRST_USER.firstName, FIRST_USER.lastName, roleId]
    )

    const userId = userInsert.rows[0].id
    console.log('✓ Created user:', userId)

    // Link user to all sites (users_assigned_sites)
    let order = 0
    for (const siteId of allSiteIds) {
      await client.query(
        'INSERT INTO users_assigned_sites (order, parent_id, sites_id) VALUES ($1, $2, $3)',
        [order++, userId, siteId]
      )
    }
    console.log('✓ Assigned user to', allSiteIds.length, 'site(s)')

    // Link user to all locales (users_allowed_locales)
    order = 0
    for (const langId of allLanguageIds) {
      await client.query(
        'INSERT INTO users_allowed_locales (order, parent_id, languages_id) VALUES ($1, $2, $3)',
        [order++, userId, langId]
      )
    }
    console.log('✓ Assigned user to', allLanguageIds.length, 'locale(s)')

    console.log('\n✅ First user created successfully!')
    console.log('\nLogin credentials:')
    console.log('  Email:', FIRST_USER.email)
    console.log('  Password:', FIRST_USER.password)
    console.log('  Role: Super Admin (ID:', roleId + ')')
    console.log('  Assigned Sites:', allSiteIds.length)
    console.log('  Allowed Locales:', allLanguageIds.length)
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
