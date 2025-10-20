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
  modelInfo: string;
  promptHash: string;
  outputHash: string;
  promptCID: string;
  outputCID: string;
  outputType: string;
  txHash: string;
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
