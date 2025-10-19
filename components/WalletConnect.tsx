"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, LogOut, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  connectWallet,
  getAccount,
  isMetaMaskInstalled,
  formatAddress,
  onAccountsChanged,
  onChainChanged,
  removeAccountsChangedListener,
  removeChainChangedListener,
  switchToSepolia,
  getNetworkInfo,
} from "@/lib/ethersClient";
import { CHAIN_ID } from "@/lib/config";

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const checkConnection = async () => {
    try {
      if (isMetaMaskInstalled()) {
        const acc = await getAccount();
        setAccount(acc);
        await checkNetwork();
      }
    } catch {
      // Wallet not connected yet
      console.log("Wallet not connected");
    }
  };

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkNetwork = async () => {
    try {
      const network = await getNetworkInfo();
      setWrongNetwork(network.chainId !== CHAIN_ID);
    } catch (err) {
      console.error("Error checking network:", err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isMetaMaskInstalled()) {
        setError("MetaMask is not installed. Please install MetaMask.");
        window.open("https://metamask.io/download/", "_blank");
        return;
      }

      const acc = await connectWallet();
      setAccount(acc);
      await checkNetwork();
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setWrongNetwork(false);
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToSepolia();
      await checkNetwork();
    } catch (err) {
      console.error("Error switching network:", err);
      setError(err instanceof Error ? err.message : "Failed to switch network");
    }
  };

  // Listen for account and network changes
  useEffect(() => {
    const handleAccountChange = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChange = () => {
      checkNetwork();
    };

    onAccountsChanged(handleAccountChange);
    onChainChanged(handleChainChange);

    return () => {
      removeAccountsChangedListener(handleAccountChange);
      removeChainChangedListener(handleChainChange);
    };
  }, []);

  if (!account) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConnect}
        disabled={loading}
        className="relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 transition-opacity group-hover:opacity-90" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        
        {/* Button content */}
        <div className="relative flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span>{loading ? "Connecting..." : "Connect Wallet"}</span>
        </div>
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Network warning */}
      {wrongNetwork && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleSwitchNetwork}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Switch to Sepolia</span>
        </motion.button>
      )}

      {/* Connected status */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          {!wrongNetwork && <CheckCircle2 className="w-4 h-4 text-green-400" />}
          <span className="text-sm font-mono text-gray-300">
            {formatAddress(account)}
          </span>
        </div>
        
        <button
          onClick={handleDisconnect}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm max-w-xs"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
