import { NextRequest, NextResponse } from "next/server";
import { uploadToIPFS } from "@/lib/pinata";
import { registerProof as registerProofOnChain } from "@/lib/ethersClient";
import { storeProof } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    let prompt: string;
    let output: string | undefined;
    let outputType: string;
    let modelInfo: string;
    let promptHash: string;
    let outputHash: string;
    let wallet: string;
    let imageFile: File | undefined;

    // Handle both JSON and FormData
    if (contentType.includes("application/json")) {
      const body = await request.json();
      ({ prompt, output, outputType = "text", modelInfo, promptHash, outputHash, wallet } = body);
      
      // Validate input for text
      if (!prompt || !output || !modelInfo || !promptHash || !outputHash || !wallet) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      prompt = formData.get("prompt") as string;
      outputType = formData.get("outputType") as string;
      modelInfo = formData.get("modelInfo") as string;
      promptHash = formData.get("promptHash") as string;
      outputHash = formData.get("outputHash") as string;
      wallet = formData.get("wallet") as string;
      imageFile = formData.get("imageFile") as File;

      // Validate input for image
      if (!prompt || !imageFile || !modelInfo || !promptHash || !outputHash || !wallet) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    // Step 1: Upload to IPFS
    console.log("📤 Uploading content to IPFS...");
    const promptCID = await uploadToIPFS(prompt, `prompt-${Date.now()}.txt`);
    
    let outputCID: string;
    
    if (outputType === "text" && output) {
      outputCID = await uploadToIPFS(output, `output-${Date.now()}.txt`);
    } else if (outputType === "image" && imageFile) {
      // Upload image file to IPFS
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExtension = imageFile.name.split(".").pop() || "png";
      outputCID = await uploadToIPFS(buffer, `output-${Date.now()}.${fileExtension}`);
    } else {
      return NextResponse.json(
        { error: "Invalid output type or missing output data" },
        { status: 400 }
      );
    }

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
    outputType: "text", // Default for this legacy function
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
