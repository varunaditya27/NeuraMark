import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API Route: Update Proof with Token Information
 * 
 * After client-side token minting completes, this endpoint updates
 * the proof record with the tokenId and tokenTxHash.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      proofId,
      tokenId,
      tokenTxHash,
    } = body;

    // Validate required fields
    if (!proofId || !tokenId || !tokenTxHash) {
      return NextResponse.json(
        { error: "Missing required fields: proofId, tokenId, tokenTxHash" },
        { status: 400 }
      );
    }

    console.log(`🎨 Updating proof ${proofId} with tokenId: ${tokenId}`);

    // Update the proof record with token information
    const updatedProof = await prisma.proof.update({
      where: {
        proofId: proofId,
      },
      data: {
        tokenId: tokenId.toString(),
        tokenTxHash,
      },
    });

    console.log(`✅ Proof updated successfully with token information`);

    return NextResponse.json({
      success: true,
      proof: {
        id: updatedProof.id,
        proofId: updatedProof.proofId,
        tokenId: updatedProof.tokenId,
        tokenTxHash: updatedProof.tokenTxHash,
      },
      message: "Proof updated with authorship token information",
    });

  } catch (error) {
    console.error("❌ Error updating proof with token:", error);
    
    // Check if proof doesn't exist
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Proof not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to update proof with token",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
