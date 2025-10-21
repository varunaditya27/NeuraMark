import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Mint Authorship Token
 * 
 * After proof registration completes, this endpoint triggers the
 * client-side minting of a soulbound NFT representing authorship.
 * 
 * Flow:
 * 1. Client uploads to IPFS (/api/register-proof)
 * 2. Client registers proof on blockchain (via MetaMask)
 * 3. Client stores proof metadata (/api/store-proof)
 * 4. Client mints authorship token (THIS ENDPOINT - via MetaMask)
 * 5. Client updates proof with tokenId (/api/update-proof-token)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      proofId,
      wallet,
    } = body;

    // Validate required fields
    if (!proofId || !wallet) {
      return NextResponse.json(
        { error: "Missing required fields: proofId and wallet" },
        { status: 400 }
      );
    }

    console.log(`🎨 Initiating authorship token mint for proof: ${proofId}`);

    // This endpoint just validates the request
    // The actual minting happens client-side via authorshipTokenClient.ts
    // After minting, client calls /api/update-proof-token to store tokenId

    return NextResponse.json({
      success: true,
      message: "Ready to mint authorship token. Proceed with client-side minting.",
      proofId,
      wallet,
    });

  } catch (error) {
    console.error("❌ Error in mint-token API:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to prepare token minting",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
