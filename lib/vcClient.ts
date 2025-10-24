/**
 * W3C Verifiable Credentials (VC) Client
 * Provides utilities for issuing, signing, and verifying verifiable credentials for AI proofs
 * 
 * Features:
 * - W3C VC Data Model v1.1 compliant credential generation
 * - Ed25519 signature-based cryptographic proof
 * - Portable credentials that can be verified independently of NeuraMark
 * - IPFS storage for credential documents
 * - JSON-LD format for maximum interoperability
 * 
 * Key Difference from NFTs/PDFs:
 * - NFTs: On-chain proof tied to Ethereum ecosystem
 * - PDFs: Human-readable certificate without cryptographic verification
 * - VCs: Standardized, machine-verifiable, platform-independent credentials
 */

import { 
  issue,
  verifyCredential as vcVerify,
} from '@digitalbazaar/vc';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';

/**
 * Custom JSON-LD context for NeuraMark-specific credential terms
 */
const NEURAMARK_VC_CONTEXT = {
  '@version': 1.1,
  '@protected': true,
  AIContentProofCredential: 'https://neuramark.ai/credentials#AIContentProofCredential',
  AIContentProof: 'https://neuramark.ai/credentials#AIContentProof',
  promptHash: 'https://neuramark.ai/credentials#promptHash',
  outputHash: 'https://neuramark.ai/credentials#outputHash',
  promptCID: 'https://neuramark.ai/credentials#promptCID',
  outputCID: 'https://neuramark.ai/credentials#outputCID',
  modelInfo: 'https://neuramark.ai/credentials#modelInfo',
  outputType: 'https://neuramark.ai/credentials#outputType',
  name: 'https://schema.org/name',
  blockchainProof: {
    '@id': 'https://neuramark.ai/credentials#blockchainProof',
    '@context': {
      '@version': 1.1,
      '@protected': true,
      network: 'https://neuramark.ai/credentials#network',
      contractAddress: 'https://neuramark.ai/credentials#contractAddress',
      transactionHash: 'https://neuramark.ai/credentials#transactionHash',
      proofId: 'https://neuramark.ai/credentials#proofId',
      timestamp: {
        '@id': 'https://neuramark.ai/credentials#timestamp',
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      },
    },
  },
  ipfsMetadata: {
    '@id': 'https://neuramark.ai/credentials#ipfsMetadata',
    '@context': {
      '@version': 1.1,
      '@protected': true,
      promptCID: 'https://neuramark.ai/credentials#promptCID',
      outputCID: 'https://neuramark.ai/credentials#outputCID',
    },
  },
};

/**
 * Proof metadata for VC credential subject
 */
export interface ProofCredentialSubject {
  id: string; // DID of the proof owner
  type: 'AIContentProof';
  promptHash: string;
  outputHash: string;
  promptCID: string;
  outputCID: string;
  modelInfo: string;
  outputType: string;
  blockchainProof: {
    network: 'Sepolia';
    contractAddress: string;
    transactionHash: string;
    proofId: string;
    timestamp: string;
  };
  ipfsMetadata: {
    promptCID: string;
    outputCID: string;
  };
  [key: string]: unknown;
}

/**
 * W3C Verifiable Credential structure
 */
export interface VerifiableCredential {
  '@context': Array<string | Record<string, unknown>>;
  id: string; // Unique credential ID (UUID)
  type: string[];
  issuer: {
    id: string; // DID of NeuraMark platform
    name: string;
  };
  issuanceDate: string; // ISO 8601 timestamp
  credentialSubject: ProofCredentialSubject;
  proof?: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
  [key: string]: unknown;
}

/**
 * Issuer key pair for signing VCs
 * In production, this should be stored securely (e.g., AWS KMS, Azure Key Vault)
 */
let issuerKeyPair: {
  publicKey: Ed25519VerificationKey2020;
  privateKey: Ed25519VerificationKey2020;
} | null = null;

/**
 * Initialize or retrieve the issuer key pair
 * Uses Ed25519 keys for signing verifiable credentials
 */
async function getIssuerKeyPair() {
  if (issuerKeyPair) {
    return issuerKeyPair;
  }

  // Generate new key pair with proper controller/id (in production, load from secure storage)
  const keyPair = await Ed25519VerificationKey2020.generate({
    controller: 'did:neuramark:platform',
    id: 'did:neuramark:platform#key-1',
  });
  
  issuerKeyPair = {
    publicKey: keyPair,
    privateKey: keyPair,
  };

  return issuerKeyPair;
}

/**
 * Generate a W3C Verifiable Credential for a registered proof
 * 
 * @param proofData - Proof metadata from blockchain and database
 * @param userDID - DID of the user who owns the proof
 * @returns Unsigned verifiable credential
 * 
 * @example
 * const credential = await generateVerifiableCredential({
 *   proofId: '0x1a2b3c...',
 *   promptHash: '0xabc...',
 *   outputHash: '0xdef...',
 *   // ... other proof data
 * }, 'did:neuramark:user123');
 */
export async function generateVerifiableCredential(
  proofData: {
    proofId: string;
    promptHash: string;
    outputHash: string;
    promptCID: string;
    outputCID: string;
    modelInfo: string;
    outputType: string;
    txHash: string;
    timestamp: Date | string;
    walletAddress: string;
  },
  userDID: string,
  contractAddress: string
): Promise<VerifiableCredential> {
  const timestamp = typeof proofData.timestamp === 'string' 
    ? new Date(proofData.timestamp) 
    : proofData.timestamp;

  // Generate unique credential ID
  const credentialId = `urn:uuid:${crypto.randomUUID()}`;

  // Build W3C VC structure
  const credential: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
      NEURAMARK_VC_CONTEXT,
    ],
    id: credentialId,
    type: ['VerifiableCredential', 'AIContentProofCredential'],
    issuer: {
      id: 'did:neuramark:platform',
      name: 'NeuraMark - AI Content Proof Platform',
    },
    issuanceDate: timestamp.toISOString(),
    credentialSubject: {
      id: userDID,
      type: 'AIContentProof',
      promptHash: proofData.promptHash,
      outputHash: proofData.outputHash,
      promptCID: proofData.promptCID,
      outputCID: proofData.outputCID,
      modelInfo: proofData.modelInfo,
      outputType: proofData.outputType,
      blockchainProof: {
        network: 'Sepolia',
        contractAddress: contractAddress,
        transactionHash: proofData.txHash,
        proofId: proofData.proofId,
        timestamp: timestamp.toISOString(),
      },
      ipfsMetadata: {
        promptCID: proofData.promptCID,
        outputCID: proofData.outputCID,
      },
    },
  };

  return credential;
}

/**
 * Sign a verifiable credential with the issuer's private key
 * Creates a cryptographic proof that can be verified independently
 * 
 * @param credential - Unsigned verifiable credential
 * @returns Signed verifiable credential with proof
 * 
 * @example
 * const signedVC = await signVerifiableCredential(unsignedVC);
 * // Now includes digital signature in `proof` field
 */
export async function signVerifiableCredential(
  credential: VerifiableCredential
): Promise<VerifiableCredential> {
  try {
    const keyPair = await getIssuerKeyPair();

    // Create Ed25519 signature suite with explicit verification method
    const suite = new Ed25519Signature2020({
      key: keyPair.privateKey,
      verificationMethod: keyPair.privateKey.id, // Use the key's ID as verification method
    });

    console.log('🔐 [VC Sign] Credential context:', JSON.stringify(credential['@context'], null, 2));
    console.log('🔐 [VC Sign] Suite verification method:', suite.verificationMethod);

    // Sign the credential with document loader
    const signedCredential = await issue({
      credential,
      suite,
      documentLoader: customDocumentLoader,
    });

    return signedCredential as VerifiableCredential;
  } catch (error) {
    console.error('Error signing verifiable credential:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to sign credential: ${error}`);
  }
}

/**
 * Verify a W3C Verifiable Credential's cryptographic signature
 * Can be called by any third party to verify authenticity
 * 
 * @param credential - Signed verifiable credential to verify
 * @returns Verification result with boolean status and details
 * 
 * @example
 * const result = await verifyVerifiableCredential(vcFromUser);
 * if (result.verified) {
 *   console.log('Credential is valid!');
 * }
 */
export async function verifyVerifiableCredential(
  credential: VerifiableCredential
): Promise<{
  verified: boolean;
  error?: string;
  results?: unknown;
}> {
  try {
    const keyPair = await getIssuerKeyPair();

    // Create Ed25519 signature suite for verification
    const suite = new Ed25519Signature2020({
      key: keyPair.publicKey,
    });

    // Verify the credential
    const result = await vcVerify({
      credential,
      suite,
      documentLoader: customDocumentLoader,
    });

    return {
      verified: result.verified,
      results: result,
    };
  } catch (error) {
    console.error('Error verifying credential:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Custom document loader for JSON-LD context resolution
 * Required for W3C VC verification
 */
async function customDocumentLoader(url: string): Promise<{
  contextUrl: null | string;
  documentUrl: string;
  document: unknown;
}> {
  console.log('📄 [Document Loader] Resolving URL:', url);
  
  // For W3C official contexts, try to fetch them directly
  if (url.startsWith('https://www.w3.org/') || url.startsWith('https://w3id.org/')) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/ld+json, application/json',
        },
      });
      
      if (response.ok) {
        const document = await response.json();
        console.log('✅ [Document Loader] Fetched from network:', url);
        return {
          contextUrl: null,
          documentUrl: url,
          document,
        };
      }
    } catch (error) {
      console.warn('⚠️ [Document Loader] Failed to fetch, using fallback:', url, error);
    }
  }
  
  // Standard W3C contexts
  if (url === 'https://www.w3.org/2018/credentials/v1') {
    return {
      contextUrl: null,
      documentUrl: url,
      document: {
        '@context': {
          '@version': 1.1,
          '@protected': true,
          id: '@id',
          type: '@type',
          VerifiableCredential: {
            '@id': 'https://www.w3.org/2018/credentials#VerifiableCredential',
            '@context': {
              '@version': 1.1,
              '@protected': true,
              id: '@id',
              type: '@type',
              credentialSubject: {
                '@id': 'https://www.w3.org/2018/credentials#credentialSubject',
                '@type': '@id',
              },
              issuer: {
                '@id': 'https://www.w3.org/2018/credentials#issuer',
                '@type': '@id',
              },
              issuanceDate: {
                '@id': 'https://www.w3.org/2018/credentials#issuanceDate',
                '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
              },
            },
          },
        },
      },
    };
  }

  if (url === 'https://www.w3.org/2018/credentials/examples/v1') {
    return {
      contextUrl: null,
      documentUrl: url,
      document: {
        '@context': {
          '@version': 1.1,
          '@protected': true,
        },
      },
    };
  }

  // Ed25519 Signature 2020 context
  if (url === 'https://w3id.org/security/suites/ed25519-2020/v1') {
    return {
      contextUrl: null,
      documentUrl: url,
      document: {
        '@context': {
          '@version': 1.1,
          '@protected': true,
          id: '@id',
          type: '@type',
          Ed25519VerificationKey2020: {
            '@id': 'https://w3id.org/security#Ed25519VerificationKey2020',
            '@context': {
              '@protected': true,
              id: '@id',
              type: '@type',
              controller: {
                '@id': 'https://w3id.org/security#controller',
                '@type': '@id',
              },
              revoked: {
                '@id': 'https://w3id.org/security#revoked',
                '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
              },
              publicKeyMultibase: {
                '@id': 'https://w3id.org/security#publicKeyMultibase',
                '@type': 'https://w3id.org/security#multibase',
              },
            },
          },
          Ed25519Signature2020: {
            '@id': 'https://w3id.org/security#Ed25519Signature2020',
            '@context': {
              '@protected': true,
              id: '@id',
              type: '@type',
              challenge: 'https://w3id.org/security#challenge',
              created: {
                '@id': 'http://purl.org/dc/terms/created',
                '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
              },
              domain: 'https://w3id.org/security#domain',
              expires: {
                '@id': 'https://w3id.org/security#expiration',
                '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
              },
              nonce: 'https://w3id.org/security#nonce',
              proofPurpose: {
                '@id': 'https://w3id.org/security#proofPurpose',
                '@type': '@vocab',
                '@context': {
                  '@protected': true,
                  id: '@id',
                  type: '@type',
                  assertionMethod: {
                    '@id': 'https://w3id.org/security#assertionMethod',
                    '@type': '@id',
                    '@container': '@set',
                  },
                  authentication: {
                    '@id': 'https://w3id.org/security#authenticationMethod',
                    '@type': '@id',
                    '@container': '@set',
                  },
                },
              },
              proofValue: {
                '@id': 'https://w3id.org/security#proofValue',
                '@type': 'https://w3id.org/security#multibase',
              },
              verificationMethod: {
                '@id': 'https://w3id.org/security#verificationMethod',
                '@type': '@id',
              },
            },
          },
        },
      },
    };
  }

  // NeuraMark custom schemas - handle any neuramark.com schema URL
  if (url.startsWith('https://neuramark.com/schemas') || url.startsWith('http://localhost:3000')) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: {
        '@context': {
          '@version': 1.1,
          '@protected': true,
        },
      },
    };
  }

  console.warn('⚠️  [Document Loader] Unsupported URL, returning empty context:', url);
  
  // Return empty context instead of throwing to avoid breaking the signing process
  return {
    contextUrl: null,
    documentUrl: url,
    document: {
      '@context': {},
    },
  };
}

/**
 * Export VC as downloadable JSON file
 * Users can save this to their identity wallet
 * 
 * @param credential - Signed verifiable credential
 * @returns JSON string for download
 * 
 * @example
 * const json = exportCredentialAsJSON(signedVC);
 * // User downloads JSON file
 */
export function exportCredentialAsJSON(
  credential: VerifiableCredential
): string {
  return JSON.stringify(credential, null, 2);
}

/**
 * Parse and validate VC from uploaded JSON file
 * Used when users want to verify a credential they received
 * 
 * @param jsonString - Raw JSON string from file upload
 * @returns Parsed credential object
 */
export function parseCredentialFromJSON(jsonString: string): VerifiableCredential {
  try {
    const credential = JSON.parse(jsonString) as VerifiableCredential;
    
    // Basic structure validation
    if (!credential['@context'] || !credential.type || !credential.credentialSubject) {
      throw new Error('Invalid W3C Verifiable Credential structure');
    }

    if (!credential.type.includes('VerifiableCredential')) {
      throw new Error('Not a valid Verifiable Credential');
    }

    return credential;
  } catch (error) {
    console.error('Error parsing credential JSON:', error);
    throw new Error(`Invalid credential format: ${error}`);
  }
}

/**
 * Extract human-readable proof summary from VC
 * Used for displaying VC details in UI
 * 
 * @param credential - Verifiable credential
 * @returns Formatted proof details
 */
export function extractProofSummary(credential: VerifiableCredential): {
  owner: string;
  modelInfo: string;
  timestamp: string;
  proofId: string;
  txHash: string;
  network: string;
  issuer: string;
  credentialId: string;
} {
  const subject = credential.credentialSubject;
  
  return {
    owner: subject.id,
    modelInfo: subject.modelInfo,
    timestamp: subject.blockchainProof.timestamp,
    proofId: subject.blockchainProof.proofId,
    txHash: subject.blockchainProof.transactionHash,
    network: subject.blockchainProof.network,
    issuer: credential.issuer.name,
    credentialId: credential.id,
  };
}

/**
 * Check if credential is expired (optional feature)
 * VCs can have expirationDate field for time-bound validity
 * 
 * @param credential - Verifiable credential
 * @returns True if expired, false otherwise
 */
export function isCredentialExpired(credential: VerifiableCredential): boolean {
  // Check if credential has expirationDate field
  const expirationDate = 'expirationDate' in credential 
    ? (credential as VerifiableCredential & { expirationDate: string }).expirationDate 
    : undefined;
  
  if (!expirationDate) {
    return false; // No expiration date = never expires
  }

  const now = new Date();
  const expiry = new Date(expirationDate);
  
  return now > expiry;
}

/**
 * Get credential status badge for UI display
 * 
 * @param credential - Verifiable credential
 * @param verificationResult - Result from verifyVerifiableCredential
 * @returns Status object with color and label
 */
export function getCredentialStatus(
  credential: VerifiableCredential,
  verificationResult?: { verified: boolean }
): {
  status: 'valid' | 'invalid' | 'expired';
  color: string;
  label: string;
} {
  if (isCredentialExpired(credential)) {
    return {
      status: 'expired',
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/20',
      label: 'Expired',
    };
  }

  if (verificationResult && !verificationResult.verified) {
    return {
      status: 'invalid',
      color: 'text-red-400 border-red-500/30 bg-red-500/20',
      label: 'Invalid Signature',
    };
  }

  return {
    status: 'valid',
    color: 'text-green-400 border-green-500/30 bg-green-500/20',
    label: 'Valid',
  };
}

/**
 * Utility: Generate a simple DID for users without ENS
 * Format: did:neuramark:<userId>
 */
export function generateUserDID(userId: string): string {
  return `did:neuramark:${userId}`;
}

/**
 * Utility: Validate DID format
 */
export function isValidDID(did: string): boolean {
  return /^did:neuramark:[a-zA-Z0-9]+$/.test(did);
}
