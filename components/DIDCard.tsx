"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Shield,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Wallet,
  FileCheck,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { formatDID, getDIDIPFSUrl } from "@/lib/didClient";

interface DIDCardProps {
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

export default function DIDCard({
  didId,
  didDocument,
  ipfsCID,
  proofCount,
  createdAt,
}: DIDCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShowQR = async () => {
    try {
      // Generate QR code for verification page URL
      const verificationUrl = `${window.location.origin}/verify-did?didId=${encodeURIComponent(didId)}`;
      const qr = await QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#6366F1",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(qr);
      setShowQR(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Decentralized Identifier
              </h3>
              <p className="text-sm text-gray-400">
                Your unified Web2 + Web3 identity
              </p>
            </div>
          </div>

          <button
            onClick={handleShowQR}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Show QR Code"
          >
            <QrCode className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        {/* DID ID */}
        <div className="mb-6 p-4 rounded-xl bg-black/20 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">DID</span>
            <button
              onClick={() => handleCopy(didId, "did")}
              className="p-1 rounded hover:bg-white/5 transition-colors"
            >
              {copied === "did" ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="font-mono text-sm text-white break-all">
            {formatDID(didId, 40)}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Verified Proofs */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-gray-400">Verified Proofs</span>
            </div>
            <p className="text-2xl font-bold text-white">{proofCount}</p>
          </div>

          {/* Linked Wallets */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-600/10 border border-teal-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-gray-400">Linked Wallets</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {didDocument.wallets.length}
            </p>
          </div>
        </div>

        {/* Wallets List */}
        {didDocument.wallets.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              Connected Wallets
            </h4>
            <div className="space-y-2">
              {didDocument.wallets.map((wallet, index) => (
                <div
                  key={wallet}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <span className="font-mono text-sm text-white">
                    {formatAddress(wallet)}
                  </span>
                  <button
                    onClick={() => handleCopy(wallet, `wallet-${index}`)}
                    className="p-1 rounded hover:bg-white/5 transition-colors"
                  >
                    {copied === `wallet-${index}` ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IPFS Link */}
        {ipfsCID && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              Immutable Storage
            </h4>
            <a
              href={getDIDIPFSUrl(ipfsCID)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">IPFS CID:</span>
                <span className="font-mono text-sm text-white">
                  {ipfsCID.slice(0, 12)}...
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </a>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5">
          <span>Created {formatDate(createdAt)}</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Immutable
          </span>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full p-8 rounded-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  DID QR Code
                </h3>
                <p className="text-sm text-gray-400">
                  Scan to verify this identity
                </p>
              </div>

              {qrCodeUrl && (
                <div className="mb-6 p-4 rounded-xl bg-white flex items-center justify-center">
                  <Image
                    src={qrCodeUrl}
                    alt="DID QR Code"
                    width={300}
                    height={300}
                    className="w-full max-w-[300px]"
                  />
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => handleCopy(didId, "qr-did")}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-medium flex items-center justify-center gap-2"
                >
                  {copied === "qr-did" ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy DID
                    </>
                  )}
                </button>

                {ipfsCID && (
                  <a
                    href={getDIDIPFSUrl(ipfsCID)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View on IPFS
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
