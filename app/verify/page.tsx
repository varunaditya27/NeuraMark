"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, CheckCircle2, XCircle, ExternalLink, Shield, User, Clock, Zap, FileJson, Upload } from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import { formatAddress } from "@/lib/ethersClient";
import DIDCard from "@/components/DIDCard";

interface VerifiedProof {
  proofId: string;
  creator: string;
  modelInfo: string;
  promptHash: string;
  outputHash: string;
  promptCID: string;
  outputCID: string;
  outputType: string;
  txHash: string;
  timestamp: string;
}

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

interface VerificationResult {
  verified: boolean;
  credential: {
    '@context': string[];
    id: string;
    type: string[];
    issuer: { id: string; name: string };
    issuanceDate: string;
    credentialSubject: {
      id: string;
      type: string;
      promptHash: string;
      outputHash: string;
      promptCID: string;
      outputCID: string;
      modelInfo: string;
      outputType: string;
      blockchainProof: {
        network: string;
        contractAddress: string;
        transactionHash: string;
        proofId: string;
        timestamp: string;
      };
      ipfsMetadata: {
        promptCID: string;
        outputCID: string;
      };
    };
    proof?: {
      type: string;
      created: string;
      verificationMethod: string;
      proofPurpose: string;
      proofValue: string;
    };
  };
  proofSummary: {
    owner: string;
    modelInfo: string;
    timestamp: string;
    proofId: string;
    txHash: string;
    network: string;
    issuer: string;
    credentialId: string;
  };
  status: {
    status: 'valid' | 'invalid' | 'expired';
    color: string;
    label: string;
  };
  error?: string;
}

type VerifyTab = 'proof' | 'did' | 'credential';

export default function VerifyPage() {
  const [activeTab, setActiveTab] = useState<VerifyTab>('proof');
  
  // Proof verification state
  const [proofId, setProofId] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifiedProof, setVerifiedProof] = useState<VerifiedProof | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // DID verification state
  const [didSearchInput, setDidSearchInput] = useState("");
  const [didLoading, setDidLoading] = useState(false);
  const [didData, setDidData] = useState<DIDData | null>(null);
  const [didError, setDidError] = useState<string | null>(null);

  // VC verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

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

  // DID verification handler
  const handleDIDSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!didSearchInput.trim()) {
      setDidError("Please enter a DID or wallet address");
      return;
    }

    setDidLoading(true);
    setDidError(null);
    setDidData(null);

    try {
      const isDID = didSearchInput.startsWith("did:");
      const queryParam = isDID ? `didId=${encodeURIComponent(didSearchInput)}` : `wallet=${encodeURIComponent(didSearchInput)}`;

      const response = await fetch(`/api/did/get?${queryParam}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "DID not found");
      }

      setDidData(data.did);
    } catch (err) {
      setDidError(err instanceof Error ? err.message : "Failed to fetch DID");
    } finally {
      setDidLoading(false);
    }
  };

  // VC verification handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const fileContent = await file.text();
      setUploadedFile(file.name);

      const response = await fetch('/api/verify-vc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: fileContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify credential');
      }

      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying credential:', error);
      setError(`Failed to verify credential: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetVC = () => {
    setVerificationResult(null);
    setUploadedFile(null);
    const fileInput = document.getElementById('vc-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
              Verify
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Verify proofs, decentralized identities, and verifiable credentials
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab('proof')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'proof'
                  ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Proof ID
            </button>
            <button
              onClick={() => setActiveTab('did')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'did'
                  ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              DID
            </button>
            <button
              onClick={() => setActiveTab('credential')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'credential'
                  ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Credential
            </button>
          </div>
        </motion.div>

        {/* Search Forms - Conditional based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'proof' && (
            <motion.div
              key="proof-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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
          )}

          {activeTab === 'did' && (
            <motion.div
              key="did-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              <GlassmorphicCard gradient className="p-8">
                <form onSubmit={handleDIDSearch} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      DID or Wallet Address
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={didSearchInput}
                        onChange={(e) => setDidSearchInput(e.target.value)}
                        placeholder="Enter DID (did:neuramark:...) or Wallet (0x...)"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-sm"
                        disabled={didLoading}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: !didLoading ? 1.02 : 1 }}
                    whileTap={{ scale: !didLoading ? 0.98 : 1 }}
                    type="submit"
                    disabled={didLoading}
                    className="w-full relative px-6 py-4 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 blur-xl opacity-50" />
                    <div className="relative flex items-center justify-center gap-2">
                      {didLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>Verify DID</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </form>
              </GlassmorphicCard>
            </motion.div>
          )}

          {activeTab === 'credential' && (
            <motion.div
              key="vc-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              <GlassmorphicCard gradient className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <FileJson className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      Upload Verifiable Credential
                    </h3>
                    <p className="text-gray-400">
                      Select a JSON file containing a W3C Verifiable Credential
                    </p>
                  </div>

                  <label htmlFor="vc-file-input" className="block cursor-pointer">
                    <div className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-12 text-center hover:border-indigo-500/50 transition-all bg-indigo-500/5">
                      <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-400 text-sm">
                        JSON file (*.json)
                      </p>
                      {uploadedFile && (
                        <p className="text-emerald-400 text-sm mt-4">
                          ✓ {uploadedFile}
                        </p>
                      )}
                    </div>
                    <input
                      id="vc-file-input"
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {isVerifying && (
                    <div className="flex items-center justify-center gap-3 p-6 rounded-xl bg-emerald-500/10">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      <span className="text-emerald-400 font-medium">
                        Verifying credential...
                      </span>
                    </div>
                  )}
                </div>
              </GlassmorphicCard>
            </motion.div>
          )}
        </AnimatePresence>

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
                      <span className="font-medium">
                        View {verifiedProof.outputType === "image" ? "Image" : "Output"}
                      </span>
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
          {error && activeTab === 'proof' && (
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

          {/* DID Results */}
          {didData && activeTab === 'did' && (
            <motion.div
              key="did-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <DIDCard
                didId={didData.didId}
                didDocument={didData.didDocument}
                ipfsCID={didData.ipfsCID}
                proofCount={didData.proofCount}
                createdAt={didData.createdAt}
              />

              {didData.didDocument.verifiedProofs.length > 0 && (
                <GlassmorphicCard className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Verified Proofs ({didData.didDocument.verifiedProofs.length})
                  </h3>
                  <div className="space-y-3">
                    {didData.didDocument.verifiedProofs.map((proof, index) => (
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
                </GlassmorphicCard>
              )}
            </motion.div>
          )}

          {/* DID Error */}
          {didError && activeTab === 'did' && (
            <motion.div
              key="did-error"
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
                  DID Not Found
                </h3>
                <p className="text-red-200">{didError}</p>
              </GlassmorphicCard>
            </motion.div>
          )}

          {/* VC Results */}
          {verificationResult && activeTab === 'credential' && (
            <motion.div
              key="vc-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <GlassmorphicCard gradient className="p-8">
                <div className="text-center">
                  {verificationResult.verified ? (
                    <>
                      <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold text-green-400 mb-2">
                        Credential Verified ✓
                      </h3>
                      <p className="text-gray-400">
                        This verifiable credential is authentic and has not been tampered with
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold text-red-400 mb-2">
                        Invalid Credential
                      </h3>
                      <p className="text-gray-400">
                        This credential&apos;s signature could not be verified
                      </p>
                    </>
                  )}

                  <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border ${verificationResult.status.color}`}>
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold">
                      {verificationResult.status.label}
                    </span>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Credential Details */}
              <GlassmorphicCard gradient className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileJson className="w-6 h-6 text-emerald-400" />
                  Credential Details
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <User className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Owner</p>
                      <p className="text-white font-mono text-sm">{verificationResult.proofSummary.owner}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <Zap className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">AI Model</p>
                      <p className="text-white font-semibold">{verificationResult.proofSummary.modelInfo}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <Clock className="w-5 h-5 text-teal-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Timestamp</p>
                      <p className="text-white">{formatDate(verificationResult.proofSummary.timestamp)}</p>
                    </div>
                  </div>

                  <a
                    href={`https://sepolia.etherscan.io/tx/${verificationResult.proofSummary.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-teal-500/10 border border-indigo-500/30 hover:border-indigo-400 transition-all group"
                  >
                    <span className="text-indigo-300 font-medium">View on Etherscan</span>
                    <ExternalLink className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${verificationResult.credential.credentialSubject.promptCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 hover:border-teal-400 transition-all group"
                    >
                      <span className="text-teal-300 font-medium">View Prompt</span>
                      <ExternalLink className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${verificationResult.credential.credentialSubject.outputCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 transition-all group"
                    >
                      <span className="text-purple-300 font-medium">View Output</span>
                      <ExternalLink className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Reset Button */}
              <div className="flex justify-center">
                <motion.button
                  onClick={handleResetVC}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Verify Another Credential
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box - Dynamic based on active tab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <GlassmorphicCard className="p-6">
            {activeTab === 'proof' && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">
                  How Proof Verification Works
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
              </>
            )}
            {activeTab === 'did' && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">
                  How DID Verification Works
                </h3>
                <div className="space-y-3 text-sm text-gray-400">
                  <p>
                    • DIDs (Decentralized Identifiers) follow W3C DID Core v1.0 specification
                  </p>
                  <p>
                    • Each DID links a user&apos;s Firebase account with multiple Ethereum wallets
                  </p>
                  <p>
                    • DID documents are stored immutably on IPFS with CID references
                  </p>
                  <p>
                    • Search by DID (did:neuramark:...) or any linked wallet address
                  </p>
                </div>
              </>
            )}
            {activeTab === 'credential' && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">
                  What are Verifiable Credentials?
                </h3>
                <div className="space-y-3 text-sm text-gray-400">
                  <p>
                    • W3C Verifiable Credentials are cryptographically-signed digital certificates
                  </p>
                  <p>
                    • VCs can be verified independently without contacting NeuraMark
                  </p>
                  <p>
                    • Unlike NFTs (blockchain-only) or PDFs (visual-only), VCs are portable and interoperable
                  </p>
                  <p>
                    • Ed25519 signatures ensure credentials cannot be tampered with
                  </p>
                </div>
              </>
            )}
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
}
