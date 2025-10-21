import { NextRequest, NextResponse } from "next/server";
import {
  getDIDByUserId,
  updateDID,
} from "@/lib/prisma";
import {
  updateDIDWithProof,
  addWalletToDID,
  removeWalletFromDID,
  uploadDIDToIPFS,
  type DIDDocument,
  type ProofReference,
} from "@/lib/didClient";

/**
 * PATCH /api/did/update
 * Update DID document
 * Supports: adding proof, adding/removing wallet
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      action, // "addProof" | "addWallet" | "removeWallet"
      data,
    } = body;

    // Validation
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: "userId and action are required" },
        { status: 400 }
      );
    }

    // Fetch existing DID
    const existingDID = await getDIDByUserId(userId);

    if (!existingDID) {
      return NextResponse.json(
        { success: false, error: "DID not found for this user" },
        { status: 404 }
      );
    }

    let updatedDocument = existingDID.didDocument as unknown as DIDDocument;

    // Handle different update actions
    switch (action) {
      case "addProof": {
        if (!data || !data.proofId) {
          return NextResponse.json(
            { success: false, error: "Proof data is required" },
            { status: 400 }
          );
        }

        const proofReference: ProofReference = {
          proofId: data.proofId,
          ipfsCID: data.ipfsCID,
          model: data.model,
          timestamp: data.timestamp,
          txHash: data.txHash,
        };

        updatedDocument = updateDIDWithProof(updatedDocument, proofReference);
        break;
      }

      case "addWallet": {
        if (!data || !data.walletAddress) {
          return NextResponse.json(
            { success: false, error: "Wallet address is required" },
            { status: 400 }
          );
        }

        updatedDocument = addWalletToDID(updatedDocument, data.walletAddress);
        break;
      }

      case "removeWallet": {
        if (!data || !data.walletAddress) {
          return NextResponse.json(
            { success: false, error: "Wallet address is required" },
            { status: 400 }
          );
        }

        updatedDocument = removeWalletFromDID(updatedDocument, data.walletAddress);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Upload updated document to IPFS
    const newIpfsCID = await uploadDIDToIPFS(updatedDocument);

    // Calculate new proof count
    const newProofCount = updatedDocument.verifiedProofs.length;

    // Update in database
    const updatedDID = await updateDID(userId, {
      didDocument: updatedDocument as unknown as Record<string, unknown>,
      ipfsCID: newIpfsCID,
      proofCount: newProofCount,
    });

    return NextResponse.json({
      success: true,
      did: {
        id: updatedDID.id,
        didId: updatedDID.didId,
        ipfsCID: updatedDID.ipfsCID,
        proofCount: updatedDID.proofCount,
        updatedAt: updatedDID.updatedAt.toISOString(),
      },
      message: `DID updated: ${action} completed`,
    });
  } catch (error) {
    console.error("Error updating DID:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update DID",
      },
      { status: 500 }
    );
  }
}
