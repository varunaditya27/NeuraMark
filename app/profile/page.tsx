"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Wallet as WalletIcon, Mail, Clock, Shield, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, LogOut } from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import DIDCard from "@/components/DIDCard";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/firebase";
import { connectWallet, getAccount, formatAddress } from "@/lib/ethersClient";
import { useRouter } from "next/navigation";
import type { DIDDocument } from "@/lib/didClient";

interface LinkedWallet {
  id: string;
  address: string;
  isPrimary: boolean;
  label: string | null;
  createdAt: string;
}

interface DIDData {
  id: string;
  didId: string;
  didDocument: DIDDocument;
  ipfsCID: string | null;
  proofCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Wallet state
  const [wallets, setWallets] = useState<LinkedWallet[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [linkingWallet, setLinkingWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // DID state
  const [didData, setDidData] = useState<DIDData | null>(null);
  const [loadingDID, setLoadingDID] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      loadWallets();
      loadDID();
    }
  }, [user]);

  const loadDID = async () => {
    setLoadingDID(true);
    try {
      if (!user) return;

      const response = await fetch(`/api/did/create?userId=${user.uid}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.did) {
          setDidData(data.did);
        }
      }
    } catch (err) {
      console.error("Error loading DID:", err);
    } finally {
      setLoadingDID(false);
    }
  };

  const loadWallets = async () => {
    setLoadingWallets(true);
    setError(null);

    try {
      if (!user) return;

      const response = await fetch("/api/wallet/list", {
        headers: {
          "x-firebase-uid": user.uid,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to load wallets");
      }

      const data = await response.json();
      setWallets(data.wallets || []);
    } catch (err) {
      console.error("Error loading wallets:", err);
      setError(err instanceof Error ? err.message : "Failed to load wallets");
    } finally {
      setLoadingWallets(false);
    }
  };

  const handleLinkWallet = async () => {
    setLinkingWallet(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) {
        throw new Error("Not authenticated");
      }

      console.log("Linking wallet for user:", user.uid, user.email);

      // Connect MetaMask wallet
      const address = await connectWallet();
      
      if (!address) {
        throw new Error("Failed to connect wallet");
      }

      console.log("Connected wallet address:", address);

      // Link wallet to user account
      const response = await fetch("/api/wallet/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-firebase-uid": user.uid,
        },
        body: JSON.stringify({
          address,
          isPrimary: wallets.length === 0, // First wallet is primary
        }),
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (!response.ok) {
        // Show user-friendly error messages
        if (responseData.error === "Wallet already linked to another account") {
          throw new Error(
            "⚠️ This wallet is already linked to another account. Each wallet can only be associated with one account for security reasons."
          );
        } else if (responseData.error === "Wallet already linked to your account") {
          throw new Error(
            "ℹ️ This wallet is already linked to your account. You can see all your linked wallets below."
          );
        }
        throw new Error(responseData.error || "Failed to link wallet");
      }

      setSuccess("Wallet linked successfully!");
      await loadWallets();
    } catch (err) {
      console.error("Error linking wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to link wallet");
    } finally {
      setLinkingWallet(false);
    }
  };

  const handleUnlinkWallet = async (walletId: string) => {
    if (!confirm("Are you sure you want to unlink this wallet?")) {
      return;
    }

    try {
      if (!user) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/wallet/unlink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-firebase-uid": user.uid,
        },
        body: JSON.stringify({ walletId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unlink wallet");
      }

      setSuccess("Wallet unlinked successfully!");
      await loadWallets();
    } catch (err) {
      console.error("Error unlinking wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to unlink wallet");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push("/");
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out");
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassmorphicCard className="p-12 text-center border-amber-500/30 bg-amber-500/10">
            <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              Authentication Required
            </h3>
            <p className="text-amber-200 mb-6">
              Please sign in to view your profile
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Home
            </button>
          </GlassmorphicCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              Your Profile
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Manage your account and linked wallets
          </p>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {(success || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              {success && (
                <GlassmorphicCard className="p-4 bg-teal-500/10 border-teal-500/30 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  <p className="text-teal-200">{success}</p>
                </GlassmorphicCard>
              )}
              {error && (
                <GlassmorphicCard className="p-4 bg-red-500/10 border-red-500/30 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-200">{error}</p>
                </GlassmorphicCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <GlassmorphicCard gradient className="p-8">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-24 h-24 rounded-2xl border-2 border-indigo-500/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-teal-500/20 border border-teal-500/30">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.displayName || "Anonymous User"}
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Joined {new Date(user.metadata.creationTime || "").toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* DID Section */}
        {didData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <DIDCard
              didId={didData.didId}
              didDocument={didData.didDocument}
              ipfsCID={didData.ipfsCID || undefined}
              proofCount={didData.proofCount}
              createdAt={didData.createdAt}
            />
          </motion.div>
        )}

        {loadingDID && !didData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <GlassmorphicCard className="p-8">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}

        {/* Linked Wallets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlassmorphicCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                  <WalletIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Linked Wallets</h3>
                  <p className="text-gray-400 text-sm">
                    Connect your Web3 wallets to register proofs
                  </p>
                </div>
              </div>
              <button
                onClick={handleLinkWallet}
                disabled={linkingWallet}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {linkingWallet ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{linkingWallet ? "Linking..." : "Link Wallet"}</span>
              </button>
            </div>

            {/* Loading State */}
            {loadingWallets ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : wallets.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  No Wallets Linked
                </h4>
                <p className="text-gray-400 mb-6">
                  Link your first wallet to start registering proofs
                </p>
              </div>
            ) : (
              /* Wallets List */
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                        <WalletIcon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white">
                            {formatAddress(wallet.address)}
                          </span>
                          {wallet.isPrimary && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">
                          Added {new Date(wallet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnlinkWallet(wallet.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
}
