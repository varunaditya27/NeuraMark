/**
 * ENSAddress Component
 * 
 * A reusable component to display Ethereum addresses with ENS resolution,
 * tooltips, copy functionality, and external links.
 * 
 * Features:
 * - Automatic ENS resolution with loading states
 * - Copy to clipboard functionality
 * - Tooltip showing full address
 * - External link to Etherscan
 * - Glassmorphic styling matching NeuraMark design
 * - Skeleton loading state
 * 
 * @example
 * <ENSAddress 
 *   address="0x1234..."
 *   showCopy
 *   showExternalLink
 *   variant="badge"
 * />
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { useENS } from "@/hooks/useENS";
import { formatAddress } from "@/lib/ensClient";

export interface ENSAddressProps {
  /** Ethereum address to display */
  address: string;
  /** Show copy to clipboard button */
  showCopy?: boolean;
  /** Show external link to Etherscan */
  showExternalLink?: boolean;
  /** Display variant */
  variant?: "default" | "badge" | "inline" | "compact";
  /** Custom className */
  className?: string;
  /** Etherscan network (default: sepolia) */
  network?: "mainnet" | "sepolia" | "goerli";
  /** Truncate display even if ENS is found */
  alwaysTruncate?: boolean;
  /** Maximum length for ENS name before truncation */
  maxLength?: number;
}

export default function ENSAddress({
  address,
  showCopy = false,
  showExternalLink = false,
  variant = "default",
  className = "",
  network = "sepolia",
  alwaysTruncate = false,
  maxLength = 30,
}: ENSAddressProps) {
  const { displayName, ensName, isLoading } = useENS(address);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const getEtherscanUrl = () => {
    const baseUrl = network === "mainnet" 
      ? "https://etherscan.io" 
      : `https://${network}.etherscan.io`;
    return `${baseUrl}/address/${address}`;
  };

  const getDisplayText = () => {
    if (alwaysTruncate) {
      return formatAddress(address);
    }
    
    if (ensName && ensName.length > maxLength) {
      return `${ensName.slice(0, maxLength)}...`;
    }
    
    return displayName;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "badge":
        return "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all";
      case "inline":
        return "inline-flex items-center gap-1.5";
      case "compact":
        return "inline-flex items-center gap-1 text-sm";
      default:
        return "inline-flex items-center gap-2";
    }
  };

  if (!address) {
    return <span className="text-gray-500">No address</span>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${getVariantStyles()} ${className}`}
      title={ensName ? `${ensName}\n${address}` : address}
    >
      {/* Address/ENS Name */}
      <span className={`${
        ensName ? 'text-indigo-300 font-medium' : 'text-gray-300 font-mono text-sm'
      } ${isLoading ? 'animate-pulse' : ''}`}>
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-gray-400">{formatAddress(address)}</span>
          </span>
        ) : (
          getDisplayText()
        )}
      </span>

      {/* ENS Badge (if ENS found) */}
      {ensName && !isLoading && variant !== "compact" && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          ENS
        </span>
      )}

      {/* Copy Button */}
      {showCopy && !isLoading && (
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Copy address"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-white" />
          )}
        </button>
      )}

      {/* External Link */}
      {showExternalLink && !isLoading && (
        <a
          href={getEtherscanUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="View on Etherscan"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-indigo-400" />
        </a>
      )}
    </motion.div>
  );
}

/**
 * Lightweight version without animations (for tables/lists)
 */
export function ENSAddressSimple({
  address,
  showCopy = false,
  className = "",
}: {
  address: string;
  showCopy?: boolean;
  className?: string;
}) {
  const { displayName, ensName, isLoading } = useENS(address);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`${
        ensName ? 'text-indigo-300' : 'text-gray-300 font-mono text-sm'
      } ${isLoading ? 'text-gray-500' : ''}`}>
        {isLoading ? formatAddress(address) : displayName}
      </span>
      
      {showCopy && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-all"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-400" />
          ) : (
            <Copy className="h-3 w-3 text-gray-400" />
          )}
        </button>
      )}
    </span>
  );
}
