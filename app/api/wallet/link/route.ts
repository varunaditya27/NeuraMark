import { NextRequest, NextResponse } from "next/server";
import { prisma, getDIDByUserId, updateDID } from "@/lib/prisma";
import { addWalletToDID, uploadDIDToIPFS, type DIDDocument } from "@/lib/didClient";

export async function POST(request: NextRequest) {
  try {
    const { address, isPrimary, label } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Get Firebase UID from request header
    const firebaseUid = request.headers.get("x-firebase-uid");
    if (!firebaseUid) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Linking wallet for Firebase UID:", firebaseUid);

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      console.error("User not found in database for Firebase UID:", firebaseUid);
      return NextResponse.json(
        { error: "User not found in database. Please refresh the page and try again." },
        { status: 404 }
      );
    }

    console.log("Found user:", user.id);

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (existingWallet) {
      if (existingWallet.userId === user.id) {
        return NextResponse.json(
          { error: "Wallet already linked to your account" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Wallet already linked to another account" },
          { status: 400 }
        );
      }
    }

    // If this is the primary wallet, unset other primary wallets
    if (isPrimary) {
      await prisma.wallet.updateMany({
        where: { userId: user.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Create wallet link
    const wallet = await prisma.wallet.create({
      data: {
        address: address.toLowerCase(),
        userId: user.id,
        isPrimary: isPrimary || false,
        label,
      },
    });

    // Update DID document with new wallet
    try {
      const did = await getDIDByUserId(user.id);
      if (did) {
        const didDocument = did.didDocument as unknown as DIDDocument;
        const updatedDocument = addWalletToDID(didDocument, address.toLowerCase());
        const newIpfsCID = await uploadDIDToIPFS(updatedDocument);

        await updateDID(user.id, {
          didDocument: updatedDocument as unknown as Record<string, unknown>,
          ipfsCID: newIpfsCID,
        });

        console.log(`✅ DID updated with new wallet: ${address}`);
      }
    } catch (didError) {
      console.error("❌ Error updating DID (non-blocking):", didError);
      // Don't fail wallet linking if DID update fails
    }

    return NextResponse.json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error("Error linking wallet:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to link wallet",
      },
      { status: 500 }
    );
  }
}
