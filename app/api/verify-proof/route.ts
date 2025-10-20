import { NextRequest, NextResponse } from "next/server";
import { getProofById } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const proofId = searchParams.get("proofId");

    if (!proofId) {
      return NextResponse.json(
        { error: "Proof ID is required" },
        { status: 400 }
      );
    }

    // Get proof from database
    const proof = await getProofById(proofId);

    if (!proof) {
      return NextResponse.json(
        { error: "Proof not found" },
        { status: 404 }
      );
    }

    // Return proof details
    return NextResponse.json({
      success: true,
      proof: {
        proofId: proof.proofId,
        creator: proof.wallet,
        modelInfo: proof.modelInfo,
        promptHash: proof.promptHash,
        outputHash: proof.outputHash,
        promptCID: proof.promptCID,
        outputCID: proof.outputCID,
        outputType: proof.outputType,
        txHash: proof.txHash,
        timestamp: proof.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error in verify-proof API:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to verify proof",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
