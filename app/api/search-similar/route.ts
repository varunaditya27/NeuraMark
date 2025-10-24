/**
 * Semantic Search API - NeuraMark Proof-of-Authorship
 * 
 * Blockchain Hackathon Use Case: Proof-of-Prompt
 * - Find similar AI-generated content in decentralized registry
 * - Verify originality before registration
 * - Detect potential IP infringement or plagiarism
 * - Establish prior art for authorship disputes
 * 
 * Powered by: ChromaDB (vector storage) + Jina AI (1024-dim embeddings)
 */

import { NextRequest, NextResponse } from 'next/server';
import { findSimilarProofs } from '@/lib/chromaClient';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      limit = 10, 
      threshold = 0.7,
      filters 
    } = body;

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

    // Find similar proofs using vector search with NeuraMark context
    const similarProofs = await findSimilarProofs(
      query.trim(),
      Math.min(limit, 50), // Cap at 50 results
      Math.max(0, Math.min(threshold, 1)), // Clamp between 0 and 1
      filters // Pass model/content type filters
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

    // Calculate originality statistics for the search
    const criticalRisk = enrichedResults.filter(r => r.originalityRisk === 'CRITICAL').length;
    const highRisk = enrichedResults.filter(r => r.originalityRisk === 'HIGH').length;
    const mediumRisk = enrichedResults.filter(r => r.originalityRisk === 'MEDIUM').length;
    const lowRisk = enrichedResults.filter(r => r.originalityRisk === 'LOW').length;

    return NextResponse.json({
      results: enrichedResults,
      count: enrichedResults.length,
      query,
      threshold,
      originalityAnalysis: {
        critical: criticalRisk,
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk,
      },
      hackathonContext: 'NeuraMark Proof-of-Prompt: Blockchain-based IP protection for AI-generated content',
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
 * GET endpoint for originality verification during registration
 * Critical for proof-of-authorship in blockchain hackathon
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get('prompt');
    const output = searchParams.get('output');
    const modelInfo = searchParams.get('model');
    const outputType = searchParams.get('type');

    if (!prompt || !output) {
      return NextResponse.json(
        { error: 'Both prompt and output are required for originality check' },
        { status: 400 }
      );
    }

    // Use high threshold (0.95) for duplicate detection with metadata
    const { checkForDuplicates } = await import('@/lib/chromaClient');
    const duplicates = await checkForDuplicates(
      prompt, 
      output,
      {
        modelInfo: modelInfo || undefined,
        outputType: outputType || undefined,
      },
      0.95
    );

    // Calculate originality score (inverse of highest similarity)
    const highestSimilarity = duplicates.length > 0 ? duplicates[0].similarity : 0;
    const originalityScore = Math.round((1 - highestSimilarity) * 100);
    
    // Determine risk level
    const risk = duplicates.length > 0 ? duplicates[0].originalityRisk : 'LOW';
    
    // Generate analysis
    let analysis = '';
    if (duplicates.length === 0) {
      analysis = 'No similar content found in blockchain registry. This appears to be highly original AI-generated content.';
    } else {
      analysis = `Found ${duplicates.length} similar proof(s) in blockchain registry. Highest similarity: ${(highestSimilarity * 100).toFixed(1)}%.`;
    }
    
    const recommendation = duplicates.length > 0 ? duplicates[0].recommendedAction : '✅ CLEAR: Content appears sufficiently original for proof-of-authorship registration.';

    return NextResponse.json({
      originalityScore,
      risk,
      similarProofs: duplicates.length,
      analysis,
      recommendation,
      canRegister: risk !== 'CRITICAL', // Block registration for near-duplicates
      duplicates: duplicates.slice(0, 3), // Return top 3 similar proofs
      hackathonContext: 'Proof-of-Prompt verification for decentralized IP protection',
    });

  } catch (error) {
    console.error('❌ Error checking originality:', error);
    
    // Non-critical - return default safe values if service unavailable
    return NextResponse.json({
      originalityScore: 85,
      risk: 'LOW',
      similarProofs: 0,
      analysis: 'Originality check unavailable. Defaulting to safe registration.',
      recommendation: '✅ Service unavailable but registration permitted.',
      canRegister: true,
      note: 'Originality verification service temporarily unavailable',
    });
  }
}
