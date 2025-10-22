"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Wallet, Settings, LogOut, Plus, Copy, Check, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { connectWallet, getAccount, formatAddress } from "@/lib/ethersClient";
import { getDisplayName } from "@/lib/ensClient";

interface LinkedWallet {
  id: string;
  address: string;
  isPrimary: boolean;
  label: string | null;
}

export default function UnifiedAccountBadge() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [wallets, setWallets] = useState<LinkedWallet[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadWallets();
      checkConnectedWallet();
    }
  }, [user]);

  // Resolve ENS name for connected/primary wallet
  useEffect(() => {
    const primaryWallet = wallets.find(w => w.isPrimary);
    const displayWallet = connectedWallet || primaryWallet?.address;
    
    if (displayWallet) {
      getDisplayName(displayWallet).then(name => {
        setEnsName(name);
      });
    } else {
      setEnsName(null);
    }
  }, [connectedWallet, wallets]);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountsArray = accounts as string[];
        if (accountsArray.length > 0) {
          setConnectedWallet(accountsArray[0]);
        } else {
          setConnectedWallet(null);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadWallets = async () => {
    if (!user) return;
    
    setLoadingWallets(true);
    try {
      const response = await fetch("/api/wallet/list", {
        headers: { "x-firebase-uid": user.uid },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWallets(data.wallets || []);
      }
    } catch (error) {
      console.error("Error loading wallets:", error);
    } finally {
      setLoadingWallets(false);
    }
  };

  const checkConnectedWallet = async () => {
    try {
      const account = await getAccount();
      setConnectedWallet(account);
    } catch (error) {
      // MetaMask not connected or no account available
      setConnectedWallet(null);
    }
  };

  const handleConnectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !window.ethereum) {
        alert("MetaMask is not installed. Please install MetaMask browser extension.");
        window.open("https://metamask.io/download/", "_blank");
        return;
      }

      const address = await connectWallet();
      if (address) {
        setConnectedWallet(address);
        
        // Check if wallet is already linked
        const isLinked = wallets.some(w => w.address.toLowerCase() === address.toLowerCase());
        
        if (!isLinked) {
          // Link wallet to account
          const response = await fetch("/api/wallet/link", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-firebase-uid": user!.uid,
            },
            body: JSON.stringify({
              address,
              isPrimary: wallets.length === 0,
            }),
          });

          if (response.ok) {
            await loadWallets();
          } else {
            const errorData = await response.json();
            alert(`Failed to link wallet: ${errorData.error || 'Unknown error'}`);
          }
        }
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      
      // Provide user-friendly error messages
      const error = err as { code?: number; message?: string };
      
      if (error.code === 4001) {
        alert("Connection rejected. Please approve the connection request in MetaMask.");
      } else if (error.code === -32002) {
        alert("MetaMask connection already pending. Please check MetaMask and approve the request.");
      } else if (error.message?.includes("locked")) {
        alert("MetaMask is locked. Please unlock MetaMask and try again.");
      } else if (error.message?.includes("not installed")) {
        alert("MetaMask is not installed. Please install MetaMask browser extension.");
      } else {
        alert(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const primaryWallet = wallets.find(w => w.isPrimary);
  const displayWallet = connectedWallet || primaryWallet?.address;
  const isWalletActive = !!connectedWallet; // True if MetaMask is actively connected

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Badge Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/20 hover:border-white/30 transition-all backdrop-blur-sm group"
      >
        {/* User Avatar */}
        <div className="relative">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-10 h-10 rounded-xl border-2 border-indigo-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          
          {/* Wallet Connection Indicator - Only show when MetaMask is actively connected */}
          {isWalletActive && (
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border-2 border-teal-500">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* User Info + Wallet */}
        <div className="flex flex-col items-start">
          <span className="text-white font-semibold text-sm">
            {user?.displayName || "User"}
          </span>
          {displayWallet ? (
            <span className={`text-xs font-mono flex items-center gap-1 ${isWalletActive ? 'text-teal-300' : 'text-gray-400'}`}>
              <Wallet className="w-3 h-3" />
              {ensName || formatAddress(displayWallet)}
              {!isWalletActive && <span className="text-[10px] text-gray-500 ml-1">(Linked)</span>}
            </span>
          ) : (
            <span className="text-gray-400 text-xs">No wallet linked</span>
          )}
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-teal-500/10">
              <div className="flex items-center gap-3 mb-2">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-12 h-12 rounded-xl"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-white font-semibold">
                    {user?.displayName || "Anonymous User"}
                  </h3>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Wallet Section */}
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                  {isWalletActive ? 'Connected Wallet' : 'Wallet Status'}
                </span>
                {wallets.length > 0 && (
                  <span className="text-teal-400 text-xs">
                    {wallets.length} linked
                  </span>
                )}
              </div>

              {displayWallet ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group hover:border-teal-500/30 transition-all">
                    <div className="flex items-center gap-2 flex-1">
                      <Wallet className={`w-4 h-4 ${isWalletActive ? 'text-teal-400' : 'text-gray-400'}`} />
                      <span className="font-mono text-white text-sm">
                        {ensName || formatAddress(displayWallet)}
                      </span>
                      {!isWalletActive && (
                        <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-800/50">
                          Linked
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopyAddress(displayWallet)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copiedAddress === displayWallet ? (
                        <Check className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Connect to MetaMask button when wallet is linked but not connected */}
                  {!isWalletActive && (
                    <button
                      onClick={handleConnectWallet}
                      className="w-full p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-teal-500/10 border border-indigo-500/30 hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2 text-indigo-300 hover:text-indigo-200"
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm font-medium">Connect to MetaMask</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2 text-indigo-300 hover:text-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Link Wallet</span>
                </button>
              )}

              {/* Additional Linked Wallets */}
              {wallets.length > 1 && (
                <div className="mt-2 space-y-1">
                  {wallets
                    .filter(w => w.address.toLowerCase() !== connectedWallet?.toLowerCase())
                    .slice(0, 2)
                    .map((wallet) => (
                      <div
                        key={wallet.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-sm"
                      >
                        <span className="font-mono text-gray-300 text-xs">
                          {formatAddress(wallet.address)}
                        </span>
                        {wallet.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  {wallets.length > 3 && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/profile");
                      }}
                      className="w-full text-center text-xs text-indigo-300 hover:text-indigo-200 py-1"
                    >
                      +{wallets.length - 3} more wallets
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-gray-300 hover:text-white"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Profile Settings</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-gray-300 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
