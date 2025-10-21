"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DIDCard from "@/components/DIDCard";

interface DIDData {
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
  createdAt: string;
}

export default function VerifyDIDPage() {
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [didData, setDidData] = useState<DIDData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchInput.trim()) {
      setError("Please enter a DID or wallet address");
      return;
    }

    setLoading(true);
    setError(null);
    setDidData(null);

    try {
      // Determine if input is a DID or wallet address
      const isDID = searchInput.startsWith("did:");
      const queryParam = isDID ? `didId=${encodeURIComponent(searchInput)}` : `wallet=${encodeURIComponent(searchInput)}`;

      const response = await fetch(`/api/did/get?${queryParam}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "DID not found");
      }

      setDidData(data.did);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0E0E12] via-[#1a1a2e] to-[#16213e]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Verify Decentralized Identity
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enter a DID or wallet address to view the complete identity document
            and verified proofs
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter DID (did:neuramark:...) or Wallet Address (0x...)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        {didData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <DIDCard
              didId={didData.didId}
              didDocument={didData.didDocument}
              ipfsCID={didData.ipfsCID}
              proofCount={didData.proofCount}
              createdAt={didData.createdAt}
            />

            {/* Verified Proofs List */}
            {didData.didDocument.verifiedProofs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Verified Proofs ({didData.didDocument.verifiedProofs.length})
                </h3>
                <div className="space-y-3">
                  {didData.didDocument.verifiedProofs.map((proof, index: number) => (
                    <div
                      key={proof.proofId}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-400">
                          Proof #{index + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(proof.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">
                          Model: <span className="text-white">{proof.model}</span>
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {proof.proofId}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        {!didData && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-3">How to Verify</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  Enter a <strong className="text-white">DID</strong> (format: did:neuramark:xxx)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  Or enter an <strong className="text-white">Ethereum wallet address</strong> (0x...)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  View the complete identity document with linked wallets and verified proofs
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>
                  All data is immutably stored on IPFS with blockchain verification
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
