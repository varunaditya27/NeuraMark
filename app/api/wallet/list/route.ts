import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from Firebase token
    const firebaseUid = request.headers.get("x-firebase-uid");
    if (!firebaseUid) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        wallets: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wallets: user.wallets,
    });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch wallets",
      },
      { status: 500 }
    );
  }
}
