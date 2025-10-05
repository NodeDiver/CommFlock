const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking Neon database...')
    
    // Check all communities
    const communities = await prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { username: true } },
        _count: { select: { members: true } }
      }
    })
    
    console.log(`\n📊 Found ${communities.length} communities:`)
    communities.forEach((community, index) => {
      console.log(`${index + 1}. ${community.name} (${community.slug})`)
      console.log(`   Public: ${community.isPublic}`)
      console.log(`   Owner: ${community.owner.username}`)
      console.log(`   Members: ${community._count.members}`)
      console.log(`   Created: ${community.createdAt.toISOString()}`)
      console.log('')
    })
    
    // Check all users
    const users = await prisma.user.findMany({
      select: { username: true, email: true, createdAt: true }
    })
    
    console.log(`👥 Found ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email || 'no email'})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
