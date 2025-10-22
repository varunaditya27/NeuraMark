/**
 * API Route: Verify Verifiable Credential
 * POST /api/verify-vc
 * 
 * Verifies the cryptographic signature of a W3C Verifiable Credential.
 * Can be called by anyone (public verification) to validate credential authenticity.
 * 
 * Request Body:
 * {
 *   credential: VerifiableCredential  // Full VC object or JSON string
 * }
 * 
 * Response:
 * {
 *   verified: boolean,
 *   credential: VerifiableCredential,
 *   proofSummary: {
 *     owner: string,
 *     modelInfo: string,
 *     timestamp: string,
 *     proofId: string,
 *     txHash: string,
 *     network: string,
 *     issuer: string,
 *     credentialId: string
 *   },
 *   status: {
 *     status: 'valid' | 'invalid' | 'expired',
 *     color: string,
 *     label: string
 *   },
 *   error?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyVerifiableCredential,
  parseCredentialFromJSON,
  extractProofSummary,
  getCredentialStatus,
  type VerifiableCredential,
} from '@/lib/vcClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { credential } = body;

    // Validate credential exists
    if (!credential) {
      return NextResponse.json(
        { error: 'Missing credential in request body' },
        { status: 400 }
      );
    }

    // Parse credential if it's a JSON string
    if (typeof credential === 'string') {
      try {
        credential = parseCredentialFromJSON(credential);
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Invalid credential format',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 400 }
        );
      }
    }

    // Validate credential structure
    if (!credential['@context'] || !credential.type || !credential.credentialSubject) {
      return NextResponse.json(
        { error: 'Invalid W3C Verifiable Credential structure' },
        { status: 400 }
      );
    }

    // Verify cryptographic signature
    const verificationResult = await verifyVerifiableCredential(credential as VerifiableCredential);

    // Extract human-readable proof summary
    const proofSummary = extractProofSummary(credential as VerifiableCredential);

    // Get credential status
    const status = getCredentialStatus(credential as VerifiableCredential, verificationResult);

    return NextResponse.json({
      verified: verificationResult.verified,
      credential,
      proofSummary,
      status,
      error: verificationResult.error,
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify credential',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed. Use POST to verify a verifiable credential.',
      example: {
        method: 'POST',
        body: {
          credential: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'AIContentProofCredential'],
            issuer: { id: 'did:neuramark:platform' },
            credentialSubject: { id: 'did:neuramark:user123' },
            proof: {}
          }
        }
      }
    },
    { status: 405 }
  );
}
