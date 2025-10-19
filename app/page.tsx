"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Zap, Lock, ArrowRight, CheckCircle2, FileText, Wallet } from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: "Immutable Verification",
      description: "Cryptographically secure proof of authorship stored on the Sepolia blockchain.",
    },
    {
      icon: Lock,
      title: "Decentralized Storage",
      description: "Your content is stored on IPFS, ensuring permanent and censorship-resistant access.",
    },
    {
      icon: Zap,
      title: "Instant Validation",
      description: "Verify proofs in seconds using blockchain technology and cryptographic hashing.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Connect your MetaMask wallet to get started",
      icon: Wallet,
    },
    {
      number: "02",
      title: "Upload Content",
      description: "Upload your AI prompt and generated output",
      icon: FileText,
    },
    {
      number: "03",
      title: "Register Proof",
      description: "Create an immutable proof on the blockchain",
      icon: Shield,
    },
    {
      number: "04",
      title: "Verify Anytime",
      description: "Verify authorship whenever needed",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                Secure Your
              </span>
              <br />
              <span className="text-white">AI Creations</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Immutable proof-of-authorship verification for AI-generated content.
            Powered by blockchain technology and IPFS storage.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 rounded-xl font-semibold text-white text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative flex items-center gap-2">
                  <span>Register Proof</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </Link>

            <Link href="/verify">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-semibold text-white text-lg border-2 border-white/20 hover:border-indigo-500/50 hover:bg-white/5 transition-colors"
              >
                Verify Proof
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose NeuraMark?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built on cutting-edge Web3 technology for maximum security and transparency
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <GlassmorphicCard hover gradient className="p-8 h-full">
                  <div className="mb-6">
                    <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-teal-500/20 border border-indigo-500/20">
                      <feature.icon className="w-8 h-8 text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent to-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Four simple steps to secure your AI-generated content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500/50 to-transparent -z-10" />
                )}

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 relative">
                    <step.icon className="w-10 h-10 text-indigo-400" />
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 rounded-xl font-semibold text-white text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative flex items-center gap-2">
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <GlassmorphicCard gradient className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  100%
                </div>
                <div className="text-gray-400">Immutable</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  Secure
                </div>
                <div className="text-gray-400">Blockchain-Powered</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  Forever
                </div>
                <div className="text-gray-400">Permanent Storage</div>
              </motion.div>
            </div>
          </GlassmorphicCard>
        </div>
      </section>
    </div>
  );
}
