import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { walletId } = await request.json();

    if (!walletId) {
      return NextResponse.json(
        { error: "Wallet ID is required" },
        { status: 400 }
      );
    }

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
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet || wallet.userId !== user.id) {
      return NextResponse.json(
        { error: "Wallet not found or does not belong to you" },
        { status: 404 }
      );
    }

    // Prevent unlinking primary wallet if it's the only one
    if (wallet.isPrimary) {
      const walletCount = await prisma.wallet.count({
        where: { userId: user.id },
      });

      if (walletCount === 1) {
        return NextResponse.json(
          { error: "Cannot unlink your only wallet" },
          { status: 400 }
        );
      }

      // Set another wallet as primary
      const nextWallet = await prisma.wallet.findFirst({
        where: {
          userId: user.id,
          id: { not: walletId },
        },
      });

      if (nextWallet) {
        await prisma.wallet.update({
          where: { id: nextWallet.id },
          data: { isPrimary: true },
        });
      }
    }

    // Delete wallet
    await prisma.wallet.delete({
      where: { id: walletId },
    });

    return NextResponse.json({
      success: true,
      message: "Wallet unlinked successfully",
    });
  } catch (error) {
    console.error("Error unlinking wallet:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to unlink wallet",
      },
      { status: 500 }
    );
  }
}
