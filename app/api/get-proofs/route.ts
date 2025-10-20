import { NextRequest, NextResponse } from "next/server";
import { getProofsByWallet, getRecentProofs } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get("wallet");
    const limit = searchParams.get("limit");

    let proofs;

    if (wallet) {
      // Get proofs for a specific wallet
      proofs = await getProofsByWallet(wallet);
    } else {
      // Get recent proofs (public feed)
      const limitNum = limit ? parseInt(limit, 10) : 10;
      proofs = await getRecentProofs(limitNum);
    }

    return NextResponse.json({
      success: true,
      proofs: proofs.map((proof) => ({
        id: proof.id,
        proofId: proof.proofId,
        wallet: proof.wallet,
        modelInfo: proof.modelInfo,
        promptHash: proof.promptHash,
        outputHash: proof.outputHash,
        promptCID: proof.promptCID,
        outputCID: proof.outputCID,
        outputType: proof.outputType,
        txHash: proof.txHash,
        createdAt: proof.createdAt.toISOString(),
      })),
      count: proofs.length,
    });
  } catch (error) {
    console.error("❌ Error in get-proofs API:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to get proofs",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
