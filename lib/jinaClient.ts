/**
 * Jina AI Embeddings Client
 * 
 * Generates semantic embeddings for text content using Jina AI's REST API.
 * Used for semantic search and similarity detection in NeuraMark.
 * 
 * Embedding Dimensions:
 * - jina-embeddings-v3: 1024 dimensions
 * - jina-embeddings-v2-base-en: 768 dimensions
 */

const JINA_API_KEY = process.env.JINA_API_KEY;
const JINA_EMBEDDINGS_URL = 'https://api.jina.ai/v1/embeddings';

export interface JinaEmbeddingResponse {
  model: string;
  object: string;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
  };
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
}

/**
 * Check if Jina AI is configured
 */
export function isJinaConfigured(): boolean {
  return !!JINA_API_KEY && JINA_API_KEY.length > 0;
}

/**
 * Generate embeddings using Jina AI REST API
 * @param texts - Array of texts to embed (max 410 tokens per text recommended)
 * @param model - Jina embedding model to use
 * @returns Array of embedding vectors (1024-dim for v3, 768-dim for v2)
 */
export async function generateEmbeddings(
  texts: string[],
  model: 'jina-embeddings-v3' | 'jina-embeddings-v2-base-en' = 'jina-embeddings-v3'
): Promise<number[][]> {
  if (!isJinaConfigured()) {
    throw new Error('JINA_API_KEY not configured in environment variables');
  }

  try {
    const response = await fetch(JINA_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JINA_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        task: 'text-matching',
        input: texts,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jina AI API error (${response.status}): ${errorText}`);
    }

    const data: JinaEmbeddingResponse = await response.json();
    
    // Extract embeddings in order
    return data.data
      .sort((a, b) => a.index - b.index)
      .map(item => item.embedding);
  } catch (error) {
    console.error('Error generating Jina embeddings:', error);
    throw new Error(
      `Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate single embedding for a text
 * @param text - Text to embed (will be truncated if too long)
 * @param model - Jina embedding model to use
 * @returns Embedding vector (1024-dim for v3, 768-dim for v2)
 */
export async function generateEmbedding(
  text: string,
  model: 'jina-embeddings-v3' | 'jina-embeddings-v2-base-en' = 'jina-embeddings-v3'
): Promise<number[]> {
  const embeddings = await generateEmbeddings([text], model);
  return embeddings[0];
}

/**
 * Truncate text to fit within token limits
 * Rough estimate: 1 token ≈ 4 characters
 * @param text - Text to truncate
 * @param maxTokens - Maximum tokens (default 410 for Jina)
 * @returns Truncated text
 */
export function truncateText(text: string, maxTokens: number = 410): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }
  return text.substring(0, maxChars) + '...';
}

/**
 * Prepare proof content for embedding with NeuraMark-specific context
 * Enhances semantic understanding for proof-of-authorship and originality detection
 * 
 * Context added:
 * - AI authorship markers
 * - Content type indicators
 * - Blockchain proof context
 */
export function prepareProofForEmbedding(
  prompt: string, 
  output: string,
  metadata?: {
    modelInfo?: string;
    outputType?: string;
    timestamp?: string;
  }
): string {
  // Allocate tokens: 150 for prompt, 150 for output, 100 for metadata context
  const truncatedPrompt = truncateText(prompt, 150);
  const truncatedOutput = truncateText(output, 150);
  
  // Build context-aware embedding text for better semantic matching
  let embeddingText = `AI-GENERATED CONTENT PROOF:\n\n`;
  
  // Add metadata context for better semantic clustering
  if (metadata?.modelInfo) {
    embeddingText += `MODEL: ${metadata.modelInfo}\n`;
  }
  if (metadata?.outputType) {
    embeddingText += `TYPE: ${metadata.outputType}\n`;
  }
  
  embeddingText += `\nPROMPT: ${truncatedPrompt}\n\n`;
  embeddingText += `OUTPUT: ${truncatedOutput}`;
  
  return embeddingText;
}

/**
 * Prepare search query with NeuraMark-specific context
 * Enhances query to match against proof-of-authorship embeddings
 */
export function prepareSearchQuery(query: string, filters?: {
  modelType?: string;
  contentType?: string;
}): string {
  let enhancedQuery = `AI-GENERATED CONTENT: ${query}`;
  
  if (filters?.modelType) {
    enhancedQuery += ` [MODEL: ${filters.modelType}]`;
  }
  if (filters?.contentType) {
    enhancedQuery += ` [TYPE: ${filters.contentType}]`;
  }
  
  return enhancedQuery;
}
