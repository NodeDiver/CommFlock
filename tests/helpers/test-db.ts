import { PrismaClient } from '@prisma/client'
import { beforeEach } from 'vitest'

// Use a separate test database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
})

/**
 * Clean database before each test
 */
export async function cleanDatabase() {
  const tables = [
    'PollVote',
    'Poll',
    'EventRegistration',
    'Event',
    'Announcement',
    'UserBadge',
    'Badge',
    'Payment',
    'CommunityMember',
    'Community',
    'User',
  ]

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`)
  }
}

/**
 * Create a test user
 */
export async function createTestUser(data?: {
  username?: string
  email?: string
  hashedPassword?: string
}) {
  return prisma.user.create({
    data: {
      username: data?.username || 'testuser',
      email: data?.email || 'test@example.com',
      hashedPassword: data?.hashedPassword || '$2b$12$testhashedpassword',
    },
  })
}

/**
 * Create a test community
 */
export async function createTestCommunity(ownerId: string, data?: {
  name?: string
  slug?: string
  isPublic?: boolean
}) {
  return prisma.community.create({
    data: {
      name: data?.name || 'Test Community',
      slug: data?.slug || 'test-community',
      description: 'A test community',
      isPublic: data?.isPublic ?? true,
      joinPolicy: 'AUTO_JOIN',
      ownerId,
    },
  })
}

/**
 * Add user as community member
 */
export async function addCommunityMember(
  userId: string,
  communityId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER'
) {
  return prisma.communityMember.create({
    data: {
      userId,
      communityId,
      role,
      status: 'APPROVED',
    },
  })
}

export { prisma as testDb }

// Clean database before each test by default
beforeEach(async () => {
  await cleanDatabase()
})
