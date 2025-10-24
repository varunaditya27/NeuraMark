/**
 * Semantic Search Bar Component - NeuraMark Proof-of-Authorship
 * 
 * Blockchain Hackathon Feature: Proof-of-Prompt Discovery
 * 
 * Capabilities:
 * - Find similar AI-generated content in decentralized registry
 * - Verify originality of prompts and outputs
 * - Detect potential IP conflicts or prior art
 * - Analyze authorship disputes
 * - Identify derivative works
 * 
 * Technology: ChromaDB + Jina AI (1024-dim semantic embeddings)
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X, AlertCircle } from "lucide-react";
import ProofCard from "./ProofCard";

interface SemanticSearchBarProps {
  onClose?: () => void;
}

interface SimilarProof {
  proofId: string;
  similarity: number;
  document: string;
  originalityRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: {
    modelInfo: string;
    outputType: string;
    wallet: string;
    timestamp: string;
    userId?: string;
    promptHash?: string;
    outputHash?: string;
  };
  proof: {
    id: number;
    proofId: string;
    wallet: string;
    modelInfo: string;
    promptHash: string;
    outputHash: string;
    promptCID: string;
    outputCID: string;
    outputType: string;
    txHash: string;
    createdAt: string;
    originalityScore?: number;
    originalityAnalysis?: string;
    tokenId?: string;
    tokenTxHash?: string;
  } | null;
}

interface SearchResponse {
  results: SimilarProof[];
  count: number;
  query: string;
  threshold: number;
  originalityAnalysis?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  hackathonContext?: string;
  error?: string;
  message?: string;
}

export default function SemanticSearchBar({ onClose }: SemanticSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SimilarProof[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/search-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          limit: 20,
          threshold: 0.6, // Lower threshold for broader results
        }),
      });

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      if (data.count === 0) {
        setError("No similar proofs found. Try a different query.");
      } else {
        setResults(data.results);
        setShowResults(true);
      }
    } catch (err) {
      console.error("Semantic search error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to search for similar proofs"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError(null);
    setShowResults(false);
  };

  return (
    <div className="w-full">
      {/* Search Form */}
      <motion.form
        onSubmit={handleSearch}
        className="relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative group">
          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Verify originality: 'sunset landscape' or check authorship: 'Python code for sorting' ⛓️"
            className="w-full px-6 py-4 pl-14 pr-32 rounded-2xl bg-white/5 border-2 border-white/10 
                     text-white placeholder-white/40 backdrop-blur-xl
                     focus:outline-none focus:border-indigo-500/50 focus:bg-white/8
                     transition-all duration-300"
            disabled={isSearching}
          />

          {/* Search Icon */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400">
            <Search className="w-5 h-5" />
          </div>

          {/* AI Sparkle Icon */}
          <motion.div
            className="absolute right-28 top-1/2 -translate-y-1/2 text-teal-400"
            animate={{ rotate: isSearching ? 360 : 0 }}
            transition={{ duration: 1, repeat: isSearching ? Infinity : 0 }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>

          {/* Clear Button */}
          {query && !isSearching && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="absolute right-20 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-xl
                     bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-semibold
                     hover:from-indigo-500 hover:to-teal-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Searching...
              </span>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Results Header with Originality Analysis */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Proof-of-Authorship Results: {results.length} Match{results.length !== 1 ? "es" : ""}
                </h3>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
              
              {/* Originality Risk Summary (if available from API) */}
              {(results.some(r => r.originalityRisk)) && (
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-white/60">Originality Analysis:</span>
                  {results.filter(r => r.originalityRisk === 'CRITICAL').length > 0 && (
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300">
                      ⛔ {results.filter(r => r.originalityRisk === 'CRITICAL').length} Critical
                    </span>
                  )}
                  {results.filter(r => r.originalityRisk === 'HIGH').length > 0 && (
                    <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-300">
                      ⚠️ {results.filter(r => r.originalityRisk === 'HIGH').length} High Risk
                    </span>
                  )}
                  {results.filter(r => r.originalityRisk === 'MEDIUM').length > 0 && (
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                      ℹ️ {results.filter(r => r.originalityRisk === 'MEDIUM').length} Medium Risk
                    </span>
                  )}
                  {results.filter(r => r.originalityRisk === 'LOW').length > 0 && (
                    <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                      ✅ {results.filter(r => r.originalityRisk === 'LOW').length} Low Risk
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {results.map((result, index) =>
                result.proof ? (
                  <motion.div
                    key={result.proofId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Similarity & Originality Risk Badges */}
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      {/* Similarity Score */}
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          result.similarity >= 0.95
                            ? "bg-red-500/20 text-red-300"
                            : result.similarity >= 0.85
                            ? "bg-orange-500/20 text-orange-300"
                            : result.similarity >= 0.75
                            ? "bg-yellow-500/20 text-yellow-300"
                            : result.similarity >= 0.7
                            ? "bg-teal-500/20 text-teal-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {(result.similarity * 100).toFixed(1)}% Similar
                      </div>
                      
                      {/* Originality Risk Badge */}
                      {result.originalityRisk && (
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            result.originalityRisk === 'CRITICAL'
                              ? "bg-red-500/10 border-red-500/30 text-red-300"
                              : result.originalityRisk === 'HIGH'
                              ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                              : result.originalityRisk === 'MEDIUM'
                              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          }`}
                        >
                          {result.originalityRisk === 'CRITICAL' && '⛔ Critical Risk'}
                          {result.originalityRisk === 'HIGH' && '⚠️ High Risk'}
                          {result.originalityRisk === 'MEDIUM' && 'ℹ️ Medium Risk'}
                          {result.originalityRisk === 'LOW' && '✅ Low Risk'}
                        </div>
                      )}
                    </div>

                    {/* Proof Card */}
                    <ProofCard proof={result.proof} />
                  </motion.div>
                ) : null
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
