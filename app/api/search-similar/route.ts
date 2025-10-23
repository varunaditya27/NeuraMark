/**
 * Semantic Search API
 * 
 * Find similar proofs using ChromaDB + Jina AI vector embeddings.
 * Enables users to discover related content and check for duplicates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { findSimilarProofs } from '@/lib/chromaClient';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10, threshold = 0.7 } = body;

    // Validation
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query text is required' },
        { status: 400 }
      );
    }

    if (query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    // Find similar proofs using vector search
    const similarProofs = await findSimilarProofs(
      query.trim(),
      Math.min(limit, 50), // Cap at 50 results
      Math.max(0, Math.min(threshold, 1)) // Clamp between 0 and 1
    );

    if (similarProofs.length === 0) {
      return NextResponse.json({
        results: [],
        count: 0,
        message: 'No similar proofs found',
      });
    }

    // Fetch full proof details from database
    const proofIds = similarProofs.map(p => p.proofId);
    const fullProofs = await prisma.proof.findMany({
      where: {
        proofId: {
          in: proofIds,
        },
      },
    });

    // Merge similarity scores with full proof data
    const enrichedResults = similarProofs.map(similar => {
      const fullProof = fullProofs.find((p: { proofId: string }) => p.proofId === similar.proofId);
      return {
        ...similar,
        proof: fullProof ? {
          ...fullProof,
          createdAt: fullProof.createdAt.toISOString(),
        } : null,
      };
    }).filter(r => r.proof !== null); // Only return proofs that exist in DB

    return NextResponse.json({
      results: enrichedResults,
      count: enrichedResults.length,
      query,
      threshold,
    });

  } catch (error) {
    console.error('❌ Error in semantic search:', error);
    
    // Handle ChromaDB/Jina not configured
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'Semantic search is not configured',
          results: [],
          count: 0,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to perform semantic search' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for duplicate checking during registration
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get('prompt');
    const output = searchParams.get('output');

    if (!prompt || !output) {
      return NextResponse.json(
        { error: 'Both prompt and output are required' },
        { status: 400 }
      );
    }

    // Use high threshold (0.95) for duplicate detection
    const { checkForDuplicates } = await import('@/lib/chromaClient');
    const duplicates = await checkForDuplicates(prompt, output, 0.95);

    return NextResponse.json({
      hasDuplicates: duplicates.length > 0,
      duplicates,
      count: duplicates.length,
    });

  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
    
    // Non-critical - return no duplicates if service unavailable
    return NextResponse.json({
      hasDuplicates: false,
      duplicates: [],
      count: 0,
      note: 'Duplicate check unavailable',
    });
  }
}
