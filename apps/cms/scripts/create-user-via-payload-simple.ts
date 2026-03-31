import payload from 'payload'
import config from '@/payload.config'

async function createUser() {
  console.log('Creating user via Payload API...\n')
  
  try {
    // Don't call payload.init - just import the local payload instance
    const { getPayload } = await import('payload')
    const payloadInstance = await getPayload({ config })
    
    // Delete existing user if exists
    try {
      const existing = await payloadInstance.find({
        collection: 'users',
        where: { email: { equals: 'sysadmin@linktrend.media' } },
        limit: 1,
        overrideAccess: true,
      })
      
      if (existing.docs[0]) {
        await payloadInstance.delete({
          collection: 'users',
          id: existing.docs[0].id,
          overrideAccess: true,
        })
        console.log('✓ Deleted existing user\n')
      }
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Get site and role
    const sites = await payloadInstance.find({
      collection: 'sites',
      limit: 10,
      overrideAccess: true,
    })
    
    const roles = await payloadInstance.find({
      collection: 'roles',
      where: { name: { equals: 'Super Admin' } },
      limit: 1,
      overrideAccess: true,
    })
    
    const languages = await payloadInstance.find({
      collection: 'languages',
      limit: 10,
      overrideAccess: true,
    })

    // Create user
    const user = await payloadInstance.create({
      collection: 'users',
      data: {
        email: 'sysadmin@linktrend.media',
        password: 'cuhjyz-nabhap-muXpi9',
        firstName: 'System',
        lastName: 'Admin',
        roles: [roles.docs[0]?.id] as any,
        assignedSites: sites.docs.map(s => s.id) as any,
        allowedLocales: languages.docs.map(l => l.id) as any,
      },
      overrideAccess: true,
    })

    console.log('✅ User created successfully!')
    console.log('User ID:', user.id)
    console.log('\nLogin at: http://localhost:3000/admin/login')
    console.log('Email: sysadmin@linktrend.media')
    console.log('Password: cuhjyz-nabhap-muXpi9')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createUser()
