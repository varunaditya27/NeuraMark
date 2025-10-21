import { NextRequest, NextResponse } from "next/server";
import {
  createDID,
  getDIDByUserId,
  didExistsForUser,
} from "@/lib/prisma";
import {
  generateDID,
  createDIDDocument,
  uploadDIDToIPFS,
} from "@/lib/didClient";

/**
 * POST /api/did/create
 * Create a new DID for a user
 * Automatically uploads DID document to IPFS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, displayName, wallets = [] } = body;

    // Validation
    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: "userId and email are required" },
        { status: 400 }
      );
    }

    // Check if DID already exists
    const existingDID = await didExistsForUser(userId);
    if (existingDID) {
      return NextResponse.json(
        { success: false, error: "DID already exists for this user" },
        { status: 409 }
      );
    }

    // Generate DID ID
    const didId = generateDID(userId);

    // Create DID document
    const didDocument = createDIDDocument(
      userId,
      email,
      displayName || "Anonymous",
      wallets
    );

    // Upload to IPFS
    const ipfsCID = await uploadDIDToIPFS(didDocument);

    // Store in database
    const did = await createDID({
      didId,
      userId,
      didDocument: didDocument as unknown as Record<string, unknown>,
      ipfsCID,
      proofCount: 0,
    });

    return NextResponse.json({
      success: true,
      did: {
        id: did.id,
        didId: did.didId,
        ipfsCID: did.ipfsCID,
        proofCount: did.proofCount,
        createdAt: did.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating DID:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create DID",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/did/create?userId=<userId>
 * Get DID for a user (if exists)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const did = await getDIDByUserId(userId);

    if (!did) {
      return NextResponse.json(
        { success: false, error: "DID not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      did: {
        id: did.id,
        didId: did.didId,
        didDocument: did.didDocument,
        ipfsCID: did.ipfsCID,
        signature: did.signature,
        proofCount: did.proofCount,
        createdAt: did.createdAt.toISOString(),
        updatedAt: did.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching DID:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch DID",
      },
      { status: 500 }
    );
  }
}
