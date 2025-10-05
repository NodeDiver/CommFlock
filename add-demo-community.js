const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addDemoCommunity() {
  try {
    console.log('Adding new demo community to Neon database...')
    
    // Create a new user for the community
    const newUser = await prisma.user.create({
      data: {
        username: 'lightningdev',
        email: 'lightningdev@example.com',
        lightningAddress: 'lightningdev@getalby.com'
      }
    })
    
    console.log('✅ Created user:', newUser.username)
    
    // Create the new community
    const newCommunity = await prisma.community.create({
      data: {
        name: 'Lightning Developers',
        slug: 'lightning-dev',
        description: 'A community for Lightning Network developers and enthusiasts. Share knowledge, build projects, and connect with the Lightning ecosystem.',
        isPublic: true,
        joinPolicy: 'AUTO_JOIN',
        requiresLightningAddress: true,
        requiresNostrPubkey: false,
        ownerId: newUser.id
      }
    })
    
    console.log('✅ Created community:', newCommunity.name)
    
    // Add the owner as a member
    await prisma.communityMember.create({
      data: {
        userId: newUser.id,
        communityId: newCommunity.id,
        role: 'OWNER',
        status: 'APPROVED',
        points: 100
      }
    })
    
    console.log('✅ Added owner as member')
    
    // Create a welcome announcement
    await prisma.announcement.create({
      data: {
        communityId: newCommunity.id,
        title: 'Welcome to Lightning Developers!',
        body: 'Welcome to our Lightning Network developers community! Here we share knowledge, build projects, and connect with the Lightning ecosystem. Feel free to introduce yourself and share your Lightning projects.',
        createdById: newUser.id
      }
    })
    
    console.log('✅ Created welcome announcement')
    
    // Create a sample event
    const eventStart = new Date()
    eventStart.setDate(eventStart.getDate() + 7) // Next week
    const eventEnd = new Date(eventStart)
    eventEnd.setHours(eventEnd.getHours() + 2)
    
    await prisma.event.create({
      data: {
        communityId: newCommunity.id,
        title: 'Lightning Development Workshop',
        startsAt: eventStart,
        endsAt: eventEnd,
        capacity: 30,
        priceSats: 5000, // 5000 sats
        minQuorum: 5,
        status: 'OPEN',
        createdById: newUser.id
      }
    })
    
    console.log('✅ Created sample event')
    
    // Create a sample poll
    const pollEnd = new Date()
    pollEnd.setDate(pollEnd.getDate() + 14) // 2 weeks from now
    
    await prisma.poll.create({
      data: {
        communityId: newCommunity.id,
        question: 'What Lightning project are you most excited about?',
        options: [
          { key: 'lnbits', label: 'LNbits' },
          { key: 'alby', label: 'Alby' },
          { key: 'lightspark', label: 'Lightspark' },
          { key: 'voltage', label: 'Voltage' },
          { key: 'other', label: 'Other' }
        ],
        endsAt: pollEnd,
        visibleVotes: true,
        createdById: newUser.id
      }
    })
    
    console.log('✅ Created sample poll')
    
    console.log('\n🎉 Successfully added Lightning Developers community!')
    console.log(`📱 Visit: http://localhost:3000/en/lightning-dev`)
    console.log(`📱 Or: http://localhost:3000/es/lightning-dev`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

addDemoCommunity()
