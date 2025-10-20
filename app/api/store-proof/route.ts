import { NextRequest, NextResponse } from "next/server";
import { storeProof } from "@/lib/prisma";

/**
 * API Route: Store Proof Metadata
 * 
 * After blockchain registration completes client-side,
 * this endpoint stores the proof metadata in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      proofId,
      wallet,
      modelInfo,
      promptHash,
      outputHash,
      promptCID,
      outputCID,
      outputType,
      txHash,
    } = body;

    // Validate required fields
    if (!proofId || !wallet || !modelInfo || !promptHash || !outputHash || !promptCID || !outputCID || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate outputType
    if (outputType && !["text", "image"].includes(outputType)) {
      return NextResponse.json(
        { error: "Invalid outputType. Must be 'text' or 'image'" },
        { status: 400 }
      );
    }

    console.log(`📝 Storing proof metadata in database: ${proofId}`);

    // Store in database
    const proof = await storeProof({
      proofId,
      wallet,
      modelInfo,
      promptHash,
      outputHash,
      promptCID,
      outputCID,
      outputType: outputType || "text",
      txHash,
    });

    console.log(`✅ Proof metadata stored successfully: ${proof.id}`);

    return NextResponse.json({
      success: true,
      proof: {
        id: proof.id,
        proofId: proof.proofId,
        wallet: proof.wallet,
        modelInfo: proof.modelInfo,
        createdAt: proof.createdAt.toISOString(),
      },
      message: "Proof metadata stored successfully",
    });

  } catch (error) {
    console.error("❌ Error storing proof metadata:", error);
    
    // Check for unique constraint violation (proof already exists)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Proof already exists in database" },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to store proof metadata",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
