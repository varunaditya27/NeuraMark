"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText, Zap } from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import { getAccount, isMetaMaskInstalled, hashText } from "@/lib/ethersClient";

interface RegistrationStep {
  step: number;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
}

export default function RegisterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  // Form state
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [modelInfo, setModelInfo] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Steps state
  const [steps, setSteps] = useState<RegistrationStep[]>([
    { step: 1, title: "Hash Content", description: "Generate cryptographic hashes", status: "pending" },
    { step: 2, title: "Upload to IPFS", description: "Store content on decentralized storage", status: "pending" },
    { step: 3, title: "Register On-Chain", description: "Create immutable blockchain record", status: "pending" },
    { step: 4, title: "Store Metadata", description: "Save to database for quick access", status: "pending" },
  ]);

  useEffect(() => {
    setMounted(true);
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (isMetaMaskInstalled()) {
        const account = await getAccount();
        setCurrentAccount(account);
        setWalletConnected(true);
      }
    } catch {
      setWalletConnected(false);
    }
  };

  const updateStepStatus = (stepNumber: number, status: RegistrationStep["status"]) => {
    setSteps((prev) =>
      prev.map((s) => (s.step === stepNumber ? { ...s, status } : s))
    );
  };

  const handleRegisterProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!prompt.trim() || !output.trim() || !modelInfo.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Dynamic import to avoid SSR issues
      const { registerProof, storeProof } = await import("@/lib/ethersClient").then(m => ({
        registerProof: m.registerProof,
        storeProof: () => import("@/lib/prisma").then(p => p.storeProof)
      }));

      // Step 1: Hash content
      updateStepStatus(1, "active");
      const promptHash = hashText(prompt);
      const outputHash = hashText(output);
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateStepStatus(1, "completed");

      // Step 2: Upload to IPFS
      updateStepStatus(2, "active");
      const uploadResponse = await fetch("/api/register-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          output,
          modelInfo,
          promptHash,
          outputHash,
          wallet: currentAccount,
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload to IPFS");
      }

      const uploadResult = await uploadResponse.json();
      const { promptCID, outputCID } = uploadResult;
      updateStepStatus(2, "completed");

      // Step 3: Register on blockchain
      updateStepStatus(3, "active");
      const blockchainResult = await registerProof(
        promptHash,
        outputHash,
        modelInfo,
        promptCID,
        outputCID
      );
      updateStepStatus(3, "completed");

      // Step 4: Store in database
      updateStepStatus(4, "active");
      const storeProofFn = await storeProof();
      await storeProofFn({
        proofId: blockchainResult.proofId,
        wallet: currentAccount!,
        modelInfo,
        promptHash,
        outputHash,
        promptCID,
        outputCID,
        txHash: blockchainResult.txHash,
      });
      updateStepStatus(4, "completed");

      setTxHash(blockchainResult.txHash);
      setSuccess(true);

      // Reset form after short delay
      setTimeout(() => {
        setPrompt("");
        setOutput("");
        setModelInfo("");
        setSteps((prev) => prev.map((s) => ({ ...s, status: "pending" })));
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Failed to register proof");
      setSteps((prev) => prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s)));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              Register Your Proof
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Create an immutable record of your AI-generated content on the blockchain
          </p>
        </motion.div>

        {/* Wallet Connection Warning */}
        {!walletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassmorphicCard className="p-6 border-amber-500/30 bg-amber-500/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <p className="text-amber-200">
                  Please connect your MetaMask wallet to register a proof
                </p>
              </div>
            </GlassmorphicCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <GlassmorphicCard gradient className="p-8">
              <form onSubmit={handleRegisterProof} className="space-y-6">
                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    AI Prompt <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter the prompt you used to generate the AI output..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                    rows={4}
                    disabled={loading}
                  />
                </div>

                {/* Output Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    AI Output <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    placeholder="Paste the AI-generated output here..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                    rows={6}
                    disabled={loading}
                  />
                </div>

                {/* Model Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    AI Model <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={modelInfo}
                    onChange={(e) => setModelInfo(e.target.value)}
                    placeholder="e.g., GPT-4, Claude 3, Gemini Pro"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    disabled={loading}
                  />
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-200 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence>
                  {success && txHash && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-xl bg-green-500/20 border border-green-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-200 text-sm font-medium mb-1">
                            Proof registered successfully!
                          </p>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-300 hover:text-green-200 underline"
                          >
                            View on Etherscan
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: walletConnected && !loading ? 1.02 : 1 }}
                  whileTap={{ scale: walletConnected && !loading ? 0.98 : 1 }}
                  type="submit"
                  disabled={!walletConnected || loading}
                  className="w-full relative px-6 py-4 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 blur-xl opacity-50" />
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Registering Proof...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Register Proof</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </form>
            </GlassmorphicCard>
          </motion.div>

          {/* Steps Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <GlassmorphicCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">
                Registration Process
              </h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="relative"
                  >
                    {index < steps.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-white/10" />
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-all ${
                          step.status === "completed"
                            ? "bg-green-500/20 border-2 border-green-500"
                            : step.status === "active"
                            ? "bg-indigo-500/20 border-2 border-indigo-500 animate-pulse"
                            : step.status === "error"
                            ? "bg-red-500/20 border-2 border-red-500"
                            : "bg-white/5 border-2 border-white/20"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : step.status === "active" ? (
                          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                        ) : step.status === "error" ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <span className="text-xs text-gray-500">{step.step}</span>
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h4
                          className={`text-sm font-medium transition-colors ${
                            step.status === "active" || step.status === "completed"
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Your proof will be permanently stored on the Sepolia blockchain and IPFS, ensuring immutability and verifiability.
                  </p>
                </div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>

        {/* View Dashboard CTA */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              View all your proofs on the Dashboard →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
