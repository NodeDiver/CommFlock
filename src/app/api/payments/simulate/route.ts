import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amountSats = 21, type = "community" } = body;

    // Create simulated payment
    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        amountSats,
        status: "PAID_SIMULATED",
        providerMeta: {
          type,
          simulated: true,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      id: payment.id,
      status: "PAID_SIMULATED",
      amountSats,
      message: "Payment simulated successfully",
    });
  } catch (error) {
    logger.error("Error simulating payment:", error);
    return NextResponse.json(
      { error: "Failed to simulate payment" },
      { status: 500 },
    );
  }
}
