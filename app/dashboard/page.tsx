"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Loader2, AlertCircle, TrendingUp, Clock, Shield, Award } from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import ProofCard from "@/components/ProofCard";
import TokenCard from "@/components/TokenCard";
import DIDCard from "@/components/DIDCard";
import { getAccount, isMetaMaskInstalled } from "@/lib/ethersClient";
import { ProofRecord } from "@/lib/prisma";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  // Data state
  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [filteredProofs, setFilteredProofs] = useState<ProofRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // DID state
  const [didData, setDidData] = useState<{
    didId: string;
    didDocument: {
      "@context": string;
      id: string;
      name: string;
      email: string;
      wallets: string[];
      verifiedProofs: Array<{
        proofId: string;
        ipfsCID: string;
        model: string;
        timestamp: string;
        txHash: string;
      }>;
      createdAt: string;
      updatedAt: string;
    };
    ipfsCID?: string;
    proofCount: number;
    createdAt?: string;
  } | null>(null);
  const [didProofCount, setDidProofCount] = useState<number>(0);
  const [loadingDID, setLoadingDID] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModel, setFilterModel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

  const loadDIDStats = useCallback(async () => {
    if (!user) return;
    
    setLoadingDID(true);
    try {
      const response = await fetch(`/api/did/create?userId=${user.uid}`);
      
      // Handle 404 - DID doesn't exist yet (not an error)
      if (response.status === 404) {
        console.log("ℹ️ No DID found for user yet");
        setDidProofCount(0);
        setDidData(null);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.did) {
          setDidProofCount(data.did.proofCount || 0);
          setDidData(data.did); // Store full DID data
        }
      } else {
        // Log other errors but don't show to user
        console.error("Error loading DID:", response.status);
      }
    } catch (err) {
      console.error("Error loading DID stats:", err);
    } finally {
      setLoadingDID(false);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    checkWalletAndLoadProofs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      loadDIDStats();
    }
  }, [user, loadDIDStats]);

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

            <GlassmorphicCard gradient className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                  <Shield className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {loadingDID ? (
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    ) : (
                      didProofCount
                    )}
                  </p>
                  <p className="text-sm text-gray-400">DID-Linked Proofs</p>
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
          <>
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
                      <ProofCard proof={proof} userId={user?.uid} />
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

            {/* DID Section */}
            {didData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-16"
              >
                <div className="flex items-center gap-3 mb-8">
                  <Shield className="h-8 w-8 text-indigo-400" />
                  <div>
                    <h2 className="text-3xl font-bold text-neutral-100">
                      Your Decentralized Identity
                    </h2>
                    <p className="text-gray-400 mt-1">
                      W3C DID linking your Web2 account with Web3 wallets and proofs
                    </p>
                  </div>
                </div>
                <DIDCard
                  didId={didData.didId}
                  didDocument={didData.didDocument}
                  ipfsCID={didData.ipfsCID}
                  proofCount={didData.proofCount}
                  createdAt={didData.createdAt || new Date().toISOString()}
                />
              </motion.div>
            )}

            {/* Authorship Certificates Section */}
            <AuthorshipCertificatesSection proofs={proofs} />
          </>
        )}
      </div>
    </div>
  );
}

// Authorship Certificates Section Component
function AuthorshipCertificatesSection({ proofs }: { proofs: ProofRecord[] }) {
  // Filter proofs that have tokens
  const tokensData = proofs
    .filter((p) => p.tokenId)
    .map((p) => ({
      id: p.id,
      tokenId: p.tokenId!,
      modelInfo: p.modelInfo,
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString(),
      tokenTxHash: p.tokenTxHash || "",
      outputCID: p.outputCID,
      outputType: p.outputType,
      promptHash: p.promptHash,
      outputHash: p.outputHash,
    }));

  // Only show section if user has proofs (whether they have tokens or not)
  if (proofs.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="mt-16"
    >
      <div className="flex items-center gap-3 mb-8">
        <Award className="h-8 w-8 text-indigo-400" />
        <div>
          <h2 className="text-3xl font-bold text-neutral-100">
            Your Authorship Certificates
          </h2>
          <p className="text-gray-400 mt-1">
            Soulbound NFTs representing your AI content authorship ({tokensData.length} total)
          </p>
        </div>
      </div>

      {tokensData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokensData.map((token, index) => (
            <TokenCard key={token.id} token={token} index={index} />
          ))}
        </div>
      ) : (
        <GlassmorphicCard className="p-12 text-center">
          <Award className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">
            No NFT Certificates Yet
          </h3>
          <p className="text-gray-400 mb-6">
            Register a new proof to automatically receive a soulbound NFT certificate. 
            Existing proofs will need to be re-registered to mint tokens.
          </p>
        </GlassmorphicCard>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="mt-8"
      >
        <GlassmorphicCard className="p-6 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                About Authorship Certificates
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Each certificate is a <strong className="text-amber-300">soulbound NFT</strong> (non-transferable ERC-721 token) 
                that proves your authorship of AI-generated content. These tokens are permanently bound to your wallet and cannot 
                be sold or transferred, ensuring authentic proof of creation.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  Non-Transferable
                </span>
                <span className="px-3 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium">
                  ERC-721 Standard
                </span>
                <span className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium">
                  Ethereum Sepolia
                </span>
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      </motion.div>
    </motion.div>
  );
}
