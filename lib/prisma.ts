import { PrismaClient } from "@prisma/client";

/**
 * Global Prisma Client instance
 * Prevents multiple instances in development (hot reload)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface ProofRecord {
  id: string;
  proofId: string;
  wallet: string;
  userId?: string | null;
  modelInfo: string;
  promptHash: string;
  outputHash: string;
  promptCID: string;
  outputCID: string;
  outputType: string;
  txHash: string;
  tokenId?: string | null;
  tokenTxHash?: string | null;
  originalityScore?: number | null;
  originalityAnalysis?: string | null;
  originalityConfidence?: number | null;
  vcId?: string | null;
  vcIpfsCID?: string | null;
  createdAt: Date;
}

/**
 * Store proof metadata in the database
 */
export async function storeProof(proofData: {
  proofId: string;
  wallet: string;
  modelInfo: string;
  promptHash: string;
  outputHash: string;
  promptCID: string;
  outputCID: string;
  outputType: string;
  txHash: string;
  originalityScore?: number;
  originalityAnalysis?: string;
  originalityConfidence?: number;
}): Promise<ProofRecord> {
  try {
    const proof = await prisma.proof.create({
      data: proofData,
    });
    console.log(`✅ Proof stored in database: ${proof.id}`);
    return proof as ProofRecord;
  } catch (error) {
    console.error("❌ Error storing proof in database:", error);
    throw error;
  }
}

/**
 * Get proof by proofId
 */
export async function getProofById(proofId: string): Promise<ProofRecord | null> {
  try {
    const proof = await prisma.proof.findUnique({
      where: { proofId },
    });
    return proof as ProofRecord | null;
  } catch (error) {
    console.error("❌ Error fetching proof:", error);
    throw error;
  }
}

/**
 * Get all proofs by wallet address
 */
export async function getProofsByWallet(wallet: string): Promise<ProofRecord[]> {
  try {
    const proofs = await prisma.proof.findMany({
      where: { wallet },
      orderBy: { createdAt: "desc" },
    });
    return proofs as ProofRecord[];
  } catch (error) {
    console.error("❌ Error fetching proofs by wallet:", error);
    throw error;
  }
}

/**
 * Get recent proofs
 */
export async function getRecentProofs(limit: number = 10): Promise<ProofRecord[]> {
  try {
    const proofs = await prisma.proof.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return proofs as ProofRecord[];
  } catch (error) {
    console.error("❌ Error fetching recent proofs:", error);
    throw error;
  }
}

/**
 * Check if a proof exists
 */
export async function proofExists(proofId: string): Promise<boolean> {
  try {
    const count = await prisma.proof.count({
      where: { proofId },
    });
    return count > 0;
  } catch (error) {
    console.error("❌ Error checking proof existence:", error);
    throw error;
  }
}

/**
 * Get proof statistics for a wallet
 */
export async function getWalletStats(wallet: string) {
  try {
    const totalProofs = await prisma.proof.count({
      where: { wallet },
    });

    const firstProof = await prisma.proof.findFirst({
      where: { wallet },
      orderBy: { createdAt: "asc" },
    });

    const latestProof = await prisma.proof.findFirst({
      where: { wallet },
      orderBy: { createdAt: "desc" },
    });

    return {
      totalProofs,
      firstProofDate: firstProof?.createdAt,
      latestProofDate: latestProof?.createdAt,
    };
  } catch (error) {
    console.error("❌ Error fetching wallet stats:", error);
    throw error;
  }
}

/**
 * Search proofs by model info
 */
export async function searchProofsByModel(
  modelInfo: string,
  limit: number = 20
): Promise<ProofRecord[]> {
  try {
    const proofs = await prisma.proof.findMany({
      where: {
        modelInfo: {
          contains: modelInfo,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return proofs as ProofRecord[];
  } catch (error) {
    console.error("❌ Error searching proofs by model:", error);
    throw error;
  }
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// ==================== DID Functions ====================

export interface DIDRecord {
  id: string;
  didId: string;
  userId: string;
  didDocument: Record<string, unknown>; // JSON type
  ipfsCID: string | null;
  signature: string | null;
  proofCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new DID record in the database
 */
export async function createDID(didData: {
  didId: string;
  userId: string;
  didDocument: Record<string, unknown>;
  ipfsCID?: string;
  signature?: string;
  proofCount?: number;
}): Promise<DIDRecord> {
  try {
    const did = await prisma.dID.create({
      data: {
        didId: didData.didId,
        userId: didData.userId,
        didDocument: didData.didDocument,
        ipfsCID: didData.ipfsCID,
        signature: didData.signature,
        proofCount: didData.proofCount || 0,
      },
    });
    console.log(`✅ DID created: ${did.didId}`);
    return did as DIDRecord;
  } catch (error) {
    console.error("❌ Error creating DID:", error);
    throw error;
  }
}

/**
 * Get DID by userId
 */
export async function getDIDByUserId(userId: string): Promise<DIDRecord | null> {
  try {
    // Try direct userId lookup first (Supabase User.id)
    let did = await prisma.dID.findUnique({
      where: { userId },
    });
    
    // If not found, try finding user by firebaseUid and then get their DID
    if (!did) {
      const user = await prisma.user.findUnique({
        where: { firebaseUid: userId },
        include: { did: true },
      });
      
      if (user?.did) {
        did = user.did;
      }
    }
    
    return did as DIDRecord | null;
  } catch (error) {
    console.error("❌ Error fetching DID by userId:", error);
    throw error;
  }
}

/**
 * Get DID by didId
 */
export async function getDIDByDIDId(didId: string): Promise<DIDRecord | null> {
  try {
    const did = await prisma.dID.findUnique({
      where: { didId },
    });
    return did as DIDRecord | null;
  } catch (error) {
    console.error("❌ Error fetching DID by didId:", error);
    throw error;
  }
}

/**
 * Update DID document
 */
export async function updateDID(
  userId: string,
  updates: {
    didDocument?: Record<string, unknown>;
    ipfsCID?: string;
    signature?: string;
    proofCount?: number;
  }
): Promise<DIDRecord> {
  try {
    const did = await prisma.dID.update({
      where: { userId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ DID updated: ${did.didId}`);
    return did as DIDRecord;
  } catch (error) {
    console.error("❌ Error updating DID:", error);
    throw error;
  }
}

/**
 * Increment proof count for DID
 */
export async function incrementDIDProofCount(userId: string): Promise<DIDRecord> {
  try {
    const did = await prisma.dID.update({
      where: { userId },
      data: {
        proofCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
    console.log(`✅ DID proof count incremented: ${did.didId} (${did.proofCount})`);
    return did as DIDRecord;
  } catch (error) {
    console.error("❌ Error incrementing DID proof count:", error);
    throw error;
  }
}

/**
 * Get DID by wallet address
 */
export async function getDIDByWallet(walletAddress: string): Promise<DIDRecord | null> {
  try {
    // Find wallet first
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      include: { user: { include: { did: true } } },
    });

    if (!wallet || !wallet.user.did) {
      return null;
    }

    return wallet.user.did as DIDRecord;
  } catch (error) {
    console.error("❌ Error fetching DID by wallet:", error);
    throw error;
  }
}

/**
 * Check if DID exists for a user
 */
export async function didExistsForUser(userId: string): Promise<boolean> {
  try {
    const count = await prisma.dID.count({
      where: { userId },
    });
    return count > 0;
  } catch (error) {
    console.error("❌ Error checking DID existence:", error);
    throw error;
  }
}

/**
 * Get user with DID and proofs
 */
export async function getUserWithDIDAndProofs(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        did: true,
        wallets: true,
        proofs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("❌ Error fetching user with DID and proofs:", error);
    throw error;
  }
}
