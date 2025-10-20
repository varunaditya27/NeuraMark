"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Clock, Shield, FileText } from "lucide-react";
import GlassmorphicCard from "./GlassmorphicCard";
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
  };
  onView?: () => void;
}

export default function ProofCard({ proof }: ProofCardProps) {
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

  return (
    <GlassmorphicCard hover gradient className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {proof.modelInfo}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatDate(createdDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-green-400">Verified</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Creator</span>
            <span className="font-mono text-indigo-400">{formatAddress(proof.wallet)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Proof ID</span>
            <span className="font-mono text-teal-400">{formatAddress(proof.proofId)}</span>
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
            href={`https://gateway.pinata.cloud/ipfs/${proof.promptCID}`}
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
            href={`https://gateway.pinata.cloud/ipfs/${proof.outputCID}`}
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

        {/* Transaction Link */}
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
      </div>
    </GlassmorphicCard>
  );
}
