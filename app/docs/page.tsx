"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Rocket,
  Shield,
  Code,
  Wallet,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Search,
  Globe,
  Database,
  Lock,
  Zap,
  Brain,
  Server,
  Key,
  Users,
  Trophy,
  Award,
  QrCode,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const sections: Section[] = [
  { id: "overview", title: "Overview", icon: <BookOpen className="w-5 h-5" /> },
  { id: "getting-started", title: "Getting Started", icon: <Rocket className="w-5 h-5" /> },
  { id: "authentication", title: "Authentication", icon: <Lock className="w-5 h-5" /> },
  { id: "proof-registration", title: "Proof Registration", icon: <Shield className="w-5 h-5" /> },
  { id: "did-system", title: "DID System", icon: <Key className="w-5 h-5" /> },
  { id: "nft-certificates", title: "NFT Certificates", icon: <Trophy className="w-5 h-5" /> },
  { id: "verifiable-credentials", title: "Verifiable Credentials", icon: <Award className="w-5 h-5" /> },
  { id: "ai-originality", title: "AI Originality", icon: <Brain className="w-5 h-5" /> },
  { id: "semantic-search", title: "Semantic Search", icon: <Search className="w-5 h-5" /> },
  { id: "ens-integration", title: "ENS Integration", icon: <Users className="w-5 h-5" /> },
  { id: "architecture", title: "Architecture", icon: <Server className="w-5 h-5" /> },
  { id: "troubleshooting", title: "Troubleshooting", icon: <AlertCircle className="w-5 h-5" /> },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Height of fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight - 32; // Extra 32px padding
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E12] text-white">
      {/* Spacer to account for fixed navbar (80px) */}
      <div className="h-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Fixed with dedicated scrollbar */}
          <aside className="w-64 shrink-0">
            <nav className="fixed w-64 top-28 bottom-8 overflow-y-scroll pr-2 space-y-0.5 custom-scrollbar border-r border-white/5 pb-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    activeSection === section.id
                      ? "bg-gradient-to-r from-indigo-500/20 to-teal-500/20 text-white border border-indigo-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <span className="font-medium text-xs">{section.title}</span>
                  {activeSection === section.id && (
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl min-w-0">
            {/* Overview Section */}
            <section id="overview" className="mb-16 scroll-mt-28">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                Welcome to NeuraMark
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  NeuraMark is a blockchain-powered platform that provides immutable proof-of-authorship 
                  verification for AI-generated content. Combining cutting-edge Web3 technology with 
                  user-friendly Web2 authentication, NeuraMark creates a unified identity system for 
                  the AI content creator.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                  <FeatureCard
                    icon={<Shield className="w-6 h-6 text-indigo-400" />}
                    title="Cryptographic Security"
                    description="SHA-256 hashing ensures content integrity and authenticity"
                  />
                  <FeatureCard
                    icon={<Globe className="w-6 h-6 text-teal-400" />}
                    title="Blockchain Backed"
                    description="Immutable proof stored on Ethereum Sepolia testnet"
                  />
                  <FeatureCard
                    icon={<Database className="w-6 h-6 text-purple-400" />}
                    title="IPFS Storage"
                    description="Decentralized content storage via Pinata"
                  />
                  <FeatureCard
                    icon={<Sparkles className="w-6 h-6 text-yellow-400" />}
                    title="AI-Powered"
                    description="Gemini AI analyzes content originality and uniqueness"
                  />
                </div>
              </div>
            </section>

            {/* Getting Started Section */}
            <section id="getting-started" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Rocket className="w-8 h-8 text-indigo-400" />
                Getting Started
              </h2>
              <div className="space-y-6">
                <StepCard
                  number="1"
                  title="Create an Account"
                  description="Sign up using Google OAuth or Email/Password. Your account is created in both Firebase and our database."
                  icon={<Users className="w-6 h-6" />}
                />
                <StepCard
                  number="2"
                  title="Link Your Wallet"
                  description="Connect your MetaMask wallet to your account. You can link multiple wallets for flexibility."
                  icon={<Wallet className="w-6 h-6" />}
                />
                <StepCard
                  number="3"
                  title="Register a Proof"
                  description="Upload your AI prompt and output. Our system will hash the content, upload to IPFS, and register on blockchain."
                  icon={<Shield className="w-6 h-6" />}
                />
                <StepCard
                  number="4"
                  title="Get Your Certificates"
                  description="Receive a soulbound NFT, W3C Verifiable Credential, and downloadable PDF certificate for your proof."
                  icon={<Award className="w-6 h-6" />}
                />
              </div>
            </section>

            {/* Authentication Section */}
            <section id="authentication" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Lock className="w-8 h-8 text-indigo-400" />
                Hybrid Authentication
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">Web2 + Web3 Identity</h3>
                <p className="text-gray-300 mb-4">
                  NeuraMark uses a hybrid authentication system combining Firebase Auth (Web2) with 
                  MetaMask wallets (Web3) to create a unified identity.
                </p>
                <div className="space-y-4">
                  <InfoBox
                    icon={<Users className="w-5 h-5 text-indigo-400" />}
                    title="Firebase Authentication"
                    description="Sign in with Google OAuth or Email/Password for familiar Web2 experience"
                  />
                  <InfoBox
                    icon={<Wallet className="w-5 h-5 text-teal-400" />}
                    title="MetaMask Integration"
                    description="Link one or more Ethereum wallets to your account"
                  />
                  <InfoBox
                    icon={<LinkIcon className="w-5 h-5 text-purple-400" />}
                    title="Multi-Wallet Support"
                    description="One account can link multiple wallets, but each wallet can only belong to one account"
                  />
                </div>
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-1">Wallet Linking Rules</h4>
                      <p className="text-sm text-gray-300">
                        ✅ One user → Many wallets | ❌ One wallet → One user ONLY (database enforced)
                      </p>
                    </div>
                  </div>
                </div>
              </DocCard>
            </section>

            {/* Proof Registration Section */}
            <section id="proof-registration" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-indigo-400" />
                Proof Registration
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">6-Step Registration Flow</h3>
                <div className="space-y-4">
                  <RegistrationStep
                    step="1"
                    title="Enter Content"
                    description="Provide your AI prompt, output (text/image/code), and model information"
                  />
                  <RegistrationStep
                    step="2"
                    title="Hash Generation"
                    description="Client-side SHA-256 hashing ensures privacy (raw content never sent to API)"
                  />
                  <RegistrationStep
                    step="3"
                    title="IPFS Upload"
                    description="Content uploaded to Pinata IPFS, returns Content Identifiers (CIDs)"
                  />
                  <RegistrationStep
                    step="4"
                    title="Blockchain Registration"
                    description="Sign MetaMask transaction to register proof on NeuraMark smart contract"
                  />
                  <RegistrationStep
                    step="5"
                    title="AI Originality Analysis"
                    description="Gemini AI analyzes uniqueness (0-100% score) by comparing with existing proofs"
                  />
                  <RegistrationStep
                    step="6"
                    title="NFT Certificate Minting"
                    description="Automatically mint soulbound ERC-721 token (non-transferable proof of authorship)"
                  />
                </div>
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-1">What You Get</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>✅ Immutable blockchain proof on Ethereum</li>
                        <li>✅ Decentralized IPFS storage with permanent CIDs</li>
                        <li>✅ AI originality score with confidence level</li>
                        <li>✅ Soulbound NFT certificate (viewable on OpenSea)</li>
                        <li>✅ W3C Verifiable Credential for portable verification</li>
                        <li>✅ Downloadable PDF certificate with QR code</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </DocCard>
            </section>

            {/* DID System Section */}
            <section id="did-system" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Key className="w-8 h-8 text-indigo-400" />
                Decentralized Identifiers (DID)
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">W3C DID Core v1.0 Compliant</h3>
                <p className="text-gray-300 mb-6">
                  NeuraMark implements a W3C-compliant DID system that creates a unified, verifiable 
                  identity linking your Firebase account, Ethereum wallets, and all registered proofs.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6 font-mono text-sm">
                  <div className="text-gray-400 mb-2">DID Format:</div>
                  <code className="text-cyan-400">did:neuramark:&lt;userId&gt;</code>
                  <div className="text-gray-400 mt-4 mb-2">Example:</div>
                  <code className="text-teal-400">did:neuramark:abc123xyz456</code>
                </div>
                <div className="space-y-4">
                  <InfoBox
                    icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    title="Auto-Generation"
                    description="DID created automatically on account signup with IPFS document upload"
                  />
                  <InfoBox
                    icon={<LinkIcon className="w-5 h-5 text-indigo-400" />}
                    title="Unified Identity"
                    description="Links Firebase UID, multiple wallets, and all proofs in one DID document"
                  />
                  <InfoBox
                    icon={<QrCode className="w-5 h-5 text-teal-400" />}
                    title="QR Code Generation"
                    description="Generate scannable QR codes for easy identity sharing and verification"
                  />
                  <InfoBox
                    icon={<Globe className="w-5 h-5 text-purple-400" />}
                    title="Public Verification"
                    description="Anyone can verify DIDs via /verify-did page using identifier or wallet address"
                  />
                </div>
              </DocCard>
            </section>

            {/* NFT Certificates Section */}
            <section id="nft-certificates" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-indigo-400" />
                Soulbound NFT Certificates
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">Non-Transferable Authorship Tokens</h3>
                <p className="text-gray-300 mb-6">
                  Every registered proof automatically receives a soulbound NFT (ERC-721 token) that 
                  serves as an immutable certificate of authorship. These tokens are permanently bound 
                  to your wallet and cannot be transferred or sold.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <h4 className="font-semibold text-indigo-300 mb-2">Contract Address</h4>
                    <code className="text-xs text-gray-300 break-all">
                      0x951df3400098cB80990B54E6bE651a54f94A36BF
                    </code>
                  </div>
                  <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                    <h4 className="font-semibold text-teal-300 mb-2">Network</h4>
                    <p className="text-gray-300">Ethereum Sepolia Testnet</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <InfoBox
                    icon={<Lock className="w-5 h-5 text-red-400" />}
                    title="Soulbound Logic"
                    description="All transfer and approve functions revert - tokens permanently bound to creator"
                  />
                  <InfoBox
                    icon={<Database className="w-5 h-5 text-indigo-400" />}
                    title="On-Chain Metadata"
                    description="Proof hashes, CIDs, model info stored directly on blockchain"
                  />
                  <InfoBox
                    icon={<ExternalLink className="w-5 h-5 text-teal-400" />}
                    title="OpenSea Compatible"
                    description="View certificates on OpenSea and other NFT marketplaces (view-only)"
                  />
                </div>
              </DocCard>
            </section>

            {/* Verifiable Credentials Section */}
            <section id="verifiable-credentials" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Award className="w-8 h-8 text-indigo-400" />
                W3C Verifiable Credentials
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">Portable Digital Passports</h3>
                <p className="text-gray-300 mb-6">
                  Unlike NFTs (Ethereum-only) or PDFs (visual-only), W3C Verifiable Credentials are 
                  cryptographically-signed, portable proofs that work with ANY W3C-compliant verifier.
                </p>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">Format</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">Purpose</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">Verification</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-300">Portability</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">🎨 NFT</td>
                        <td className="py-3 px-4">On-chain trophy</td>
                        <td className="py-3 px-4">Etherscan, OpenSea</td>
                        <td className="py-3 px-4">Ethereum-only</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-3 px-4">🎫 VC</td>
                        <td className="py-3 px-4">Digital passport</td>
                        <td className="py-3 px-4">Any W3C verifier</td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">Platform-independent</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">📄 PDF</td>
                        <td className="py-3 px-4">Human document</td>
                        <td className="py-3 px-4">Visual QR scan</td>
                        <td className="py-3 px-4">Print/email-friendly</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="space-y-4">
                  <InfoBox
                    icon={<Key className="w-5 h-5 text-indigo-400" />}
                    title="Ed25519 Signatures"
                    description="Cryptographic signatures prove authenticity without contacting NeuraMark"
                  />
                  <InfoBox
                    icon={<Globe className="w-5 h-5 text-teal-400" />}
                    title="JSON-LD Format"
                    description="Standard format recognized by identity wallets (Microsoft Entra, Trinsic, etc.)"
                  />
                  <InfoBox
                    icon={<Users className="w-5 h-5 text-purple-400" />}
                    title="Self-Sovereign"
                    description="You control the credential independently of the NeuraMark platform"
                  />
                </div>
              </DocCard>
            </section>

            {/* AI Originality Section */}
            <section id="ai-originality" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Brain className="w-8 h-8 text-indigo-400" />
                AI-Powered Originality Scoring
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">Gemini AI Analysis</h3>
                <p className="text-gray-300 mb-6">
                  Google&apos;s Gemini AI analyzes your content&apos;s uniqueness by comparing it against recent 
                  database entries, providing a 0-100% originality score with detailed explanation.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <ScoreBadge color="emerald" range="90-100%" label="Highly Original" />
                  <ScoreBadge color="teal" range="75-89%" label="Original" />
                  <ScoreBadge color="yellow" range="60-74%" label="Moderate" />
                  <ScoreBadge color="orange" range="<60%" label="Low" />
                </div>
                <div className="space-y-4">
                  <InfoBox
                    icon={<Brain className="w-5 h-5 text-purple-400" />}
                    title="Intelligent Analysis"
                    description="Analyzes prompt similarity, output uniqueness, model diversity, and temporal context"
                  />
                  <InfoBox
                    icon={<Database className="w-5 h-5 text-indigo-400" />}
                    title="Comparison Scope"
                    description="Compares against 50-100 most recent proofs in database"
                  />
                  <InfoBox
                    icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    title="Non-Blocking"
                    description="Registration succeeds even if AI analysis fails (fallback score provided)"
                  />
                </div>
              </DocCard>
            </section>

            {/* Semantic Search Section */}
            <section id="semantic-search" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Search className="w-8 h-8 text-indigo-400" />
                Semantic Search
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">ChromaDB + Jina AI v3</h3>
                <p className="text-gray-300 mb-6">
                  Vector-based semantic search enables intelligent content discovery using natural 
                  language queries. Find similar proofs by meaning, not just keywords.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <h4 className="font-semibold text-indigo-300 mb-2">Jina AI v3</h4>
                    <p className="text-sm text-gray-300">1024-dimensional semantic embeddings via REST API</p>
                  </div>
                  <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                    <h4 className="font-semibold text-teal-300 mb-2">ChromaDB</h4>
                    <p className="text-sm text-gray-300">Cloud-hosted vector database for similarity search</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <InfoBox
                    icon={<Search className="w-5 h-5 text-indigo-400" />}
                    title="Originality Risk"
                    description="Four-tier system (CRITICAL/HIGH/MEDIUM/LOW) for plagiarism detection"
                  />
                  <InfoBox
                    icon={<Shield className="w-5 h-5 text-teal-400" />}
                    title="Prior Art Detection"
                    description="Find existing similar content in blockchain registry before registration"
                  />
                  <InfoBox
                    icon={<Brain className="w-5 h-5 text-purple-400" />}
                    title="Context-Aware"
                    description="Embeddings enhanced with model info, content type, and authorship markers"
                  />
                </div>
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">Use Cases</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>🔍 Verify originality before registration</li>
                    <li>🚫 Detect duplicates and similar content</li>
                    <li>📊 Establish prior art for authorship disputes</li>
                    <li>🤝 Discover related proofs in your portfolio</li>
                  </ul>
                </div>
              </DocCard>
            </section>

            {/* ENS Integration Section */}
            <section id="ens-integration" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-400" />
                ENS Integration
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">Human-Readable Names</h3>
                <p className="text-gray-300 mb-6">
                  NeuraMark integrates with Ethereum Name Service (ENS) to display human-readable names 
                  like &quot;vitalik.eth&quot; instead of long wallet addresses throughout the platform.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Without ENS:</span>
                    <code className="text-sm text-gray-500">0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">With ENS:</span>
                    <code className="text-sm text-emerald-400 font-semibold">vitalik.eth</code>
                  </div>
                </div>
                <div className="space-y-4">
                  <InfoBox
                    icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    title="Automatic Resolution"
                    description="Reverse ENS lookup (address → name) using Viem on Ethereum mainnet"
                  />
                  <InfoBox
                    icon={<Database className="w-5 h-5 text-indigo-400" />}
                    title="1-Hour Caching"
                    description="In-memory cache minimizes RPC calls and improves performance"
                  />
                  <InfoBox
                    icon={<LinkIcon className="w-5 h-5 text-teal-400" />}
                    title="Graceful Fallback"
                    description="Falls back to truncated address format (0x1234...5678) if no ENS"
                  />
                </div>
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-1">Get Your ENS Name</h4>
                      <p className="text-sm text-gray-300">
                        ENS names must be purchased at <a href="https://app.ens.domains" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">app.ens.domains</a> (~$5-20/year). 
                        Set &quot;Primary ENS Name&quot; in settings for reverse resolution.
                      </p>
                    </div>
                  </div>
                </div>
              </DocCard>
            </section>

            {/* Architecture Section */}
            <section id="architecture" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Server className="w-8 h-8 text-indigo-400" />
                Technical Architecture
              </h2>
              <DocCard>
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">System Components</h3>
                <div className="space-y-4 mb-6">
                  <TechStack
                    icon={<Code className="w-5 h-5 text-indigo-400" />}
                    title="Frontend"
                    items={["Next.js 15", "React 19", "TypeScript 5", "Tailwind CSS 4", "Framer Motion"]}
                  />
                  <TechStack
                    icon={<Shield className="w-5 h-5 text-teal-400" />}
                    title="Blockchain"
                    items={["Ethereum Sepolia", "Solidity 0.8.27", "Hardhat 3", "Ethers.js v6", "Viem v2"]}
                  />
                  <TechStack
                    icon={<Database className="w-5 h-5 text-purple-400" />}
                    title="Storage"
                    items={["PostgreSQL (Supabase)", "Prisma ORM", "IPFS (Pinata)", "ChromaDB (Vector)"]}
                  />
                  <TechStack
                    icon={<Lock className="w-5 h-5 text-yellow-400" />}
                    title="Authentication"
                    items={["Firebase Auth", "Google OAuth", "MetaMask", "Email/Password"]}
                  />
                  <TechStack
                    icon={<Brain className="w-5 h-5 text-pink-400" />}
                    title="AI Services"
                    items={["Google Gemini", "Jina AI v3", "ChromaDB", "Semantic Embeddings"]}
                  />
                </div>
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4">Smart Contracts</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-indigo-300">NeuraMark (Proof Registry)</div>
                        <code className="text-xs text-gray-400 break-all">
                          0xe11b27FAfE1D18a2d9F1ab36314f84D47326A795
                        </code>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-teal-300">AuthorshipToken (NFT)</div>
                        <code className="text-xs text-gray-400 break-all">
                          0x951df3400098cB80990B54E6bE651a54f94A36BF
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </DocCard>
            </section>

            {/* Troubleshooting Section */}
            <section id="troubleshooting" className="mb-16 scroll-mt-28">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-indigo-400" />
                Troubleshooting
              </h2>
              <DocCard>
                <div className="space-y-6">
                  <TroubleshootItem
                    icon={<Wallet className="w-5 h-5 text-red-400" />}
                    title="MetaMask Not Connecting"
                    solution="Ensure you're on Sepolia network (Chain ID: 11155111). Click 'Switch Network' if prompted."
                  />
                  <TroubleshootItem
                    icon={<AlertCircle className="w-5 h-5 text-yellow-400" />}
                    title="Transaction Failing"
                    solution="Check you have sufficient Sepolia ETH for gas fees. Get testnet ETH from faucet: https://sepoliafaucet.com"
                  />
                  <TroubleshootItem
                    icon={<Users className="w-5 h-5 text-orange-400" />}
                    title="ENS Name Not Showing"
                    solution="ENS names must be purchased at app.ens.domains and 'Primary ENS Name' must be set. If no ENS, you'll see truncated address (0x1234...5678)."
                  />
                  <TroubleshootItem
                    icon={<Database className="w-5 h-5 text-blue-400" />}
                    title="IPFS Content Not Loading"
                    solution="IPFS can be slow on first load. Wait 30-60 seconds or try refreshing. Content is permanently stored."
                  />
                  <TroubleshootItem
                    icon={<Brain className="w-5 h-5 text-purple-400" />}
                    title="AI Originality Score Missing"
                    solution="AI analysis is optional and non-blocking. If Gemini API unavailable, a default score is provided."
                  />
                  <TroubleshootItem
                    icon={<Trophy className="w-5 h-5 text-teal-400" />}
                    title="NFT Not Showing in Wallet"
                    solution="NFTs appear on OpenSea Testnet within 5-10 minutes. Check: https://testnets.opensea.io/account"
                  />
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500/10 to-teal-500/10 border border-indigo-500/30 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-3">Need More Help?</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://github.com/varunaditya27/NeuraMark"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>GitHub Repository</span>
                    </a>
                    <a
                      href="https://sepolia.etherscan.io/address/0xe11b27FAfE1D18a2d9F1ab36314f84D47326A795"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on Etherscan</span>
                    </a>
                  </div>
                </div>
              </DocCard>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-3">
        <div className="shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-6 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors">
      <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 text-white font-bold text-xl">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function DocCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-lg bg-white/5 border border-white/10">
      {children}
    </div>
  );
}

function InfoBox({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg">
      <div className="shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function RegistrationStep({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-white/5">
      <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm">
        {step}
      </div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function ScoreBadge({ color, range, label }: { color: string; range: string; label: string }) {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    teal: "bg-teal-500/10 border-teal-500/30 text-teal-300",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-300",
  };
  return (
    <div className={`p-3 rounded-lg border text-center ${colorClasses[color]}`}>
      <div className="font-bold text-lg">{range}</div>
      <div className="text-xs mt-1">{label}</div>
    </div>
  );
}

function TechStack({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={index} className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-300">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function TroubleshootItem({ icon, title, solution }: { icon: React.ReactNode; title: string; solution: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-white/5">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-white mb-2">{title}</h4>
        <p className="text-sm text-gray-400">{solution}</p>
      </div>
    </div>
  );
}
