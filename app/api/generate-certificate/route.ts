/**
 * API Route: Generate Proof Certificate
 * 
 * Accepts proof data and returns a professionally formatted PDF certificate
 * with QR code linking to the blockchain transaction.
 * 
 * POST /api/generate-certificate
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateProofCertificate, CertificateData } from '@/lib/pdfGenerator';

/**
 * POST handler for certificate generation
 * 
 * Expected request body:
 * {
 *   proofTitle: string;
 *   creatorWallet: string;
 *   ipfsCID: string;
 *   txHash: string;
 *   timestamp: string;
 *   proofFingerprint: string;
 *   modelInfo?: string;
 *   etherscanUrl?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'proofTitle',
      'creatorWallet',
      'ipfsCID',
      'txHash',
      'timestamp',
      'proofFingerprint',
    ];

    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Prepare certificate data
    const certificateData: CertificateData = {
      proofTitle: body.proofTitle,
      creatorWallet: body.creatorWallet,
      ipfsCID: body.ipfsCID,
      txHash: body.txHash,
      timestamp: body.timestamp,
      proofFingerprint: body.proofFingerprint,
      modelInfo: body.modelInfo,
      etherscanUrl: body.etherscanUrl,
    };

    // Generate PDF certificate
    const pdfBytes = await generateProofCertificate(certificateData);

    // Create filename with truncated proof fingerprint
    const shortFingerprint = certificateData.proofFingerprint.substring(0, 16);
    const filename = `neuramark-certificate-${shortFingerprint}.pdf`;

    // Convert Uint8Array to Buffer for NextResponse
    const pdfBuffer = Buffer.from(pdfBytes);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate certificate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    message: 'NeuraMark Certificate Generator API',
    method: 'POST',
    endpoint: '/api/generate-certificate',
    requiredFields: [
      'proofTitle',
      'creatorWallet',
      'ipfsCID',
      'txHash',
      'timestamp',
      'proofFingerprint',
    ],
    optionalFields: [
      'modelInfo',
      'etherscanUrl',
    ],
    response: 'PDF file (application/pdf)',
  });
}
