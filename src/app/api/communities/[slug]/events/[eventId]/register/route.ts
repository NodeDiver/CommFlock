import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; eventId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    // Find the event
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        community: true,
        registrations: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event is open for registration
    if (event.status !== "OPEN") {
      const statusMessages = {
        DRAFT:
          "This event is still being planned and is not yet open for registration.",
        CONFIRMED: "Registration for this event has closed.",
        CANCELLED: "This event has been cancelled.",
        EXPIRED: "This event has already ended.",
      };
      return NextResponse.json(
        {
          error:
            statusMessages[event.status as keyof typeof statusMessages] ||
            "Event is not open for registration",
        },
        { status: 400 },
      );
    }

    // Check if event is full
    if (event.registrations.length >= event.capacity) {
      return NextResponse.json(
        {
          error: `This event is at full capacity (${event.capacity} attendees). Please check back later in case spots become available.`,
        },
        { status: 400 },
      );
    }

    // Check if user is already registered
    const existingRegistration = event.registrations.find(
      (r) => r.userId === session.user.id,
    );
    if (existingRegistration) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400 },
      );
    }

    // Check if user is a member of the community
    const membership = await db.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: event.communityId,
        },
      },
    });

    if (!membership || membership.status !== "APPROVED") {
      return NextResponse.json(
        { error: "You must be a member of this community" },
        { status: 403 },
      );
    }

    // Create payment record (simulated)
    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        eventId: event.id,
        amountSats: event.priceSats,
        status: "PAID_SIMULATED",
        providerMeta: {
          type: "event_registration",
          simulated: true,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Create registration
    const registration = await db.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        status: "paid",
        paymentId: payment.id,
      },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    logger.error("Error registering for event:", error);
    return NextResponse.json(
      {
        error:
          "Unable to complete registration at this time. Please try again later or contact support if the problem persists.",
      },
      { status: 500 },
    );
  }
}
