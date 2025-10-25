/**
 * NeuraMark Credential Schema Endpoint
 * 
 * Returns the JSON-LD context definition for NeuraMark Verifiable Credentials.
 * This makes the credentials fully self-describing and W3C compliant.
 * 
 * Accessible at: https://neura-mark.vercel.app/schemas/credentials
 */

import { NextResponse } from 'next/server';

const NEURAMARK_CONTEXT = {
  '@context': {
    '@version': 1.1,
    '@protected': true,
    
    // Base vocabulary
    AIContentProofCredential: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#AIContentProofCredential',
      '@type': '@id',
    },
    AIContentProof: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#AIContentProof',
      '@type': '@id',
    },
    
    // Proof fields
    promptHash: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#promptHash',
      '@type': 'http://www.w3.org/2001/XMLSchema#string',
    },
    outputHash: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#outputHash',
      '@type': 'http://www.w3.org/2001/XMLSchema#string',
    },
    promptCID: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#promptCID',
      '@type': 'http://www.w3.org/2001/XMLSchema#string',
    },
    outputCID: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#outputCID',
      '@type': 'http://www.w3.org/2001/XMLSchema#string',
    },
    modelInfo: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#modelInfo',
      '@type': 'http://www.w3.org/2001/XMLSchema#string',
    },
    outputType: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#outputType',
      '@type': 'http://www.w3.org/2001/XMLSchema#string',
    },
    
    // Blockchain proof
    blockchainProof: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#blockchainProof',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        network: {
          '@id': 'https://neura-mark.vercel.app/schemas/credentials#network',
          '@type': 'http://www.w3.org/2001/XMLSchema#string',
        },
        contractAddress: {
          '@id': 'https://neura-mark.vercel.app/schemas/credentials#contractAddress',
          '@type': 'http://www.w3.org/2001/XMLSchema#string',
        },
        transactionHash: {
          '@id': 'https://neura-mark.vercel.app/schemas/credentials#transactionHash',
          '@type': 'http://www.w3.org/2001/XMLSchema#string',
        },
        proofId: {
          '@id': 'https://neura-mark.vercel.app/schemas/credentials#proofId',
          '@type': 'http://www.w3.org/2001/XMLSchema#string',
        },
        timestamp: {
          '@id': 'https://neura-mark.vercel.app/schemas/credentials#timestamp',
          '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        },
      },
    },
    
    // IPFS metadata
    ipfsMetadata: {
      '@id': 'https://neura-mark.vercel.app/schemas/credentials#ipfsMetadata',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        promptCID: {
          '@id': 'https://neura-mark.vercel.app/schemas/credentials#promptCID',
          '@type': 'http://www.w3.org/2001/XMLSchema#string',
        },
        outputCID: {
          '@id': 'https://neura-mark.vercel.app/schemas/credentials#outputCID',
          '@type': 'http://www.w3.org/2001/XMLSchema#string',
        },
      },
    },
    
    // Schema.org compatibility
    name: 'https://schema.org/name',
  },
};

export async function GET() {
  return NextResponse.json(NEURAMARK_CONTEXT, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
