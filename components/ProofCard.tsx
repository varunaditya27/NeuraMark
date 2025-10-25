"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock, Shield, FileText, Download, Loader2, Key, Copy, Check } from "lucide-react";
import GlassmorphicCard from "./GlassmorphicCard";
import ENSAddress from "./ENSAddress";
import { formatAddress } from "@/lib/ethersClient";

interface ProofCardProps {
  proof: {
    proofId: string;
    wallet: string;
    modelInfo: string;
    promptHash: string;
    outputHash: string;
    promptCID: string;
    outputCID: string;
    outputType: string;
    txHash: string;
    createdAt: Date | string;
    originalityScore?: number | null;
    originalityAnalysis?: string | null;
    originalityConfidence?: number | null;
  };
  userId?: string; // Firebase user ID for VC generation
  onView?: () => void;
}

export default function ProofCard({ proof, userId }: ProofCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingVC, setIsDownloadingVC] = useState(false);
  const [copiedProofId, setCopiedProofId] = useState(false);

  const createdDate = typeof proof.createdAt === 'string' 
    ? new Date(proof.createdAt) 
    : proof.createdAt;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleCopyProofId = () => {
    navigator.clipboard.writeText(proof.proofId);
    setCopiedProofId(true);
    setTimeout(() => setCopiedProofId(false), 2000);
  };

  /**
   * Downloads the proof certificate as a PDF
   */
  const handleDownloadCertificate = async () => {
    setIsDownloading(true);

    try {
      // Prepare certificate data
      const certificateData = {
        proofTitle: `AI Content Proof - ${proof.modelInfo}`,
        creatorWallet: proof.wallet,
        ipfsCID: proof.outputCID,
        txHash: proof.txHash,
        timestamp: createdDate.toISOString(),
        proofFingerprint: proof.proofId,
        modelInfo: proof.modelInfo,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${proof.txHash}`,
      };

      // Call API to generate certificate
      const response = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate certificate');
      }

      // Get PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuramark-certificate-${proof.proofId.substring(0, 16)}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Downloads the verifiable credential (W3C VC) as JSON
   */
  const handleDownloadVC = async () => {
    if (!userId) {
      alert('Please sign in to download Verifiable Credential.');
      return;
    }

    setIsDownloadingVC(true);

    try {
      // Call API to issue verifiable credential
      const response = await fetch('/api/issue-vc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proofId: proof.proofId,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ VC Generation Failed:', errorData);
        
        // Show detailed error if debug info is available
        if (errorData.debug) {
          const { proofWallet, proofUserId, requestingUserId } = errorData.debug;
          
          // Check if the issue is likely an unlinked wallet
          const isUnlinkedWallet = !proofUserId || proofUserId !== requestingUserId;
          
          if (isUnlinkedWallet) {
            const message = 
              `⛓️ Wallet Not Linked\n\n` +
              `This proof was registered with wallet:\n${proofWallet}\n\n` +
              `To download the Verifiable Credential, you need to:\n` +
              `1. Click on your profile icon in the top-right\n` +
              `2. Connect your MetaMask wallet (${proofWallet.slice(0, 10)}...)\n` +
              `3. The wallet will be automatically linked to your account\n` +
              `4. Try downloading the VC again\n\n` +
              `Note: You must use the same wallet that registered this proof.`;
            alert(message);
          } else {
            alert(
              `Failed to generate Verifiable Credential:\n\n` +
              `Error: ${errorData.error}\n\n` +
              `Debug Info:\n` +
              `- Your User ID: ${requestingUserId}\n` +
              `- Proof User ID: ${proofUserId || 'Not set'}\n` +
              `- Proof Wallet: ${proofWallet}`
            );
          }
        } else {
          alert(`Failed to generate Verifiable Credential: ${errorData.error}`);
        }
        
        throw new Error(errorData.error || 'Failed to generate verifiable credential');
      }

      const data = await response.json();

      // Download the VC as JSON file
      const vcJSON = JSON.stringify(data.credential, null, 2);
      const blob = new Blob([vcJSON], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuramark-vc-${proof.proofId.substring(0, 16)}.json`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message with IPFS link
      alert(`✅ Verifiable Credential downloaded!\n\nThis credential is also stored on IPFS:\n${data.downloadURL}\n\nYou can present this credential to anyone to prove authorship.`);
    } catch (error) {
      console.error('Error downloading VC:', error);
      alert('Failed to download Verifiable Credential. Please try again.');
    } finally {
      setIsDownloadingVC(false);
    }
  };

  return (
    <GlassmorphicCard hover gradient className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {proof.modelInfo}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatDate(createdDate)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-400">Verified</span>
            </div>
            
            {/* Originality Score Badge */}
            {proof.originalityScore !== null && proof.originalityScore !== undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  proof.originalityScore >= 90
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : proof.originalityScore >= 75
                    ? "bg-teal-500/20 border border-teal-500/30 text-teal-400"
                    : proof.originalityScore >= 60
                    ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                    : "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                }`}
                title={proof.originalityAnalysis || "AI-powered originality score"}
              >
                {proof.originalityScore.toFixed(0)}% Original
              </motion.div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Creator</span>
            <ENSAddress 
              address={proof.wallet}
              variant="inline"
              showCopy
              showExternalLink
              network="sepolia"
            />
          </div>
          <div className="flex items-center justify-between text-sm group">
            <span className="text-gray-400">Proof ID</span>
            <div className="flex items-center gap-2">
              <span 
                className="font-mono text-teal-400 text-xs"
                title={proof.proofId}
              >
                {formatAddress(proof.proofId)}
              </span>
              <button
                onClick={handleCopyProofId}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                title="Copy full proof ID"
              >
                {copiedProofId ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hashes */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-gray-400 mb-1">Prompt Hash</div>
              <div className="font-mono text-xs text-gray-500 break-all">
                {proof.promptHash}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-gray-400 mb-1">Output Hash</div>
              <div className="font-mono text-xs text-gray-500 break-all">
                {proof.outputHash}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3">
          <motion.a
            href={`https://gateway.pinata.cloud/ipfs/${proof.promptCID}?filename=prompt.txt`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 transition-colors text-sm font-medium"
          >
            <span>View Prompt</span>
            <ExternalLink className="w-4 h-4" />
          </motion.a>
          <motion.a
            href={`https://gateway.pinata.cloud/ipfs/${proof.outputCID}${proof.outputType === "image" ? "?filename=output.png" : "?filename=output.txt"}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500/30 transition-colors text-sm font-medium"
          >
            <span>View {proof.outputType === "image" ? "Image" : "Output"}</span>
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>

        {/* Transaction Link and Download Buttons */}
        <div className="flex flex-col gap-2">
          <motion.a
            href={`https://sepolia.etherscan.io/tx/${proof.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
          >
            <span>View on Etherscan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>

          {/* Download Buttons Row */}
          <div className="flex items-center gap-2">
            {/* Download PDF Certificate Button */}
            <motion.button
              onClick={handleDownloadCertificate}
              disabled={isDownloading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 text-white hover:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">PDF</span>
                </>
              )}
            </motion.button>

            {/* Download Verifiable Credential Button */}
            {userId && (
              <motion.button
                onClick={handleDownloadVC}
                disabled={isDownloadingVC}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download W3C Verifiable Credential (portable proof)"
              >
                {isDownloadingVC ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Issuing...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span className="text-sm font-medium">VC</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
