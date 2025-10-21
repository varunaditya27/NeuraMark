import { NextRequest, NextResponse } from "next/server";
import { getDIDByDIDId, getDIDByWallet } from "@/lib/prisma";

/**
 * GET /api/did/get?didId=<didId>
 * OR
 * GET /api/did/get?wallet=<walletAddress>
 * 
 * Public endpoint to fetch DID document for verification
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const didId = searchParams.get("didId");
    const wallet = searchParams.get("wallet");

    if (!didId && !wallet) {
      return NextResponse.json(
        { success: false, error: "Either didId or wallet parameter is required" },
        { status: 400 }
      );
    }

    let did;

    if (didId) {
      did = await getDIDByDIDId(didId);
    } else if (wallet) {
      did = await getDIDByWallet(wallet);
    }

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
