/**
 * Explorer Proof Table Component
 * 
 * Displays proofs in an animated, expandable table with glassmorphism design.
 * Features row expansion for details, QR code modal, and pagination.
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Code2,
  QrCode,
  X,
  Loader2
} from "lucide-react";
import { ExplorerProof, formatTimestamp, shortenAddress } from "@/lib/fetchProofs";
import QRCode from "qrcode";
import { useENSBatch } from "@/hooks/useENS";
import ENSAddress from "./ENSAddress";

interface ExplorerProofTableProps {
  proofs: ExplorerProof[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ExplorerProofTable({
  proofs,
  loading = false,
  onLoadMore,
  hasMore = false,
}: ExplorerProofTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ url: string; dataUrl: string } | null>(null);

  // Use batch ENS resolution hook for all creator addresses
  const creatorAddresses = proofs.map(p => p.creator);
  const ensMap = useENSBatch(creatorAddresses);

  const toggleRow = (proofId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(proofId)) {
      newExpanded.delete(proofId);
    } else {
      newExpanded.add(proofId);
    }
    setExpandedRows(newExpanded);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const showQRCode = async (proof: ExplorerProof) => {
    try {
      const dataUrl = await QRCode.toDataURL(proof.etherscanUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#6366F1',
          light: '#0E0E12',
        },
      });
      setQrCodeData({ url: proof.etherscanUrl, dataUrl });
      setQrModalOpen(true);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'code':
        return <Code2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'code':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  if (loading && proofs.length === 0) {
    return <LoadingSkeleton />;
  }

  if (proofs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Proofs Found</h3>
        <p className="text-gray-400">
          Try adjusting your search or filters to find more results.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {proofs.map((proof, index) => {
            const isExpanded = expandedRows.has(proof.proofId);
            
            return (
              <motion.div
                key={proof.proofId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                {/* Main Row */}
                <div
                  className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer"
                  onClick={() => toggleRow(proof.proofId)}
                >
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-4">
                      {/* Type Badge */}
                      <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getTypeBadgeColor(proof.proofType)}`}>
                        {getTypeIcon(proof.proofType)}
                        <span className="hidden sm:inline capitalize">{proof.proofType}</span>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Creator */}
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Creator</div>
                          <div className="text-sm">
                            <ENSAddress 
                              address={proof.creator}
                              variant="compact"
                              showCopy
                              network="sepolia"
                              maxLength={20}
                            />
                          </div>
                        </div>

                        {/* Model */}
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Model</div>
                          <div className="text-sm text-white font-medium truncate">
                            {proof.modelInfo}
                          </div>
                        </div>

                        {/* Originality Score */}
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Originality</div>
                          {proof.originalityScore !== null && proof.originalityScore !== undefined ? (
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              proof.originalityScore >= 90
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : proof.originalityScore >= 75
                                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                : proof.originalityScore >= 60
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            }`}>
                              {proof.originalityScore.toFixed(0)}%
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">N/A</div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Registered</div>
                          <div className="text-sm text-teal-300">
                            {formatTimestamp(proof.timestamp)}
                          </div>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-indigo-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-5 pb-4 border-t border-white/10 pt-4 space-y-4">
                          {/* Hashes */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <CopyableField
                              label="Prompt Hash"
                              value={proof.promptHash}
                              fieldId={`prompt-${proof.id}`}
                              copiedField={copiedField}
                              onCopy={copyToClipboard}
                            />
                            <CopyableField
                              label="Output Hash"
                              value={proof.outputHash}
                              fieldId={`output-${proof.id}`}
                              copiedField={copiedField}
                              onCopy={copyToClipboard}
                            />
                          </div>

                          {/* IPFS CIDs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <CopyableField
                              label="Prompt CID"
                              value={proof.promptCID}
                              fieldId={`prompt-cid-${proof.id}`}
                              copiedField={copiedField}
                              onCopy={copyToClipboard}
                              link={`https://gateway.pinata.cloud/ipfs/${proof.promptCID}`}
                            />
                            <CopyableField
                              label="Output CID"
                              value={proof.outputCID}
                              fieldId={`output-cid-${proof.id}`}
                              copiedField={copiedField}
                              onCopy={copyToClipboard}
                              link={`https://gateway.pinata.cloud/ipfs/${proof.outputCID}`}
                            />
                          </div>

                          {/* Originality Analysis (if available) */}
                          {proof.originalityScore !== null && proof.originalityScore !== undefined && (
                            <div className={`p-4 rounded-lg border ${
                              proof.originalityScore >= 90
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : proof.originalityScore >= 75
                                ? "bg-teal-500/10 border-teal-500/30"
                                : proof.originalityScore >= 60
                                ? "bg-yellow-500/10 border-yellow-500/30"
                                : "bg-orange-500/10 border-orange-500/30"
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="text-2xl font-bold text-white">
                                    {proof.originalityScore.toFixed(0)}%
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Originality
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-white mb-1">
                                    AI Analysis
                                  </div>
                                  <div className="text-sm text-gray-300 leading-relaxed">
                                    {proof.originalityAnalysis || "Content uniqueness verified through AI analysis."}
                                  </div>
                                  {proof.originalityConfidence !== null && proof.originalityConfidence !== undefined && (
                                    <div className="text-xs text-gray-400 mt-2">
                                      Confidence: {proof.originalityConfidence.toFixed(0)}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            <motion.a
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              href={proof.etherscanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all text-sm font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                              View on Etherscan
                            </motion.a>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                showQRCode(proof);
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all text-sm font-medium"
                            >
                              <QrCode className="h-4 w-4" />
                              Show QR Code
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMore && onLoadMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLoadMore}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Load More'
              )}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModalOpen && qrCodeData && (
          <QRCodeModal
            dataUrl={qrCodeData.dataUrl}
            url={qrCodeData.url}
            onClose={() => setQrModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Copyable Field Component
function CopyableField({
  label,
  value,
  fieldId,
  copiedField,
  onCopy,
  link,
}: {
  label: string;
  value: string;
  fieldId: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  link?: string;
}) {
  const isCopied = copiedField === fieldId;

  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
        <code className="flex-1 text-xs text-gray-300 truncate font-mono">
          {shortenAddress(value, 8)}
        </code>
        <div className="flex items-center gap-1">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-teal-400" />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(value, fieldId);
            }}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
          >
            {isCopied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// QR Code Modal Component
function QRCodeModal({
  dataUrl,
  url,
  onClose,
}: {
  dataUrl: string;
  url: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full p-6 rounded-2xl bg-[#0E0E12] border border-white/20 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Blockchain Verification</h3>
          <p className="text-sm text-gray-400">
            Scan this QR code to view the proof on Etherscan
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 rounded-xl bg-white inline-block">
              <img src={dataUrl} alt="QR Code" className="w-64 h-64" />
            </div>
          </div>

          {/* URL */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <code className="text-xs text-gray-300 break-all">{url}</code>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-white/5 border border-white/10 p-5 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-8 bg-white/10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
            <div className="w-5 h-5 bg-white/10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
