import { db } from "@/lib/db";

// Use the same database connection as the app
const prisma = db;

/**
 * Clean database before each test
 */
export async function cleanDatabase() {
  // Delete in correct order to respect foreign key constraints
  await prisma.pollVote.deleteMany({});
  await prisma.poll.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.communityMember.deleteMany({});
  await prisma.community.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.user.deleteMany({});
}

/**
 * Create a test user
 */
export async function createTestUser(data?: {
  username?: string;
  email?: string;
  hashedPassword?: string | null;
}) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  const userData: {
    username: string;
    email: string;
    hashedPassword?: string | null;
  } = {
    username: data?.username || `testuser_${timestamp}_${random}`,
    email: data?.email || `test_${timestamp}_${random}@example.com`,
  };

  // Only set hashedPassword if it's provided and not undefined
  // undefined means use default, null means explicitly no password
  if (data && "hashedPassword" in data) {
    userData.hashedPassword = data.hashedPassword;
  } else if (!data) {
    userData.hashedPassword = "$2b$12$testhashedpassword";
  }

  return prisma.user.create({
    data: userData,
  });
}

/**
 * Create a test community
 */
export async function createTestCommunity(
  ownerId: string,
  data?: {
    name?: string;
    slug?: string;
    isPublic?: boolean;
  },
) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return prisma.community.create({
    data: {
      name: data?.name || `Test Community ${timestamp}`,
      slug: data?.slug || `test-community-${timestamp}-${random}`,
      description: "A test community",
      isPublic: data?.isPublic ?? true,
      joinPolicy: "AUTO_JOIN",
      ownerId,
    },
  });
}

/**
 * Add user as community member
 */
export async function addCommunityMember(
  userId: string,
  communityId: string,
  role: "OWNER" | "ADMIN" | "MEMBER" = "MEMBER",
) {
  return prisma.communityMember.create({
    data: {
      userId,
      communityId,
      role,
      status: "APPROVED",
    },
  });
}

export { prisma as testDb };
