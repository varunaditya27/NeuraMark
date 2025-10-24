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
 * NOTE: We provide our own embeddings from Jina AI, so no embedding function needed
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
      // Explicitly set embeddingFunction to null since we provide embeddings manually
      embeddingFunction: undefined,
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
 * Enhanced for NeuraMark proof-of-authorship use case
 * 
 * @param proofId - Unique proof identifier (blockchain proof ID)
 * @param prompt - AI prompt text (what was asked)
 * @param output - AI-generated output (what was created)
 * @param metadata - Blockchain proof metadata (model, creator, timestamp)
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
    promptHash?: string;
    outputHash?: string;
  }
): Promise<void> {
  if (!isChromaConfigured() || !isJinaConfigured()) {
    console.warn('⚠️ ChromaDB or Jina AI not configured. Skipping vector storage.');
    return;
  }

  try {
    const collection = await getProofsCollection();

    // Prepare context-aware embedding for proof-of-authorship
    const combinedText = prepareProofForEmbedding(prompt, output, {
      modelInfo: metadata.modelInfo,
      outputType: metadata.outputType,
      timestamp: metadata.timestamp,
    });

    // Generate embedding using Jina AI
    const embedding = await generateEmbedding(combinedText);

    // Enrich metadata with blockchain-specific fields
    const enrichedMetadata = {
      ...metadata,
      contentLength: prompt.length + output.length,
      indexed: new Date().toISOString(),
      platform: 'NeuraMark',
    };

    // Add to ChromaDB with enriched metadata
    await collection.add({
      ids: [proofId],
      embeddings: [embedding],
      documents: [combinedText],
      metadatas: [enrichedMetadata],
    });

    console.log(`✅ [NeuraMark] Proof-of-authorship indexed: ${proofId.slice(0, 10)}...`);
  } catch (error) {
    console.error('❌ Error adding proof to ChromaDB:', error);
    // Don't throw - this is non-critical functionality
  }
}

/**
 * Find similar proofs using semantic search
 * Enhanced for NeuraMark proof-of-authorship verification
 * 
 * Use Cases:
 * - Originality verification: Check if content is truly unique
 * - Prior art detection: Find similar AI-generated content
 * - Authorship disputes: Identify potentially copied prompts/outputs
 * - IP protection: Detect derivative works
 * 
 * @param query - Search query (natural language or content description)
 * @param limit - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @param filters - Optional filters for model type, content type
 * @returns Array of similar proofs ranked by semantic similarity
 */
export async function findSimilarProofs(
  query: string,
  limit: number = 10,
  threshold: number = 0.7,
  filters?: {
    modelType?: string;
    contentType?: string;
  }
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
      promptHash?: string;
      outputHash?: string;
      contentLength?: number;
      platform?: string;
    };
    originalityRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>
> {
  if (!isChromaConfigured() || !isJinaConfigured()) {
    console.warn('⚠️ ChromaDB or Jina AI not configured. Returning empty results.');
    return [];
  }

  try {
    const collection = await getProofsCollection();

    // Enhance query with NeuraMark context
    const { prepareSearchQuery } = await import('./jinaClient');
    const enhancedQuery = prepareSearchQuery(query, filters);

    // Generate query embedding using Jina AI
    const queryEmbedding = await generateEmbedding(enhancedQuery);

    // Search for similar documents
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
    });

    if (!results.ids || results.ids.length === 0 || !results.ids[0]) {
      return [];
    }

    // Format results with similarity scores and originality risk assessment
    const similarProofs = results.ids[0]
      .map((id: string, index: number) => {
        const distance = results.distances?.[0]?.[index] ?? 1;
        const similarity = 1 - distance; // Convert distance to similarity (cosine)

        // Calculate originality risk for proof-of-authorship disputes
        let originalityRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        if (similarity >= 0.95) {
          originalityRisk = 'CRITICAL'; // Near-identical content (possible plagiarism)
        } else if (similarity >= 0.85) {
          originalityRisk = 'HIGH'; // Very similar content (derivative work)
        } else if (similarity >= 0.75) {
          originalityRisk = 'MEDIUM'; // Similar concepts (prior art exists)
        } else {
          originalityRisk = 'LOW'; // Sufficiently different (original)
        }

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
            promptHash?: string;
            outputHash?: string;
            contentLength?: number;
            platform?: string;
          }) || {
            modelInfo: '',
            outputType: '',
            wallet: '',
            timestamp: '',
          },
          originalityRisk,
        };
      })
      .filter((proof: { proofId: string; similarity: number }) => proof.similarity >= threshold)
      .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity); // Sort by similarity descending

    console.log(`🔍 [NeuraMark] Found ${similarProofs.length} similar proofs (threshold: ${(threshold * 100).toFixed(0)}%)`);
    
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
 * Critical for proof-of-authorship verification in blockchain hackathon
 * 
 * Prevents:
 * - Double registration of same content
 * - Plagiarism attempts (copying others' AI prompts)
 * - IP infringement (derivative works too similar to existing proofs)
 * 
 * @param prompt - Prompt text to check
 * @param output - Output text to check
 * @param similarityThreshold - Threshold for duplicate detection (default 0.95 = 95% similar)
 * @returns Array of potential duplicates with originality risk assessment
 */
export async function checkForDuplicates(
  prompt: string,
  output: string,
  metadata?: {
    modelInfo?: string;
    outputType?: string;
  },
  similarityThreshold: number = 0.95
): Promise<
  Array<{
    proofId: string;
    similarity: number;
    originalityRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    document: string;
    metadata: {
      modelInfo: string;
      outputType: string;
      wallet: string;
      timestamp: string;
      userId?: string;
      promptHash?: string;
      outputHash?: string;
      contentLength?: number;
      platform?: string;
    };
    recommendedAction: string;
  }>
> {
  const combinedText = prepareProofForEmbedding(prompt, output, metadata);
  const results = await findSimilarProofs(combinedText, 5, similarityThreshold);
  
  // Add recommended actions based on originality risk - ensure all have originalityRisk
  return results.map(result => ({
    proofId: result.proofId,
    similarity: result.similarity,
    originalityRisk: result.originalityRisk || 'LOW',
    document: result.document,
    metadata: result.metadata,
    recommendedAction: getRecommendedAction(result.originalityRisk || 'LOW', result.similarity),
  }));
}

/**
 * Get recommended action for originality risk level
 * Helps users understand implications for proof-of-authorship
 */
function getRecommendedAction(risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', similarity: number): string {
  switch (risk) {
    case 'CRITICAL':
      return `⛔ STOP: ${(similarity * 100).toFixed(1)}% similar to existing proof. This may constitute plagiarism or duplicate registration. Verify authorship before proceeding.`;
    case 'HIGH':
      return `⚠️ CAUTION: ${(similarity * 100).toFixed(1)}% similar to existing proof. This appears to be a derivative work. Consider modifying prompt/output to increase originality.`;
    case 'MEDIUM':
      return `ℹ️ NOTICE: ${(similarity * 100).toFixed(1)}% similar to existing proof. Prior art exists for similar concepts. Registration permitted but note the similarity.`;
    case 'LOW':
    default:
      return `✅ CLEAR: ${(similarity * 100).toFixed(1)}% similar (acceptably different). Content appears sufficiently original for proof-of-authorship registration.`;
  }
}

/**
 * Analyze originality score for a proof
 * Provides detailed analysis for proof-of-authorship verification
 */
export async function analyzeOriginality(
  prompt: string,
  output: string,
  metadata?: {
    modelInfo?: string;
    outputType?: string;
  }
): Promise<{
  score: number; // 0-100 (100 = completely original)
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  similarProofs: number;
  analysis: string;
  recommendation: string;
}> {
  const duplicates = await checkForDuplicates(prompt, output, metadata, 0.7);
  
  // Calculate originality score (inverse of highest similarity)
  const highestSimilarity = duplicates.length > 0 ? duplicates[0].similarity : 0;
  const originalityScore = Math.round((1 - highestSimilarity) * 100);
  
  // Determine risk level
  let risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (highestSimilarity >= 0.95) risk = 'CRITICAL';
  else if (highestSimilarity >= 0.85) risk = 'HIGH';
  else if (highestSimilarity >= 0.75) risk = 'MEDIUM';
  else risk = 'LOW';
  
  // Generate analysis
  let analysis = '';
  if (duplicates.length === 0) {
    analysis = 'No similar content found in blockchain registry. This appears to be highly original AI-generated content.';
  } else {
    analysis = `Found ${duplicates.length} similar proof(s) in blockchain registry. Highest similarity: ${(highestSimilarity * 100).toFixed(1)}%.`;
  }
  
  const recommendation = getRecommendedAction(risk, highestSimilarity);
  
  return {
    score: originalityScore,
    risk,
    similarProofs: duplicates.length,
    analysis,
    recommendation,
  };
}
