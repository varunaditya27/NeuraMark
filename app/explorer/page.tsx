/**
 * Public Proof Explorer Page
 * 
 * A beautiful, animated page displaying all registered AI authorship proofs.
 * Features search, filters, expandable details, and real-time statistics.
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  TrendingUp, 
  Database,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Code
} from "lucide-react";
import ExplorerSearchBar from "@/components/ExplorerSearchBar";
import ExplorerProofTable from "@/components/ExplorerProofTable";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import { 
  fetchAllProofs, 
  getExplorerStats,
  ExplorerProof,
  ProofFilters 
} from "@/lib/fetchProofs";

export default function ExplorerPage() {
  const [mounted, setMounted] = useState(false);
  const [proofs, setProofs] = useState<ExplorerProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Statistics
  const [totalProofs, setTotalProofs] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [modelBreakdown, setModelBreakdown] = useState<Record<string, number>>({});
  const [typeBreakdown, setTypeBreakdown] = useState<Record<string, number>>({
    text: 0,
    image: 0,
    code: 0,
  });

  // Filters and pagination
  const [filters, setFilters] = useState<ProofFilters>({
    searchQuery: '',
    modelFilter: 'all',
    typeFilter: 'all',
    sortBy: 'recent',
    page: 1,
    limit: 20,
  });
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadStats();
    loadProofs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted) {
      loadProofs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await getExplorerStats();
      setTotalProofs(stats.totalProofs);
      setModelBreakdown(stats.modelBreakdown);
      setTypeBreakdown(stats.typeBreakdown);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadProofs = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllProofs(filters);
      setProofs(result.proofs);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load proofs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load proofs');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: ProofFilters) => {
    setFilters(newFilters);
  };

  const handleLoadMore = () => {
    setFilters({
      ...filters,
      page: (filters.page || 1) + 1,
    });
  };

  const getTopModels = () => {
    return Object.entries(modelBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E0E12] via-[#1a1a2e] to-[#0E0E12]">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-500/30 rounded-full"
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 mb-6"
          >
            <Shield className="h-10 w-10 text-indigo-400" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
              Public Proof Explorer
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Explore the transparent ledger of AI authorship proofs registered on the blockchain
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Total Proofs */}
          <GlassmorphicCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Proofs</div>
                <div className="text-3xl font-bold text-white">
                  {statsLoading ? '...' : totalProofs.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-indigo-500/20">
                <Database className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          </GlassmorphicCard>

          {/* Text Proofs */}
          <GlassmorphicCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Text Proofs</div>
                <div className="text-3xl font-bold text-white">
                  {statsLoading ? '...' : typeBreakdown.text.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/20">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </GlassmorphicCard>

          {/* Image Proofs */}
          <GlassmorphicCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Image Proofs</div>
                <div className="text-3xl font-bold text-white">
                  {statsLoading ? '...' : typeBreakdown.image.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/20">
                <ImageIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </GlassmorphicCard>

          {/* Code Proofs */}
          <GlassmorphicCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Code Proofs</div>
                <div className="text-3xl font-bold text-white">
                  {statsLoading ? '...' : typeBreakdown.code.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-500/20">
                <Code className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Top Models */}
        {!statsLoading && getTopModels().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <GlassmorphicCard className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/20">
                    <TrendingUp className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Top AI Models</div>
                    <div className="flex items-center gap-4 mt-1">
                      {getTopModels().map(([model, count], index) => (
                        <div key={model} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {index + 1}. {model}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <ExplorerSearchBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalCount={proofs.length}
            showFilterPanel={showFilterPanel}
            onToggleFilterPanel={() => setShowFilterPanel(!showFilterPanel)}
          />
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <GlassmorphicCard className="p-5 border-red-500/30 bg-red-500/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div>
                  <div className="text-red-300 font-medium">Failed to load proofs</div>
                  <div className="text-sm text-red-400/80 mt-1">{error}</div>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Proof Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ExplorerProofTable
            proofs={proofs}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </motion.div>

        {/* Footer Note */}
        {proofs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8 text-sm text-gray-500"
          >
            All proofs are immutably stored on the Ethereum blockchain (Sepolia testnet)
          </motion.div>
        )}
      </div>
    </div>
  );
}
