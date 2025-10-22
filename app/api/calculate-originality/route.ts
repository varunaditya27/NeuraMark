/**
 * Calculate Originality Score API Route
 * 
 * POST /api/calculate-originality
 * 
 * Compares a new proof against existing proofs using Gemini AI
 * to generate an originality score and analysis.
 */

import { NextRequest, NextResponse } from "next/server";
import { calculateOriginalityScore, isGeminiConfigured } from "@/lib/geminiClient";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { prompt, output, modelInfo, proofId } = body;

    // Validate required fields
    if (!prompt || !output || !modelInfo) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, output, modelInfo" },
        { status: 400 }
      );
    }

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      console.warn("Gemini API not configured. Returning default score.");
      return NextResponse.json({
        score: 95,
        analysis: "Originality scoring is currently unavailable. Default high score assigned.",
        similarProofs: [],
        confidence: 0,
        message: "Gemini API not configured",
      });
    }

    // Fetch existing proofs from database for comparison
    // We'll fetch the most recent 100 proofs to compare against
    const existingProofs = await prisma.proof.findMany({
      where: {
        // Exclude the current proof if it's already been registered
        ...(proofId && { proofId: { not: proofId } }),
      },
      select: {
        proofId: true,
        modelInfo: true,
        promptHash: true,
        outputHash: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    console.log(`📊 Comparing against ${existingProofs.length} existing proofs...`);

    // Calculate originality score using Gemini AI
    const result = await calculateOriginalityScore(
      prompt,
      output,
      modelInfo,
      existingProofs
    );

    console.log(`✅ Originality Score: ${result.score}% (Confidence: ${result.confidence}%)`);

    return NextResponse.json({
      score: result.score,
      analysis: result.analysis,
      similarProofs: result.similarProofs,
      confidence: result.confidence,
      comparedAgainst: existingProofs.length,
    });
  } catch (error) {
    console.error("Error calculating originality score:", error);
    
    // Return a fallback score instead of failing the entire request
    return NextResponse.json({
      score: 75,
      analysis: "Unable to complete originality analysis due to technical error. A conservative baseline score has been assigned.",
      similarProofs: [],
      confidence: 50,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Optional: GET endpoint to check if originality scoring is available
export async function GET() {
  const configured = isGeminiConfigured();
  
  return NextResponse.json({
    available: configured,
    message: configured 
      ? "Originality scoring is available"
      : "Gemini API key not configured. Originality scoring is disabled.",
  });
}
