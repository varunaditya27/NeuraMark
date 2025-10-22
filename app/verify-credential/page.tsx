"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileJson,
  Shield,
  ExternalLink,
  Clock,
  User,
  Hash,
  Network,
} from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import { formatAddress } from "@/lib/ethersClient";

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

export default function VerifyCredentialPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please upload a JSON file');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const fileContent = await file.text();
      setUploadedFile(file.name);

      // Call API to verify credential
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
      alert(`Failed to verify credential: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setUploadedFile(null);
    // Reset file input
    const fileInput = document.getElementById('vc-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E12] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Verify Credential
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Upload a W3C Verifiable Credential (VC) to independently verify its authenticity.
            No connection to NeuraMark required.
          </p>
        </motion.div>

        {/* Upload Section */}
        {!verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassmorphicCard className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <FileJson className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Upload Verifiable Credential
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Select a JSON file containing a W3C Verifiable Credential
                  </p>
                </div>

                <label
                  htmlFor="vc-file-input"
                  className="block cursor-pointer"
                >
                  <div className="border-2 border-dashed border-emerald-500/30 rounded-2xl p-12 text-center hover:border-emerald-500/50 transition-all bg-emerald-500/5">
                    <Upload className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
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
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
                    <span className="text-emerald-400 font-medium">
                      Verifying credential...
                    </span>
                  </div>
                )}
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Verification Result */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <GlassmorphicCard className="p-8">
                <div className="text-center">
                  {verificationResult.verified ? (
                    <>
                      <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold text-green-400 mb-2">
                        Credential Verified ✓
                      </h3>
                      <p className="text-gray-300 text-lg">
                        This is a valid W3C Verifiable Credential issued by NeuraMark
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold text-red-400 mb-2">
                        Verification Failed ✗
                      </h3>
                      <p className="text-gray-300 text-lg mb-4">
                        This credential could not be verified
                      </p>
                      {verificationResult.error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                          <p className="text-red-400 text-sm">
                            {verificationResult.error}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Status Badge */}
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border ${verificationResult.status.color}">
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold">
                      {verificationResult.status.label}
                    </span>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Credential Details */}
              <GlassmorphicCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileJson className="w-6 h-6 text-emerald-400" />
                  Credential Details
                </h3>

                <div className="space-y-6">
                  {/* Owner */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <User className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-gray-400 text-sm mb-1">Owner (DID)</div>
                      <div className="font-mono text-white break-all">
                        {verificationResult.proofSummary.owner}
                      </div>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <AlertCircle className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-gray-400 text-sm mb-1">AI Model</div>
                      <div className="text-white font-medium">
                        {verificationResult.proofSummary.modelInfo}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <Clock className="w-5 h-5 text-teal-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-gray-400 text-sm mb-1">Timestamp</div>
                      <div className="text-white">
                        {new Date(verificationResult.proofSummary.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Network */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <Network className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-gray-400 text-sm mb-1">Blockchain Network</div>
                      <div className="text-white">
                        {verificationResult.proofSummary.network}
                      </div>
                    </div>
                  </div>

                  {/* Proof ID */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                    <Hash className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-gray-400 text-sm mb-1">Blockchain Proof ID</div>
                      <div className="font-mono text-white break-all">
                        {formatAddress(verificationResult.proofSummary.proofId)}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Link */}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${verificationResult.proofSummary.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-teal-500/10 border border-indigo-500/30 hover:border-indigo-400 transition-all group"
                  >
                    <span className="text-indigo-300 font-medium">View on Etherscan</span>
                    <ExternalLink className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* IPFS Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${verificationResult.credential.credentialSubject.promptCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 hover:border-teal-400 transition-all group"
                    >
                      <span className="text-teal-300 font-medium text-sm">View Prompt (IPFS)</span>
                      <ExternalLink className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${verificationResult.credential.credentialSubject.outputCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 transition-all group"
                    >
                      <span className="text-purple-300 font-medium text-sm">View Output (IPFS)</span>
                      <ExternalLink className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Actions */}
              <div className="flex justify-center">
                <motion.button
                  onClick={handleReset}
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

        {/* Info Section */}
        {!verificationResult && !isVerifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                What are Verifiable Credentials?
              </h3>
              <div className="space-y-3 text-gray-300">
                <p>
                  <strong className="text-emerald-400">W3C Verifiable Credentials (VCs)</strong> are standardized,
                  cryptographically-signed digital certificates that prove authorship of AI-generated content.
                </p>
                <p>
                  Unlike NFTs (tied to blockchain) or PDFs (human-readable only), VCs are:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li><strong className="text-white">Portable:</strong> Can be verified by anyone, anywhere, without visiting NeuraMark</li>
                  <li><strong className="text-white">Self-Sovereign:</strong> You control your credential in your own identity wallet</li>
                  <li><strong className="text-white">Interoperable:</strong> Standard W3C format works across platforms</li>
                  <li><strong className="text-white">Cryptographically Secure:</strong> Digital signature prevents tampering</li>
                </ul>
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
