import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@commflock.com',
    },
  })

  console.log('Created demo user:', demoUser.username)

  // Create demo community
  const demoCommunity = await prisma.community.upsert({
    where: { slug: 'demo-community' },
    update: {},
    create: {
      name: 'Demo Community',
      slug: 'demo-community',
      description: 'A demo community to showcase CommFlock features',
      isPublic: true,
      joinPolicy: 'AUTO_JOIN',
      ownerId: demoUser.id,
    },
  })

  console.log('Created demo community:', demoCommunity.name)

  // Create owner membership
  await prisma.communityMember.upsert({
    where: {
      userId_communityId: {
        userId: demoUser.id,
        communityId: demoCommunity.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      communityId: demoCommunity.id,
      role: 'OWNER',
      status: 'APPROVED',
      points: 100,
    },
  })

  // Create demo announcement
  await prisma.announcement.create({
    data: {
      communityId: demoCommunity.id,
      title: 'Welcome to Demo Community!',
      body: 'This is a demo community created to showcase the features of CommFlock. Feel free to explore and test the platform.',
      createdById: demoUser.id,
    },
  })

  // Create demo event
  await prisma.event.create({
    data: {
      communityId: demoCommunity.id,
      title: 'Demo Event',
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      capacity: 50,
      priceSats: 100,
      status: 'OPEN',
      createdById: demoUser.id,
    },
  })

  // Create demo poll
  await prisma.poll.create({
    data: {
      communityId: demoCommunity.id,
      question: 'What is your favorite feature of CommFlock?',
      options: [
        { key: 'events', label: 'Events' },
        { key: 'polls', label: 'Polls' },
        { key: 'badges', label: 'Badges' },
        { key: 'payments', label: 'Lightning Payments' },
      ],
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdById: demoUser.id,
    },
  })

  // Create demo badge
  const demoBadge = await prisma.badge.create({
    data: {
      communityId: demoCommunity.id,
      name: 'Early Adopter',
      description: 'For users who joined during the early days',
      icon: '🚀',
    },
  })

  // Award badge to demo user
  await prisma.userBadge.create({
    data: {
      userId: demoUser.id,
      badgeId: demoBadge.id,
    },
  })

  console.log('Database seeded successfully!')
  console.log('Demo user:', demoUser.username)
  console.log('Demo community:', demoCommunity.slug)
  console.log('Visit: http://localhost:3000/demo-community')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
