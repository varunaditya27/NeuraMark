/**
 * ERC-721 Metadata API Endpoint
 * 
 * Returns standard NFT metadata for AuthorshipToken.
 * Compatible with OpenSea and other NFT marketplaces.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    
    // Validate tokenId
    if (!tokenId || isNaN(Number(tokenId))) {
      return NextResponse.json(
        { error: "Invalid token ID" },
        { status: 400 }
      );
    }

    // Fetch proof data from database
    const proof = await prisma.proof.findFirst({
      where: {
        tokenId: tokenId.toString(),
      },
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });

    if (!proof) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Determine proof type for attributes
    let proofType = "Text";
    if (proof.outputType === "image") {
      proofType = "Image";
    } else if (
      proof.modelInfo.toLowerCase().includes("code") ||
      proof.modelInfo.toLowerCase().includes("copilot") ||
      proof.modelInfo.toLowerCase().includes("codex")
    ) {
      proofType = "Code";
    }

    // Format timestamp
    const formattedDate = new Date(proof.createdAt).toISOString();

    // Construct IPFS image URL
    // Use output CID for image preview
    const imageUrl = `ipfs://${proof.outputCID}`;

    // Build ERC-721 compliant metadata
    const metadata = {
      name: `NeuraMark Authorship Token #${tokenId}`,
      description: `Immutable proof of authorship for AI-generated ${proofType.toLowerCase()} content. This soulbound NFT certifies that ${proof.user?.displayName || proof.wallet} created AI content using ${proof.modelInfo} on ${formattedDate}.`,
      external_url: `https://neuramark.com/explorer?tokenId=${tokenId}`,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Model",
          value: proof.modelInfo,
        },
        {
          trait_type: "Content Type",
          value: proofType,
        },
        {
          trait_type: "Creator",
          value: proof.user?.displayName || `${proof.wallet.slice(0, 6)}...${proof.wallet.slice(-4)}`,
        },
        {
          trait_type: "Timestamp",
          value: formattedDate,
        },
        {
          trait_type: "Prompt Hash",
          value: proof.promptHash.slice(0, 16) + "...",
        },
        {
          trait_type: "Output Hash",
          value: proof.outputHash.slice(0, 16) + "...",
        },
        {
          trait_type: "Blockchain",
          value: "Ethereum Sepolia",
        },
        {
          display_type: "date",
          trait_type: "Created",
          value: Math.floor(new Date(proof.createdAt).getTime() / 1000),
        },
      ],
      properties: {
        prompt_cid: proof.promptCID,
        output_cid: proof.outputCID,
        prompt_hash: proof.promptHash,
        output_hash: proof.outputHash,
        proof_id: proof.proofId,
        tx_hash: proof.txHash,
        token_tx_hash: proof.tokenTxHash,
        soulbound: true,
      },
    };

    // Return metadata with proper caching headers
    return NextResponse.json(metadata, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year (immutable data)
      },
    });
  } catch (error) {
    console.error("❌ Error fetching token metadata:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
