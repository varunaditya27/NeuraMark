/**
 * DID-Lite Client
 * Decentralized Identifier system for NeuraMark
 * Unifies Web2 (Firebase) + Web3 (Wallets) identity
 */

import { ethers } from "ethers";
import { uploadJSONToIPFS } from "./pinata";

// DID Document structure (W3C DID Core compliant)
export interface DIDDocument {
  "@context": string;
  id: string; // did:neuramark:<userId>
  name: string;
  email: string;
  wallets: string[];
  verifiedProofs: ProofReference[];
  createdAt: string;
  updatedAt: string;
}

export interface ProofReference {
  proofId: string;
  ipfsCID: string;
  model: string;
  timestamp: string;
  txHash: string;
}

/**
 * Generate a DID identifier for a user
 * Format: did:neuramark:<userId>
 */
export function generateDID(userId: string): string {
  return `did:neuramark:${userId}`;
}

/**
 * Create a new DID document for a user
 */
export function createDIDDocument(
  userId: string,
  email: string,
  displayName: string,
  wallets: string[] = []
): DIDDocument {
  const now = new Date().toISOString();

  return {
    "@context": "https://www.w3.org/ns/did/v1",
    id: generateDID(userId),
    name: displayName || "Anonymous",
    email,
    wallets,
    verifiedProofs: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Sign DID document using Web3 wallet
 * Creates cryptographic proof of ownership
 */
export async function signDIDDocument(
  didDocument: DIDDocument,
  signer: ethers.Signer
): Promise<string> {
  try {
    // Stringify document for consistent hashing
    const documentString = JSON.stringify(didDocument, Object.keys(didDocument).sort());
    
    // Hash the document
    const documentHash = ethers.keccak256(ethers.toUtf8Bytes(documentString));
    
    // Sign the hash
    const signature = await signer.signMessage(ethers.getBytes(documentHash));
    
    return signature;
  } catch (error) {
    console.error("Error signing DID document:", error);
    throw new Error("Failed to sign DID document");
  }
}

/**
 * Upload DID document to IPFS via Pinata
 * Returns the IPFS CID
 */
export async function uploadDIDToIPFS(
  didDocument: DIDDocument,
  signature?: string
): Promise<string> {
  try {
    // Add signature to document if provided
    const documentWithSignature = signature
      ? { ...didDocument, signature }
      : didDocument;

    const cid = await uploadJSONToIPFS(
      documentWithSignature,
      `did-document-${didDocument.id.split(":")[2]}.json`
    );

    return cid;
  } catch (error) {
    console.error("Error uploading DID to IPFS:", error);
    throw new Error("Failed to upload DID document to IPFS");
  }
}

/**
 * Update DID document with a new proof
 * Returns updated document
 */
export function updateDIDWithProof(
  didDocument: DIDDocument,
  proofReference: ProofReference
): DIDDocument {
  return {
    ...didDocument,
    verifiedProofs: [...didDocument.verifiedProofs, proofReference],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add wallet to DID document
 * Returns updated document
 */
export function addWalletToDID(
  didDocument: DIDDocument,
  walletAddress: string
): DIDDocument {
  // Avoid duplicates
  if (didDocument.wallets.includes(walletAddress)) {
    return didDocument;
  }

  return {
    ...didDocument,
    wallets: [...didDocument.wallets, walletAddress],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove wallet from DID document
 * Returns updated document
 */
export function removeWalletFromDID(
  didDocument: DIDDocument,
  walletAddress: string
): DIDDocument {
  return {
    ...didDocument,
    wallets: didDocument.wallets.filter((w) => w !== walletAddress),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Verify DID document signature
 * Returns true if signature is valid
 */
export async function verifyDIDSignature(
  didDocument: DIDDocument,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    // Remove signature from document for verification
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { signature: _sig, ...documentWithoutSignature } = didDocument as DIDDocument & { signature?: string };
    
    // Stringify document for consistent hashing
    const documentString = JSON.stringify(
      documentWithoutSignature,
      Object.keys(documentWithoutSignature).sort()
    );
    
    // Hash the document
    const documentHash = ethers.keccak256(ethers.toUtf8Bytes(documentString));
    
    // Recover signer address
    const recoveredAddress = ethers.verifyMessage(
      ethers.getBytes(documentHash),
      signature
    );
    
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying DID signature:", error);
    return false;
  }
}

/**
 * Format DID for display
 * Shortens the userId part for UI
 */
export function formatDID(did: string, maxLength: number = 20): string {
  const parts = did.split(":");
  if (parts.length !== 3) return did;

  const [method, namespace, userId] = parts;

  if (userId.length <= maxLength) {
    return did;
  }

  const start = userId.substring(0, 8);
  const end = userId.substring(userId.length - 8);

  return `${method}:${namespace}:${start}...${end}`;
}

/**
 * Get IPFS gateway URL for DID document
 */
export function getDIDIPFSUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Batch add proofs to DID document
 * Useful for retroactive DID creation
 */
export function batchAddProofsToDID(
  didDocument: DIDDocument,
  proofReferences: ProofReference[]
): DIDDocument {
  return {
    ...didDocument,
    verifiedProofs: [...didDocument.verifiedProofs, ...proofReferences],
    updatedAt: new Date().toISOString(),
  };
}
