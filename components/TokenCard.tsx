"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Award, Calendar, Cpu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TokenCardProps {
  token: {
    id: string;
    tokenId: string;
    modelInfo: string;
    createdAt: string;
    tokenTxHash: string;
    outputCID: string;
    outputType: string;
    promptHash: string;
    outputHash: string;
  };
  index: number;
}

const AUTHORSHIP_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_AUTHORSHIP_TOKEN_ADDRESS || "";

export default function TokenCard({ token, index }: TokenCardProps) {
  const imageUrl = token.outputType === "image" 
    ? `https://gateway.pinata.cloud/ipfs/${token.outputCID}` 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300"
    >
      {/* Token ID Badge */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-300" />
                <span className="text-sm font-mono font-semibold text-indigo-300">
                  #{token.tokenId}
                </span>
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/30 backdrop-blur-sm">
            <span className="text-xs font-medium text-teal-300 uppercase tracking-wide">
              Soulbound
            </span>
          </div>
        </div>

        {/* Preview Image (if available) */}
        {imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden bg-black/30 border border-white/10">
            <motion.img
              src={imageUrl}
              alt={`Authorship Token #${token.tokenId}`}
              className="w-full h-48 object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content Type Badge (if not image) */}
        {!imageUrl && (
          <div className="mb-4 h-48 rounded-xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <Cpu className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-300">
                {token.outputType === "text" ? "Text Content" : "AI Content"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Proof Registered</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-3.5 w-3.5 text-gray-400" />
              <div className="text-xs text-gray-400">AI Model</div>
            </div>
            <div className="text-sm font-medium text-white ml-5">{token.modelInfo}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <div className="text-xs text-gray-400">Minted</div>
            </div>
            <div className="text-sm text-teal-300 ml-5">
              {formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Proof Hashes (Collapsible) */}
        <details className="mb-4 group/details">
          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300 transition-colors list-none flex items-center gap-2">
            <span className="text-indigo-400">▸</span>
            View Proof Hashes
          </summary>
          <div className="mt-2 p-3 rounded-lg bg-black/20 border border-white/5 space-y-2">
            <div>
              <div className="text-xs text-gray-500 mb-1">Prompt Hash</div>
              <div className="text-xs font-mono text-gray-300 break-all">
                {token.promptHash}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Output Hash</div>
              <div className="text-xs font-mono text-gray-300 break-all">
                {token.outputHash}
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Action Buttons */}
      <div className="p-5 pt-0 flex gap-2">
        <a
          href={`https://sepolia.etherscan.io/tx/${token.tokenTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 hover:border-indigo-500/50 transition-all text-xs font-medium group/btn"
        >
          <ExternalLink className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
          <span>Etherscan</span>
        </a>
        
        <a
          href={`https://testnets.opensea.io/assets/sepolia/${AUTHORSHIP_TOKEN_ADDRESS}/${token.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 hover:border-teal-500/50 transition-all text-xs font-medium group/btn"
        >
          <Award className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
          <span>OpenSea</span>
        </a>
      </div>

      {/* Soulbound Indicator */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-xs text-amber-200">
            Non-transferable • Permanently bound to your wallet
          </p>
        </div>
      </div>
    </motion.div>
  );
}
