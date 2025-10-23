/**
 * ChromaDB Vector Database Client
 * 
 * Manages semantic embeddings for AI-generated content proofs.
 * Enables similarity search and duplicate detection using Jina AI embeddings.
 * 
 * Vector Dimensions: 1024 (Jina AI v3 embeddings)
 */

import { ChromaClient, Collection } from 'chromadb';
import { generateEmbedding, prepareProofForEmbedding, isJinaConfigured } from './jinaClient';

const CHROMA_DB_API_KEY = process.env.CHROMA_DB_API_KEY;
const CHROMA_DB_TENANT_ID = process.env.CHROMA_DB_TENANT_ID;
const CHROMA_DB_DATABASE_NAME = process.env.CHROMA_DB_DATABASE_NAME;

let client: ChromaClient | null = null;
let proofsCollection: Collection | null = null;

/**
 * Check if ChromaDB is configured
 */
export function isChromaConfigured(): boolean {
  return !!(CHROMA_DB_API_KEY && CHROMA_DB_TENANT_ID && CHROMA_DB_DATABASE_NAME);
}

/**
 * Initialize ChromaDB client with hosted instance
 */
export async function initChromaClient(): Promise<ChromaClient> {
  if (client) return client;

  if (!isChromaConfigured()) {
    throw new Error('ChromaDB credentials not configured');
  }

  try {
    client = new ChromaClient({
      path: 'https://api.trychroma.com',
      auth: {
        provider: 'token',
        credentials: CHROMA_DB_API_KEY!,
        tokenHeaderType: 'X_CHROMA_TOKEN',
      },
      tenant: CHROMA_DB_TENANT_ID!,
      database: CHROMA_DB_DATABASE_NAME!,
    });

    console.log('✅ ChromaDB client initialized');
    return client;
  } catch (error) {
    console.error('❌ Error initializing ChromaDB client:', error);
    throw error;
  }
}

/**
 * Get or create the proofs collection
 */
export async function getProofsCollection(): Promise<Collection> {
  if (proofsCollection) return proofsCollection;

  const chromaClient = await initChromaClient();

  try {
    proofsCollection = await chromaClient.getOrCreateCollection({
      name: 'neuramark_proofs',
      metadata: {
        description: 'AI-generated content proofs with semantic embeddings',
        'hnsw:space': 'cosine', // Cosine similarity for embeddings
      },
    });

    console.log('✅ Proofs collection initialized');
    return proofsCollection;
  } catch (error) {
    console.error('❌ Error getting proofs collection:', error);
    throw error;
  }
}

/**
 * Add proof to ChromaDB with Jina AI embedding
 * @param proofId - Unique proof identifier
 * @param prompt - AI prompt text
 * @param output - AI-generated output
 * @param metadata - Additional proof metadata
 */
export async function addProofToVectorDB(
  proofId: string,
  prompt: string,
  output: string,
  metadata: {
    modelInfo: string;
    outputType: string;
    wallet: string;
    timestamp: string;
    userId?: string;
  }
): Promise<void> {
  if (!isChromaConfigured() || !isJinaConfigured()) {
    console.warn('⚠️ ChromaDB or Jina AI not configured. Skipping vector storage.');
    return;
  }

  try {
    const collection = await getProofsCollection();

    // Prepare combined text for embedding
    const combinedText = prepareProofForEmbedding(prompt, output);

    // Generate embedding using Jina AI
    const embedding = await generateEmbedding(combinedText);

    // Add to ChromaDB
    await collection.add({
      ids: [proofId],
      embeddings: [embedding],
      documents: [combinedText],
      metadatas: [metadata],
    });

    console.log(`✅ Added proof ${proofId} to vector database`);
  } catch (error) {
    console.error('❌ Error adding proof to ChromaDB:', error);
    // Don't throw - this is non-critical functionality
  }
}

/**
 * Find similar proofs using semantic search
 * @param query - Search query (can be prompt, output, or description)
 * @param limit - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of similar proofs with similarity scores
 */
export async function findSimilarProofs(
  query: string,
  limit: number = 10,
  threshold: number = 0.7
): Promise<
  Array<{
    proofId: string;
    similarity: number;
    document: string;
    metadata: {
      modelInfo: string;
      outputType: string;
      wallet: string;
      timestamp: string;
      userId?: string;
    };
  }>
> {
  if (!isChromaConfigured() || !isJinaConfigured()) {
    console.warn('⚠️ ChromaDB or Jina AI not configured. Returning empty results.');
    return [];
  }

  try {
    const collection = await getProofsCollection();

    // Generate query embedding using Jina AI
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar documents
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
    });

    if (!results.ids || results.ids.length === 0 || !results.ids[0]) {
      return [];
    }

    // Format results with similarity scores
    const similarProofs = results.ids[0]
      .map((id: string, index: number) => {
        const distance = results.distances?.[0]?.[index] ?? 1;
        const similarity = 1 - distance; // Convert distance to similarity (cosine)

        return {
          proofId: id,
          similarity,
          document: results.documents?.[0]?.[index] || '',
          metadata: (results.metadatas?.[0]?.[index] as {
            modelInfo: string;
            outputType: string;
            wallet: string;
            timestamp: string;
            userId?: string;
          }) || {
            modelInfo: '',
            outputType: '',
            wallet: '',
            timestamp: '',
          },
        };
      })
      .filter((proof: { proofId: string; similarity: number }) => proof.similarity >= threshold)
      .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity); // Sort by similarity descending

    return similarProofs;
  } catch (error) {
    console.error('❌ Error finding similar proofs:', error);
    return [];
  }
}

/**
 * Delete proof from vector database
 * @param proofId - Proof ID to delete
 */
export async function deleteProofFromVectorDB(proofId: string): Promise<void> {
  if (!isChromaConfigured()) {
    return;
  }

  try {
    const collection = await getProofsCollection();
    await collection.delete({ ids: [proofId] });
    console.log(`✅ Deleted proof ${proofId} from vector database`);
  } catch (error) {
    console.error('❌ Error deleting proof from ChromaDB:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(): Promise<{
  count: number;
  configured: boolean;
}> {
  if (!isChromaConfigured()) {
    return { count: 0, configured: false };
  }

  try {
    const collection = await getProofsCollection();
    const count = await collection.count();
    return { count, configured: true };
  } catch (error) {
    console.error('❌ Error getting collection stats:', error);
    return { count: 0, configured: false };
  }
}

/**
 * Check for potential duplicates before registration
 * @param prompt - Prompt text
 * @param output - Output text
 * @param similarityThreshold - Threshold for duplicate detection (default 0.9)
 * @returns Array of potential duplicates
 */
export async function checkForDuplicates(
  prompt: string,
  output: string,
  similarityThreshold: number = 0.9
): Promise<
  Array<{
    proofId: string;
    similarity: number;
    metadata: {
      modelInfo: string;
      outputType: string;
      wallet: string;
      timestamp: string;
    };
  }>
> {
  const combinedText = prepareProofForEmbedding(prompt, output);
  const results = await findSimilarProofs(combinedText, 5, similarityThreshold);
  return results;
}
