import { NextRequest, NextResponse } from "next/server";
import { uploadToIPFS } from "@/lib/pinata";
import { registerProof as registerProofOnChain } from "@/lib/ethersClient";
import { storeProof } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, output, modelInfo, promptHash, outputHash, wallet } = body;

    // Validate input
    if (!prompt || !output || !modelInfo || !promptHash || !outputHash || !wallet) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Upload to IPFS
    console.log("📤 Uploading content to IPFS...");
    const promptCID = await uploadToIPFS(prompt, `prompt-${Date.now()}.txt`);
    const outputCID = await uploadToIPFS(output, `output-${Date.now()}.txt`);

    console.log(`✅ IPFS Upload Complete: Prompt CID = ${promptCID}, Output CID = ${outputCID}`);

    // Note: The actual blockchain transaction happens client-side via MetaMask
    // This API endpoint handles IPFS upload and database storage coordination
    
    // Return the CIDs so the client can proceed with blockchain registration
    return NextResponse.json({
      success: true,
      promptCID,
      outputCID,
      message: "Content uploaded to IPFS. Ready for blockchain registration."
    });

  } catch (error) {
    console.error("❌ Error in register-proof API:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to register proof",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Alternative: Complete server-side registration (requires private key - NOT RECOMMENDED for production)
export async function registerProofComplete(body: {
  prompt: string;
  output: string;
  modelInfo: string;
  promptHash: string;
  outputHash: string;
  wallet: string;
}) {
  const { prompt, output, modelInfo, promptHash, outputHash, wallet } = body;

  // Upload to IPFS
  const promptCID = await uploadToIPFS(prompt, `prompt-${Date.now()}.txt`);
  const outputCID = await uploadToIPFS(output, `output-${Date.now()}.txt`);

  // Register on blockchain (requires signer - should be done client-side)
  const result = await registerProofOnChain(
    promptHash,
    outputHash,
    modelInfo,
    promptCID,
    outputCID
  );

  // Store in database
  await storeProof({
    proofId: result.proofId,
    wallet,
    modelInfo,
    promptHash,
    outputHash,
    promptCID,
    outputCID,
    txHash: result.txHash,
  });

  return {
    success: true,
    proofId: result.proofId,
    txHash: result.txHash,
    promptCID,
    outputCID,
  };
}
