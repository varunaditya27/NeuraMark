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
    // Check userId first, then fall back to wallet ownership for backward compatibility
    let isOwner = false;
    
    console.log(`🔍 [VC Issue] Checking ownership for proof ${proofId}`);
    console.log(`   - Requesting user (could be firebaseUid or User.id): ${userId}`);
    console.log(`   - Proof userId: ${proof.userId || 'null'}`);
    console.log(`   - Proof wallet: ${proof.wallet}`);
    
    // Get the actual Supabase User.id from firebaseUid (userId might be either)
    let actualUserId = userId;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },           // Direct Supabase User.id
          { firebaseUid: userId },  // Firebase UID
        ],
      },
    });
    
    if (!user) {
      console.log(`❌ [VC Issue] User not found in database`);
      return NextResponse.json(
        { 
          error: 'User not found',
          debug: {
            requestingUserId: userId,
          }
        },
        { status: 404 }
      );
    }
    
    actualUserId = user.id; // Use the Supabase User.id
    console.log(`   - Resolved to Supabase User.id: ${actualUserId} (firebaseUid: ${user.firebaseUid})`);
    
    if (proof.userId) {
      // Direct userId match (new proofs)
      isOwner = proof.userId === actualUserId;
      console.log(`   - Direct userId match: ${isOwner}`);
    } else {
      // Fallback: Check if user's wallet matches proof wallet (old proofs)
      const userWallets = await prisma.wallet.findMany({
        where: { userId: actualUserId },
        select: { address: true },
      });
      
      console.log(`   - User's linked wallets: ${userWallets.map(w => w.address).join(', ') || 'none'}`);
      
      const walletAddresses = userWallets.map(w => w.address.toLowerCase());
      isOwner = walletAddresses.includes(proof.wallet.toLowerCase());
      
      console.log(`   - Wallet match: ${isOwner}`);
      
      // If ownership confirmed via wallet, update the proof with userId
      if (isOwner) {
        await prisma.proof.update({
          where: { proofId: proof.proofId },
          data: { userId: actualUserId },
        });
        console.log(`✅ Migrated proof ${proofId} to userId: ${actualUserId}`);
      }
    }

    if (!isOwner) {
      console.log(`❌ [VC Issue] Ownership verification failed`);
      return NextResponse.json(
        { 
          error: 'Unauthorized: You do not own this proof',
          debug: {
            proofWallet: proof.wallet,
            proofUserId: proof.userId || null,
            requestingUserId: userId,
          }
        },
        { status: 403 }
      );
    }
    
    console.log(`✅ [VC Issue] Ownership verified for user ${userId}`);

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
