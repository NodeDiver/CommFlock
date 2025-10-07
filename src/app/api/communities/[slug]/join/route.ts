import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const community = await db.community.findUnique({
      where: { slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 },
      );
    }

    // Check if user is already a member
    const existingMembership = await db.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: community.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this community" },
        { status: 400 },
      );
    }

    // Check community requirements
    if (community.requiresLightningAddress || community.requiresNostrPubkey) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
      });

      if (community.requiresLightningAddress && !user?.lightningAddress) {
        return NextResponse.json(
          { error: "This community requires a Lightning address" },
          { status: 400 },
        );
      }

      if (community.requiresNostrPubkey && !user?.nostrPubkey) {
        return NextResponse.json(
          { error: "This community requires a Nostr pubkey" },
          { status: 400 },
        );
      }
    }

    // Determine membership status based on join policy
    let status: "PENDING" | "APPROVED" = "PENDING";
    if (community.joinPolicy === "AUTO_JOIN") {
      status = "APPROVED";
    }

    // Create membership
    const membership = await db.communityMember.create({
      data: {
        userId: session.user.id,
        communityId: community.id,
        status,
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    logger.error("Error joining community:", error);
    return NextResponse.json(
      {
        error:
          "Unable to join community at this time. Please try again later or contact support if the problem persists.",
      },
      { status: 500 },
    );
  }
}
