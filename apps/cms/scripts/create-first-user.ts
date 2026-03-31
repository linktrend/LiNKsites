import payload from 'payload'
import config from '@/payload.config'

const FIRST_USER = {
  email: 'sysadmin@linktrend.media',
  password: 'cuhjyz-nabhap-muXpi9',
  firstName: 'System',
  lastName: 'Admin',
}

async function createFirstUser() {
  console.log('🚀 Creating first user...\n')

  try {
    await payload.init({ config })

    // Check if user already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: FIRST_USER.email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      console.log('⚠️  User already exists:', FIRST_USER.email)
      console.log('✓ User ID:', existing.docs[0]?.id)
      process.exit(0)
    }

    // Get all sites
    const sites = await payload.find({
      collection: 'sites',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    const allSiteIds = sites.docs.map((site) => site.id)
    console.log('✓ Found', allSiteIds.length, 'sites')

    // Get all languages
    const languages = await payload.find({
      collection: 'languages',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    const allLanguageIds = languages.docs.map((lang) => lang.id)
    console.log('✓ Found', allLanguageIds.length, 'languages')

    // Get super admin role (or create if doesn't exist)
    let superAdminRole = await payload.find({
      collection: 'roles',
      where: { name: { equals: 'Super Admin' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let roleId: string | number

    if (superAdminRole.totalDocs > 0 && superAdminRole.docs[0]) {
      roleId = superAdminRole.docs[0].id
      console.log('✓ Found Super Admin role:', roleId)
    } else {
      // Create Super Admin role with all permissions
      console.log('⚠️  Super Admin role not found, creating...')
      const newRole = await payload.create({
        collection: 'roles',
        data: {
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          permissions: {
            read: true,
            create: true,
            update: true,
            delete: true,
            publish: true,
            approve: true,
            manage_users: true,
            manage_roles: true,
            manage_sites: true,
          },
        },
        depth: 0,
        overrideAccess: true,
      })
      roleId = newRole.id
      console.log('✓ Created Super Admin role:', roleId)
    }

    // Create the user
    const user = await payload.create({
      collection: 'users',
      data: {
        email: FIRST_USER.email,
        password: FIRST_USER.password,
        firstName: FIRST_USER.firstName,
        lastName: FIRST_USER.lastName,
        roles: [roleId] as never[],
        assignedSites: allSiteIds as never[],
        allowedLocales: allLanguageIds as never[],
      },
      depth: 0,
      overrideAccess: true,
    })

    console.log('\n✅ First user created successfully!')
    console.log('\nLogin credentials:')
    console.log('  Email:', FIRST_USER.email)
    console.log('  Password:', FIRST_USER.password)
    console.log('  Role: Super Admin')
    console.log('  Assigned Sites:', allSiteIds.length, 'sites')
    console.log('  Allowed Locales:', allLanguageIds.length, 'locales')
    console.log('\n🔗 Login at: http://localhost:3000/admin/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating first user:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      if ('data' in error) {
        console.error('Data:', JSON.stringify((error as any).data, null, 2))
      }
    }
    process.exit(1)
  }
}

createFirstUser()
