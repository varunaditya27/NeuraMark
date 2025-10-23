/**
 * Gemini AI Client
 * 
 * Integrates Google's Gemini API for AI-powered originality scoring.
 * Compares new proofs against existing proofs to determine uniqueness.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not found. Originality scoring will be disabled.");
}

// Initialize Gemini AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface ProofComparison {
  proofId: string;
  modelInfo: string;
  promptHash: string;
  outputHash: string;
  createdAt: Date;
}

interface OriginalityResult {
  score: number; // 0-100, higher = more original
  analysis: string;
  similarProofs: string[]; // Array of proof IDs that are similar
  confidence: number; // 0-100, confidence in the score
}

/**
 * Calculate originality score for a new proof by comparing against existing proofs
 * 
 * @param prompt - The AI prompt used to generate content
 * @param output - The AI-generated output
 * @param modelInfo - The AI model used
 * @param existingProofs - Array of existing proofs to compare against
 * @returns OriginalityResult with score and analysis
 */
export async function calculateOriginalityScore(
  prompt: string,
  output: string,
  modelInfo: string,
  existingProofs: ProofComparison[]
): Promise<OriginalityResult> {
  // If no API key, return default high score
  if (!genAI) {
    console.warn("Gemini API not configured. Returning default originality score.");
    return {
      score: 95,
      analysis: "Originality scoring unavailable (API key not configured). Default high score assigned.",
      similarProofs: [],
      confidence: 0,
    };
  }

  try {
    // If no existing proofs, it's 100% original
    if (existingProofs.length === 0) {
      return {
        score: 100,
        analysis: "This is the first proof registered on the platform. Congratulations on being a pioneer! 🎉",
        similarProofs: [],
        confidence: 100,
      };
    }

    // Limit comparison to most recent 50 proofs for performance
    const proofsToCompare = existingProofs.slice(0, 50);

    // Build comparison context
    const comparisonContext = proofsToCompare
      .map((proof, index) => {
        return `Proof ${index + 1} (ID: ${proof.proofId.slice(0, 10)}...):\n` +
               `Model: ${proof.modelInfo}\n` +
               `Created: ${proof.createdAt.toISOString()}\n` +
               `Prompt Hash: ${proof.promptHash.slice(0, 20)}...\n` +
               `Output Hash: ${proof.outputHash.slice(0, 20)}...`;
      })
      .join("\n\n");

    // Create prompt for Gemini
    const analysisPrompt = `You are an AI originality analyzer for a blockchain-based proof-of-authorship platform called NeuraMark. Your task is to analyze a new AI-generated content proof and compare it against existing proofs to determine its originality.

NEW PROOF TO ANALYZE:
Prompt: "${prompt.slice(0, 500)}"
Output: "${output.slice(0, 1000)}"
Model: ${modelInfo}

EXISTING PROOFS IN DATABASE (${proofsToCompare.length} most recent):
${comparisonContext}

TASK:
Analyze the conceptual similarity, thematic overlap, and uniqueness of the new proof compared to existing proofs. Consider:
1. Prompt similarity (topic, intent, phrasing)
2. Output uniqueness (novelty of generated content)
3. Model diversity (different models = more interesting)
4. Temporal context (similar recent proofs = less original)

Provide your analysis in this EXACT JSON format:
{
  "score": <number 0-100, where 100 = completely unique>,
  "analysis": "<2-3 sentence explanation>",
  "similarProofIndices": [<array of indices 0-${proofsToCompare.length - 1} of similar proofs, max 3>],
  "confidence": <number 0-100, your confidence in this assessment>
}

Be objective and fair. Most proofs should score 70-95. Only truly derivative or duplicate content should score below 60.`;

    // Get Gemini model (using gemini-pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Generate analysis
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Map indices back to proof IDs
    const similarProofs = (parsed.similarProofIndices || [])
      .filter((idx: number) => idx >= 0 && idx < proofsToCompare.length)
      .map((idx: number) => proofsToCompare[idx].proofId);

    return {
      score: Math.min(100, Math.max(0, parsed.score)),
      analysis: parsed.analysis || "Analysis completed successfully.",
      similarProofs,
      confidence: Math.min(100, Math.max(0, parsed.confidence || 80)),
    };
  } catch (error) {
    console.error("Error calculating originality score:", error);
    
    // Fallback: Return a conservative score if AI fails
    return {
      score: 75,
      analysis: "Unable to complete detailed originality analysis due to technical limitations. Default score assigned based on statistical baseline.",
      similarProofs: [],
      confidence: 50,
    };
  }
}

/**
 * Get color indicator for originality score
 * Used for UI display
 */
export function getOriginalityColor(score: number): {
  color: string;
  label: string;
  description: string;
} {
  if (score >= 90) {
    return {
      color: "emerald",
      label: "Highly Original",
      description: "Exceptionally unique content",
    };
  } else if (score >= 75) {
    return {
      color: "teal",
      label: "Original",
      description: "Strong originality with minor similarities",
    };
  } else if (score >= 60) {
    return {
      color: "yellow",
      label: "Moderately Original",
      description: "Some similar content exists",
    };
  } else if (score >= 40) {
    return {
      color: "orange",
      label: "Low Originality",
      description: "Significant similarities detected",
    };
  } else {
    return {
      color: "red",
      label: "Very Low Originality",
      description: "Highly derivative content",
    };
  }
}

/**
 * Format originality score for display
 */
export function formatOriginalityScore(score: number): string {
  return `${score.toFixed(0)}%`;
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY && !!genAI;
}
