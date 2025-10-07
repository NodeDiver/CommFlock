import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCommunitySchema } from "@/lib/validators";
import { generateSlug } from "@/lib/slug";
import { logger } from "@/lib/logger";

/**
 * GET /api/communities - Fetches public communities with pagination and search
 *
 * Supports two pagination modes:
 * 1. Client-side: ?skip=0&take=10 → Returns array of communities
 * 2. Server-side: ?page=1&limit=10 → Returns {communities, pagination}
 *
 * @param request - NextRequest with query params: search, skip, take, page, limit
 * @returns Array of communities or object with pagination metadata
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Support both skip/take (for client-side pagination) and page/limit (for server-side pagination)
    const skip = searchParams.get("skip");
    const take = searchParams.get("take");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Determine which pagination style to use
    const useSkipTake = skip !== null && take !== null;
    const skipAmount = useSkipTake ? parseInt(skip) : (page - 1) * limit;
    const takeAmount = useSkipTake ? parseInt(take) : limit;

    const where = {
      isPublic: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [communities, total] = await Promise.all([
      db.community.findMany({
        where,
        include: {
          _count: {
            select: { members: true },
          },
          owner: {
            select: { username: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: skipAmount,
        take: takeAmount,
      }),
      db.community.count({ where }),
    ]);

    // If using skip/take, return just the array for client-side pagination
    if (useSkipTake) {
      return NextResponse.json(communities);
    }

    // Otherwise return object with pagination metadata
    return NextResponse.json({
      communities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/communities - Creates a new community
 *
 * Flow:
 * 1. Validates user session
 * 2. Validates community data with Zod schema
 * 3. Generates slug from name if not provided
 * 4. Creates simulated payment record (21 sats)
 * 5. Creates community and owner membership in transaction
 *
 * @param request - NextRequest with JSON body: name, description, isPublic, joinPolicy, etc.
 * @returns Created community object with owner membership
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCommunitySchema.parse(body);

    // Generate slug if not provided
    const slug = validatedData.slug || generateSlug(validatedData.name);

    // Check if slug already exists
    const existingCommunity = await db.community.findUnique({
      where: { slug },
    });

    if (existingCommunity) {
      return NextResponse.json(
        { error: "Slug already taken" },
        { status: 400 },
      );
    }

    // Create payment record (simulated)
    await db.payment.create({
      data: {
        userId: session.user.id,
        amountSats: 21,
        status: "PAID_SIMULATED",
      },
    });

    // Create community and owner membership in a transaction
    const community = await db.$transaction(async (tx) => {
      const newCommunity = await tx.community.create({
        data: {
          name: validatedData.name,
          slug,
          description: validatedData.description,
          isPublic: validatedData.isPublic,
          joinPolicy: validatedData.joinPolicy,
          requiresLightningAddress: validatedData.requiresLightningAddress,
          requiresNostrPubkey: validatedData.requiresNostrPubkey,
          ownerId: session.user.id,
        },
      });

      // Create owner membership
      await tx.communityMember.create({
        data: {
          userId: session.user.id,
          communityId: newCommunity.id,
          role: "OWNER",
          status: "APPROVED",
        },
      });

      return newCommunity;
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    logger.error("Error creating community:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 },
    );
  }
}
