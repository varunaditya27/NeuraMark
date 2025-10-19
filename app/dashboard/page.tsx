"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Loader2, AlertCircle, TrendingUp, Clock, Shield } from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import ProofCard from "@/components/ProofCard";
import { getAccount, isMetaMaskInstalled } from "@/lib/ethersClient";
import { ProofRecord } from "@/lib/prisma";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  // Data state
  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [filteredProofs, setFilteredProofs] = useState<ProofRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModel, setFilterModel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

  useEffect(() => {
    setMounted(true);
    checkWalletAndLoadProofs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterModel, sortBy, proofs]);

  const checkWalletAndLoadProofs = async () => {
    try {
      if (isMetaMaskInstalled()) {
        const account = await getAccount();
        setCurrentAccount(account);
        setWalletConnected(true);
        await loadProofs(account);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error checking wallet:", err);
      setWalletConnected(false);
      setLoading(false);
    }
  };

  const loadProofs = async (wallet: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/get-proofs?wallet=${wallet}`);
      
      if (!response.ok) {
        throw new Error("Failed to load proofs");
      }

      const data = await response.json();
      setProofs(data.proofs || []);
    } catch (err) {
      console.error("Error loading proofs:", err);
      setError(err instanceof Error ? err.message : "Failed to load proofs");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...proofs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (proof) =>
          proof.modelInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proof.proofId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Model filter
    if (filterModel !== "all") {
      filtered = filtered.filter((proof) =>
        proof.modelInfo.toLowerCase().includes(filterModel.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

    setFilteredProofs(filtered);
  };

  const getUniqueModels = () => {
    const models = new Set(proofs.map((p) => p.modelInfo));
    return Array.from(models);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              Your Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            View and manage all your registered proofs
          </p>
        </motion.div>

        {/* Stats Cards */}
        {walletConnected && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <GlassmorphicCard gradient className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                  <Shield className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{proofs.length}</p>
                  <p className="text-sm text-gray-400">Total Proofs</p>
                </div>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard gradient className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-500/30">
                  <TrendingUp className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {getUniqueModels().length}
                  </p>
                  <p className="text-sm text-gray-400">AI Models Used</p>
                </div>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard gradient className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {proofs.length > 0
                      ? new Date(
                          Math.max(
                            ...proofs.map((p) => new Date(p.createdAt).getTime())
                          )
                        ).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-400">Latest Proof</p>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Wallet Connection Warning */}
        {!walletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassmorphicCard className="p-8 border-amber-500/30 bg-amber-500/10 text-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Wallet Not Connected
              </h3>
              <p className="text-amber-200">
                Please connect your MetaMask wallet to view your dashboard
              </p>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Filters & Search */}
        {walletConnected && !loading && proofs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <GlassmorphicCard className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by model or proof ID..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {/* Model Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    value={filterModel}
                    onChange={(e) => setFilterModel(e.target.value)}
                    className="pl-12 pr-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">All Models</option>
                    {getUniqueModels().map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading your proofs...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassmorphicCard className="p-8 border-red-500/30 bg-red-500/10 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Error Loading Proofs
              </h3>
              <p className="text-red-200 mb-4">{error}</p>
              <button
                onClick={() => currentAccount && loadProofs(currentAccount)}
                className="px-6 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 transition-colors"
              >
                Try Again
              </button>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Empty State */}
        {walletConnected && !loading && !error && proofs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassmorphicCard className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                No Proofs Yet
              </h3>
              <p className="text-gray-400 mb-6">
                You haven&apos;t registered any proofs yet. Get started by registering your first AI-generated content.
              </p>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Register Your First Proof
              </a>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Proofs Grid */}
        {walletConnected && !loading && !error && filteredProofs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredProofs.map((proof, index) => (
                  <motion.div
                    key={proof.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <ProofCard proof={proof} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* No Results */}
            {filteredProofs.length === 0 && proofs.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No proofs match your search criteria
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
