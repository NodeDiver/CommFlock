import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// 35 diverse demo communities
const communities = [
  // Bitcoin/Lightning (10)
  {
    name: "Lightning Developers",
    slug: "lightning-devs",
    description: "Building the future of instant Bitcoin payments",
  },
  {
    name: "Bitcoin Meetup NYC",
    slug: "bitcoin-nyc",
    description: "Monthly Bitcoin meetups in New York City",
  },
  {
    name: "Nostr Enthusiasts",
    slug: "nostr-enthusiasts",
    description: "Exploring decentralized social media on Nostr",
  },
  {
    name: "Lightning Node Runners",
    slug: "ln-node-runners",
    description: "Share knowledge about running Lightning Network nodes",
  },
  {
    name: "Bitcoin Artists",
    slug: "bitcoin-artists",
    description: "Creating art inspired by Bitcoin and freedom",
  },
  {
    name: "Satoshi Nakamoto Institute",
    slug: "satoshi-institute",
    description: "Study Bitcoin's origins and philosophy",
  },
  {
    name: "Lightning Payments Merchants",
    slug: "ln-merchants",
    description: "Businesses accepting Lightning payments",
  },
  {
    name: "Bitcoin Privacy Advocates",
    slug: "bitcoin-privacy",
    description: "Learn about privacy tools and best practices",
  },
  {
    name: "Mining Community",
    slug: "mining-community",
    description: "Bitcoin mining enthusiasts and professionals",
  },
  {
    name: "Bitcoin Educators",
    slug: "bitcoin-educators",
    description: "Teaching others about Bitcoin and sound money",
  },

  // Tech/Developer (10)
  {
    name: "Open Source Contributors",
    slug: "open-source",
    description: "Collaborate on open source projects",
  },
  {
    name: "Web3 Builders",
    slug: "web3-builders",
    description: "Building decentralized applications",
  },
  {
    name: "Rust Developers",
    slug: "rust-devs",
    description: "Learning and building with Rust",
  },
  {
    name: "React Community",
    slug: "react-community",
    description: "React developers sharing tips and tricks",
  },
  {
    name: "TypeScript Wizards",
    slug: "typescript-wizards",
    description: "Master TypeScript together",
  },
  {
    name: "DevOps Engineers",
    slug: "devops-engineers",
    description: "Infrastructure, CI/CD, and automation",
  },
  {
    name: "Indie Hackers",
    slug: "indie-hackers",
    description: "Building and launching products independently",
  },
  {
    name: "AI/ML Researchers",
    slug: "ai-ml-researchers",
    description: "Exploring artificial intelligence and machine learning",
  },
  {
    name: "Cybersecurity Experts",
    slug: "cybersecurity",
    description: "Information security professionals",
  },
  {
    name: "Game Developers",
    slug: "game-devs",
    description: "Creating amazing gaming experiences",
  },

  // Regional/Local (8)
  {
    name: "San Francisco Tech",
    slug: "sf-tech",
    description: "Bay Area technology professionals",
  },
  {
    name: "London Startup Scene",
    slug: "london-startups",
    description: "Entrepreneurs and founders in London",
  },
  {
    name: "Berlin Creative Collective",
    slug: "berlin-creative",
    description: "Artists and creators in Berlin",
  },
  {
    name: "Tokyo Innovation Hub",
    slug: "tokyo-innovation",
    description: "Innovation and technology in Tokyo",
  },
  {
    name: "Austin Music Community",
    slug: "austin-music",
    description: "Musicians and music lovers in Austin",
  },
  {
    name: "Miami Crypto Meetup",
    slug: "miami-crypto",
    description: "Cryptocurrency enthusiasts in Miami",
  },
  {
    name: "Remote Workers Global",
    slug: "remote-workers",
    description: "Digital nomads and remote work tips",
  },
  {
    name: "Latin America Devs",
    slug: "latam-devs",
    description: "Developers across Latin America",
  },

  // Hobby/Interest (7)
  {
    name: "Coffee Lovers Unite",
    slug: "coffee-lovers",
    description: "Discussing the perfect brew",
  },
  {
    name: "Photography Club",
    slug: "photography-club",
    description: "Share your best shots and learn techniques",
  },
  {
    name: "Book Club",
    slug: "book-club",
    description: "Monthly book discussions and recommendations",
  },
  {
    name: "Gaming Guild",
    slug: "gaming-guild",
    description: "Multiplayer gaming and esports",
  },
  {
    name: "Fitness Enthusiasts",
    slug: "fitness",
    description: "Health, workout tips, and motivation",
  },
  {
    name: "Travel Adventurers",
    slug: "travel-adventurers",
    description: "Share travel stories and tips",
  },
  {
    name: "Cooking & Recipes",
    slug: "cooking-recipes",
    description: "Delicious recipes and cooking techniques",
  },
];

async function main() {
  console.log("Seeding database...");

  // Create demo user with password
  const demoPassword = await bcrypt.hash("demo1234", 12);
  const demoUser = await prisma.user.upsert({
    where: { username: "demo" },
    update: {},
    create: {
      username: "demo",
      email: "demo@commflock.com",
      hashedPassword: demoPassword,
    },
  });

  console.log("✓ Created demo user:", demoUser.username);
  console.log("  Demo credentials: username=demo, password=demo1234");

  // Create all 35 communities
  console.log("\n📦 Creating 35 demo communities...");
  for (const communityData of communities) {
    const community = await prisma.community.upsert({
      where: { slug: communityData.slug },
      update: {},
      create: {
        name: communityData.name,
        slug: communityData.slug,
        description: communityData.description,
        isPublic: true,
        joinPolicy: "AUTO_JOIN",
        ownerId: demoUser.id,
      },
    });

    // Create owner membership
    await prisma.communityMember.upsert({
      where: {
        userId_communityId: {
          userId: demoUser.id,
          communityId: community.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        communityId: community.id,
        role: "OWNER",
        status: "APPROVED",
        points: 100,
      },
    });

    console.log(`  ✓ ${community.name}`);
  }

  // Get the first community for demo content
  const demoCommunity = await prisma.community.findFirst({
    where: { slug: "lightning-devs" },
  });

  if (!demoCommunity) {
    throw new Error("Demo community not found");
  }

  console.log("\n📝 Adding demo content to Lightning Developers community...");

  // Create demo announcement
  await prisma.announcement.upsert({
    where: { id: "demo-announcement-1" },
    update: {},
    create: {
      id: "demo-announcement-1",
      communityId: demoCommunity.id,
      title: "Welcome to Lightning Developers!",
      body: "Join us in building the future of instant Bitcoin payments. Share your projects, ask questions, and collaborate with fellow Lightning developers.",
      createdById: demoUser.id,
    },
  });

  // Create demo event
  await prisma.event.upsert({
    where: { id: "demo-event-1" },
    update: {},
    create: {
      id: "demo-event-1",
      communityId: demoCommunity.id,
      title: "Lightning Network Workshop",
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      capacity: 50,
      priceSats: 100,
      status: "OPEN",
      createdById: demoUser.id,
    },
  });

  // Create demo poll
  await prisma.poll.upsert({
    where: { id: "demo-poll-1" },
    update: {},
    create: {
      id: "demo-poll-1",
      communityId: demoCommunity.id,
      question: "What Lightning feature would you like to learn next?",
      options: [
        { key: "channels", label: "Channel Management" },
        { key: "routing", label: "Payment Routing" },
        { key: "watchtowers", label: "Watchtowers" },
        { key: "splicing", label: "Channel Splicing" },
      ],
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdById: demoUser.id,
    },
  });

  // Create demo badge
  const demoBadge = await prisma.badge.upsert({
    where: { id: "demo-badge-1" },
    update: {},
    create: {
      id: "demo-badge-1",
      communityId: demoCommunity.id,
      name: "Lightning Pioneer",
      description: "For early contributors to the Lightning community",
      icon: "⚡",
    },
  });

  // Award badge to demo user
  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId: demoUser.id,
        badgeId: demoBadge.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      badgeId: demoBadge.id,
    },
  });

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`  • 35 public communities created`);
  console.log(`  • 1 demo user: ${demoUser.username} (password: demo1234)`);
  console.log(`  • Demo content in Lightning Developers community`);
  console.log("\n🌐 Visit:");
  console.log(
    "  • Landing page: http://localhost:3000/en or http://localhost:3000/es",
  );
  console.log(
    "  • Lightning Developers: http://localhost:3000/en/lightning-devs",
  );
  console.log("\n💡 Try the Load More feature on the landing page!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
