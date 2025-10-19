"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, CheckCircle2, XCircle, ExternalLink, Shield, User, Clock, Zap } from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import { formatAddress } from "@/lib/ethersClient";

interface VerifiedProof {
  proofId: string;
  creator: string;
  modelInfo: string;
  promptHash: string;
  outputHash: string;
  promptCID: string;
  outputCID: string;
  txHash: string;
  timestamp: string;
}

export default function VerifyPage() {
  const [proofId, setProofId] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifiedProof, setVerifiedProof] = useState<VerifiedProof | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofId.trim()) {
      setError("Please enter a proof ID");
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setVerifiedProof(null);

    try {
      const response = await fetch(`/api/verify-proof?proofId=${encodeURIComponent(proofId)}`);
      
      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to verify proof");
      }

      const data = await response.json();
      setVerifiedProof(data.proof);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Failed to verify proof");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/30">
            <Shield className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              Verify Proof
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enter a proof ID to verify its authenticity on the blockchain
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <GlassmorphicCard gradient className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proof ID
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={proofId}
                    onChange={(e) => setProofId(e.target.value)}
                    placeholder="Enter proof ID (0x...)"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: !loading ? 1.02 : 1 }}
                whileTap={{ scale: !loading ? 0.98 : 1 }}
                type="submit"
                disabled={loading}
                className="w-full relative px-6 py-4 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 blur-xl opacity-50" />
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Verify Proof</span>
                    </>
                  )}
                </div>
              </motion.button>
            </form>
          </GlassmorphicCard>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {/* Verified Proof */}
          {verifiedProof && (
            <motion.div
              key="verified"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <GlassmorphicCard gradient className="p-8">
                {/* Success Header */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 border-2 border-green-500">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Proof Verified ✓
                    </h2>
                    <p className="text-gray-400">
                      This proof exists on the blockchain and is authentic
                    </p>
                  </div>
                </div>

                {/* Proof Details */}
                <div className="space-y-6">
                  {/* Creator */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex-shrink-0">
                      <User className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Creator</p>
                      <p className="text-white font-mono text-sm">
                        {formatAddress(verifiedProof.creator)}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex-shrink-0">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Registered</p>
                      <p className="text-white">
                        {formatDate(verifiedProof.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/30 flex-shrink-0">
                      <Zap className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">AI Model</p>
                      <p className="text-white font-semibold">
                        {verifiedProof.modelInfo}
                      </p>
                    </div>
                  </div>

                  {/* Hashes */}
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Prompt Hash</p>
                      <p className="text-xs text-gray-500 font-mono break-all bg-white/5 p-3 rounded-lg">
                        {verifiedProof.promptHash}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Output Hash</p>
                      <p className="text-xs text-gray-500 font-mono break-all bg-white/5 p-3 rounded-lg">
                        {verifiedProof.outputHash}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <motion.a
                      href={`https://gateway.pinata.cloud/ipfs/${verifiedProof.promptCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                    >
                      <span className="font-medium">View Prompt</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                    <motion.a
                      href={`https://gateway.pinata.cloud/ipfs/${verifiedProof.outputCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500/30 transition-colors"
                    >
                      <span className="font-medium">View Output</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  </div>

                  {/* Transaction Link */}
                  <motion.a
                    href={`https://sepolia.etherscan.io/tx/${verifiedProof.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    <span>View transaction on Etherscan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.a>
                </div>
              </GlassmorphicCard>
            </motion.div>
          )}

          {/* Not Found */}
          {notFound && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <GlassmorphicCard className="p-12 border-amber-500/30 bg-amber-500/10 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500">
                  <XCircle className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Proof Not Found
                </h3>
                <p className="text-amber-200">
                  No proof exists with this ID on the blockchain
                </p>
              </GlassmorphicCard>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <GlassmorphicCard className="p-12 border-red-500/30 bg-red-500/10 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 border-2 border-red-500">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Verification Failed
                </h3>
                <p className="text-red-200">{error}</p>
              </GlassmorphicCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <GlassmorphicCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              How Verification Works
            </h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                • Each proof is stored on the Sepolia blockchain with a unique ID
              </p>
              <p>
                • Content is hashed using SHA-256 for cryptographic verification
              </p>
              <p>
                • Original files are stored on IPFS for permanent, decentralized access
              </p>
              <p>
                • All proofs are immutable and publicly verifiable
              </p>
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
}
