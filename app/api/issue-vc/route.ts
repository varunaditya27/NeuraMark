/**
 * API Route: Issue Verifiable Credential
 * POST /api/issue-vc
 * 
 * Generates a W3C Verifiable Credential for a registered proof.
 * The credential is cryptographically signed and can be verified independently.
 * 
 * Request Body:
 * {
 *   proofId: string;     // Blockchain proof ID
 *   userId: string;      // Firebase user ID (for DID generation)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   credential: VerifiableCredential,  // Signed W3C VC
 *   ipfsCID: string,                   // IPFS CID where VC is stored
 *   downloadURL: string                // Direct download link
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateVerifiableCredential,
  signVerifiableCredential,
  exportCredentialAsJSON,
  generateUserDID,
} from '@/lib/vcClient';
import { getProofById, prisma } from '@/lib/prisma';
import { uploadJSON } from '@/lib/pinata';

/**
 * Update proof record with VC metadata
 */
async function updateProofVCReference(
  proofId: string,
  vcId: string,
  vcIpfsCID: string
) {
  try {
    // Note: vcId and vcIpfsCID fields are in Prisma schema
    // If TypeScript shows an error, restart the dev server to refresh Prisma types
    await prisma.proof.update({
      where: { proofId },
      data: {
        vcId,
        vcIpfsCID,
      },
    });
    console.log(`✅ Updated proof ${proofId} with VC metadata`);
  } catch (error) {
    console.error('Error updating proof with VC metadata:', error);
    // Don't throw - VC generation succeeded, just log the DB update failure
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proofId, userId } = body;

    // Validate required fields
    if (!proofId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: proofId and userId' },
        { status: 400 }
      );
    }

    // Fetch proof data from database
    const proof = await getProofById(proofId);

    if (!proof) {
      return NextResponse.json(
        { error: 'Proof not found' },
        { status: 404 }
      );
    }

    // Verify user owns this proof
    if (proof.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this proof' },
        { status: 403 }
      );
    }

    // Generate user DID
    const userDID = generateUserDID(userId);

    // Get contract address from environment
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Contract address not configured' },
        { status: 500 }
      );
    }

    // Generate unsigned VC
    const unsignedCredential = await generateVerifiableCredential(
      {
        proofId: proof.proofId,
        promptHash: proof.promptHash,
        outputHash: proof.outputHash,
        promptCID: proof.promptCID,
        outputCID: proof.outputCID,
        modelInfo: proof.modelInfo,
        outputType: proof.outputType,
        txHash: proof.txHash,
        timestamp: proof.createdAt,
        walletAddress: proof.wallet,
      },
      userDID,
      contractAddress
    );

    // Sign the credential with NeuraMark's issuer key
    const signedCredential = await signVerifiableCredential(unsignedCredential);

    // Export as JSON string
    const credentialJSON = exportCredentialAsJSON(signedCredential);

    // Upload to IPFS for permanent storage
    const ipfsResult = await uploadJSON(
      credentialJSON,
      `neuramark-vc-${proofId.substring(0, 16)}.json`
    );

    // Update database with VC reference
    await updateProofVCReference(proofId, signedCredential.id, ipfsResult.IpfsHash);

    return NextResponse.json({
      success: true,
      credential: signedCredential,
      ipfsCID: ipfsResult.IpfsHash,
      downloadURL: `https://gateway.pinata.cloud/ipfs/${ipfsResult.IpfsHash}`,
    });
  } catch (error) {
    console.error('Error issuing verifiable credential:', error);
    return NextResponse.json(
      {
        error: 'Failed to issue verifiable credential',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed. Use POST to issue a verifiable credential.',
    },
    { status: 405 }
  );
}
