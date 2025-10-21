import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateDID,
  createDIDDocument,
  uploadDIDToIPFS,
} from "@/lib/didClient";
import { createDID } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, displayName, photoURL } = await request.json();

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { did: true }, // Include DID to check if it exists
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists", user: existingUser },
        { status: 200 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        firebaseUid,
        email,
        displayName,
        photoURL,
      },
    });

    console.log(`✅ User created: ${user.id}`);

    // Automatically create DID for new user
    try {
      const didId = generateDID(user.id);
      const didDocument = createDIDDocument(
        user.id,
        email,
        displayName || "Anonymous",
        [] // No wallets yet
      );

      // Upload DID to IPFS
      const ipfsCID = await uploadDIDToIPFS(didDocument);

      // Store DID in database
      await createDID({
        didId,
        userId: user.id,
        didDocument: didDocument as unknown as Record<string, unknown>,
        ipfsCID,
        proofCount: 0,
      });

      console.log(`✅ DID created for user: ${didId}`);
    } catch (didError) {
      console.error("❌ Error creating DID (non-blocking):", didError);
      // Don't fail user creation if DID creation fails
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 }
    );
  }
}
