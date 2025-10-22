<div align="center">

# 🧠 NeuraMark

### Blockchain-Powered Proof-of-Authorship for AI-Generated Content

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-627eea?style=for-the-badge&logo=ethereum)](https://ethereum.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Prove that <em>you</em> generated a specific AI output using a particular prompt and model at a particular time.</strong>
</p>

[Features](#-features) •
[Demo](#-demo) •
[Installation](#-installation) •
[Usage](#-usage) •
[Architecture](#-architecture) •
[Contributing](#-contributing)

</div>

---

## 🎯 Overview

**NeuraMark** is a decentralized platform that verifies the originality and authorship of AI-generated content through blockchain technology. With the rise of generative AI tools (ChatGPT, Midjourney, Gemini), proving who originally created a specific AI-generated artifact has become nearly impossible. NeuraMark solves this by creating immutable, cryptographically-verified proof of authorship.

### 🔥 Key Highlights

- **🔐 Cryptographic Verification**: SHA-256 hashing ensures content integrity
- **⛓️ Blockchain-Backed**: Immutable proof stored on Ethereum (Sepolia testnet)
- **🎨 Soulbound NFT Certificates**: Automatic ERC-721 token minting for each proof (non-transferable)
- **� W3C Verifiable Credentials**: Portable, cryptographically-signed proof credentials
- **�🆔 Decentralized Identifiers (DID)**: W3C DID Core v1.0 compliant identity system
- **📦 IPFS Storage**: Decentralized content storage via Pinata (prompts, outputs, DIDs, VCs)
- **🎨 Modern UI**: Glassmorphism design with smooth Framer Motion animations
- **👤 Hybrid Authentication**: Firebase Auth (Google OAuth + Email/Password) + MetaMask wallets
- **💼 Multi-Wallet Support**: Link multiple Ethereum addresses to one account
- **🔗 Unified Account Badge**: Innovative UI merging profile and wallet status
- **📄 PDF Certificates**: Download professional certificates with QR codes and blockchain verification
- **🔍 Public Proof Explorer**: Browse all proofs with real-time stats, search, and filters
- **✅ Public Verification**: Verify registered proofs, DIDs, and VCs via dedicated verification pages
- **📊 DID-Linked Proofs**: Unified identity linking all Web2 + Web3 accounts and proofs
- **🤖 AI-Powered Originality Score**: Gemini AI analyzes content uniqueness (0-100% score with confidence)
- **🏷️ ENS Integration**: Display human-readable ENS names (e.g., vitalik.eth) instead of wallet addresses

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **👤 User Authentication** | Sign in with Google OAuth or Email/Password via Firebase |
| **🆔 Decentralized Identity (DID)** | Auto-generated DID linking Web2 account + Web3 wallets + all proofs |
| **💼 Multi-Wallet Management** | Link and manage multiple Ethereum addresses per account |
| **🎭 Proof Registration** | Register AI prompts, outputs, and model metadata with cryptographic hashing |
| **🎨 Authorship NFTs** | Automatically mint soulbound ERC-721 tokens for each registered proof |
| **🎫 Verifiable Credentials** | Issue W3C-compliant VCs for portable, platform-independent proof verification |
| **✅ Proof Verification** | Verify any registered proof using proof ID or content hash |
| **🔍 DID Verification** | Public verification of decentralized identities via DID or wallet address |
| **🎟️ VC Verification** | Upload and verify W3C Verifiable Credentials from any source |
| **🌐 Public Proof Explorer** | Browse all registered proofs with advanced search and filters |
| **�📊 Dashboard** | View all your registered proofs with search, filter, and sort capabilities |
| **👤 Profile Management** | Manage account settings, linked wallets, and user preferences |
| **📄 Certificate Generation** | Download professional PDF certificates with QR codes for any proof |
| **🌐 IPFS Integration** | Decentralized content storage with permanent CID references |
| **🔗 Blockchain Tracking** | View transaction details on Etherscan |
| **🤖 AI Originality Analysis** | Gemini AI compares proofs and generates 0-100% uniqueness score |
| **🏷️ ENS Name Resolution** | Display human-readable ENS names (e.g., vitalik.eth) instead of addresses |

### Technical Features

- **Hybrid Authentication**: Firebase Auth for Web2 + MetaMask for Web3 identity
- **Smart Contracts**: Two Solidity contracts on Sepolia (NeuraMark proof registry + AuthorshipToken NFTs)
- **DID System**: W3C DID Core v1.0 compliant with IPFS-backed immutable documents
- **Verifiable Credentials**: W3C VC Data Model v1.1 with Ed25519 cryptographic signatures
- **Database**: PostgreSQL (Supabase) with Prisma ORM for users, wallets, proofs, DIDs, and VCs
- **Multi-Wallet Architecture**: One user account can link multiple Ethereum addresses
- **Wallet Linking Rules**: Enforced one-to-one mapping (one wallet = one user only)
- **ENS Resolution**: Automatic ENS name lookup with 1-hour caching for user-friendly address display
- **Hash Generation**: Client-side SHA-256 hashing via Web Crypto API for privacy
- **Gas Optimization**: Minimal on-chain storage to reduce costs
- **Type Safety**: Full TypeScript implementation with strict mode
- **Responsive Design**: Mobile-first approach with Tailwind CSS and glassmorphism

---

## 🚀 Demo

### Live Application

🌐 **Frontend**: [Your deployed URL here]  
⚙️ **NeuraMark Contract**: [`0xe11b27FAfE1D18a2d9F1ab36314f84D47326A795`](https://sepolia.etherscan.io/address/0xe11b27FAfE1D18a2d9F1ab36314f84D47326A795)  
🎨 **AuthorshipToken Contract**: [`0x951df3400098cB80990B54E6bE651a54f94A36BF`](https://sepolia.etherscan.io/address/0x951df3400098cB80990B54E6bE651a54f94A36BF)  
🔗 **Network**: Sepolia Testnet (Chain ID: 11155111)

### Screenshots

<div align="center">
  <img src="docs/screenshots/landing.png" alt="Landing Page" width="800"/>
  <p><em>Landing Page - Futuristic glassmorphism design</em></p>
  
  <img src="docs/screenshots/register.png" alt="Register Proof" width="800"/>
  <p><em>Register Page - 4-step animated proof registration</em></p>
  
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="800"/>
  <p><em>Dashboard - View and manage all your proofs</em></p>
</div>

---

## 📦 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **MetaMask** wallet browser extension
- **Sepolia ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/varunaditya27/NeuraMark.git
cd NeuraMark

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your actual credentials

# Initialize database
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe11b27FAfE1D18a2d9F1ab36314f84D47326A795
NEXT_PUBLIC_AUTHORSHIP_TOKEN_ADDRESS=0x951df3400098cB80990B54E6bE651a54f94A36BF
NEXT_PUBLIC_CHAIN_ID=11155111

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"

# IPFS Storage (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key
PINATA_JWT=your_pinata_jwt_token

# RPC Provider (Alchemy)
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_api_key

# Etherscan (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gemini AI (for originality scoring)
GEMINI_API_KEY=your_gemini_api_key
```

### Get Your Credentials

1. **Firebase**: [https://console.firebase.google.com](https://console.firebase.google.com) - Create project, enable Authentication (Google + Email/Password)
2. **Supabase**: [https://supabase.com](https://supabase.com) - Create project and get database URL
3. **Pinata**: [https://pinata.cloud](https://pinata.cloud) - Sign up and get API keys
4. **Alchemy**: [https://alchemy.com](https://alchemy.com) - Create app for Sepolia network
5. **Etherscan**: [https://etherscan.io/apis](https://etherscan.io/apis) - Get API key for contract verification
6. **Gemini AI**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) - Get API key for originality scoring

---

## 🎮 Usage

### 1. Create an Account

Click **"Sign In"** in the navbar and choose:
- **Google OAuth**: One-click sign-in with your Google account
- **Email/Password**: Create account with email and password

Your account is created in both Firebase and the NeuraMark database.

### 2. Link Your Wallet(s)

After signing in:
1. Navigate to your **Profile** page (click your avatar)
2. Click **"Link Wallet"** button
3. Approve MetaMask connection
4. Your wallet is now linked to your account (first wallet becomes Primary)

**Multi-Wallet Support**: You can link multiple Ethereum addresses to one account for flexibility.

### 3. Register a Proof

Navigate to `/register`:

**Step 1: Enter Content**
- AI Prompt: The prompt you used to generate content
- AI Output: The generated content (text, code, or image)
- Model Info: AI model name (e.g., GPT-4, Claude 3, DALL-E 3, Midjourney)
- Output Type: Select "text", "image", or "code"

**Step 2: Hash Content**
- System computes SHA-256 hashes client-side
- Ensures privacy (raw content never sent to server)
- Displays prompt hash and output hash

**Step 3: Upload to IPFS**
- Content uploaded to Pinata IPFS
- Returns Content Identifiers (CIDs)
- Immutable, decentralized storage

**Step 4: Register on Blockchain**
- Click "Register Proof" button
- Approve MetaMask transaction (requires Sepolia ETH)
- Proof registered on NeuraMark smart contract
- Transaction hash generated

**Step 5: AI Originality Analysis** ⭐ NEW!
- Gemini AI compares your content against existing proofs
- Returns 0-100% originality score with detailed analysis
- Color-coded badge (🟢 90%+ = Highly Original → 🔴 <40% = Low Originality)
- Includes confidence level and similar proof detection
- Non-blocking: Registration succeeds even if AI unavailable

**Step 6: Mint NFT Certificate**
- Automatically mints soulbound ERC-721 token
- Token includes on-chain metadata
- Non-transferable proof of authorship
- Viewable on OpenSea and Etherscan

**What Happens**:
- ✅ Proof stored immutably on Ethereum blockchain
- ✅ Content stored on IPFS with permanent CIDs
- ✅ AI originality score calculated (e.g., "92% Original")
- ✅ Soulbound NFT minted to your wallet
- ✅ Metadata saved in database linked to your account
- ✅ Your DID updated with new proof reference
- ✅ PDF certificate available for download
- ✅ W3C Verifiable Credential issued for portable verification

### 📜 Three Proof Formats: NFT vs VC vs PDF

NeuraMark provides **three complementary proof formats**, each serving different use cases:

| Format | Purpose | Verification | Portability | Use Case |
|--------|---------|--------------|-------------|----------|
| **🎨 Soulbound NFT** | On-chain trophy | Etherscan, OpenSea | Ethereum-only | Showcase blockchain ownership |
| **🎫 W3C Verifiable Credential** | Digital passport | Any W3C-compliant verifier | **Platform-independent** | Present proofs to any service |
| **📄 PDF Certificate** | Human document | Visual QR scan | Print/email-friendly | Legal docs, portfolios |

**Why Verifiable Credentials?**

Unlike NFTs (tied to Ethereum) or PDFs (no cryptographic verification), W3C Verifiable Credentials are:
- ✅ **Self-Sovereign**: You control the credential, not the platform
- ✅ **Portable**: Works with any identity wallet (not just Ethereum)
- ✅ **Interoperable**: Standard JSON-LD format recognized globally
- ✅ **Cryptographically Signed**: Ed25519 signatures prove authenticity
- ✅ **Independently Verifiable**: Anyone can verify without contacting NeuraMark

**How to Use VCs:**
1. From your dashboard, click "Download VC" on any proof
2. Save the JSON file to your identity wallet (e.g., Microsoft Entra, Trinsic)
3. Present the VC to any service that needs proof verification
4. They verify the signature using our public DID - no API calls needed!

### 4. Manage Your Profile

Navigate to `/profile` to:

- View account information (email, display name, join date)
- Manage linked wallets (add/remove, set primary)
- View wallet connection status
- Sign out from your account

### 5. View Your Proofs

Navigate to `/dashboard` to see all your registered proofs with:

- Search functionality
- Model filters
- Sort by date
- Proof statistics

### 6. Explore Public Proofs

Navigate to `/explorer` to browse all registered proofs:

- **Real-Time Statistics**: View total proofs, type breakdown, and top models
- **Advanced Search**: Filter by wallet, model, or proof ID
- **Type Filters**: Filter by Text, Image, or Code proofs
- **Expandable Details**: Click any row to see full proof information
- **QR Codes**: Generate QR codes for easy mobile verification
- **Direct Links**: Open proofs on IPFS or Etherscan

### 7. Verify a Proof

Navigate to `/verify`:

1. Enter a proof ID
2. View complete proof details:
   - Creator wallet address and user account
   - Timestamp
   - Model information
   - Content hashes
   - IPFS links
   - Etherscan transaction

---

## 🆔 Decentralized Identifiers (DID)

### Unified Web2 + Web3 Identity

NeuraMark implements a **W3C DID Core v1.0 compliant** decentralized identifier system that creates a unified, verifiable identity linking your Firebase account, Ethereum wallets, and all registered proofs.

#### Key Features

- **🔐 W3C Compliant**: Follows DID Core v1.0 specification for interoperability
- **🔄 Auto-Generation**: DID created automatically on account signup
- **🔗 Unified Identity**: Links Firebase UID, multiple wallets, and all proofs in one DID
- **📦 IPFS Storage**: DID documents stored immutably on IPFS with CID references
- **📱 QR Codes**: Generate scannable QR codes for easy identity sharing
- **✅ Public Verification**: Anyone can verify DIDs via `/verify-did` page
- **📊 Proof Tracking**: DID automatically updates when you register new proofs
- **💼 Wallet Management**: DID syncs when you link/unlink wallets

#### DID Format

```text
did:neuramark:<userId>
```

**Example**: `did:neuramark:abc123xyz456`

#### Usage

**Viewing Your DID**:
1. Sign in to your account
2. Navigate to `/profile`
3. Your DID is displayed in the DID section with:
   - DID identifier (copyable)
   - Verified proof count
   - Linked wallets count
   - IPFS document link
   - QR code generator

**Verifying a DID**:
1. Navigate to `/verify-did`
2. Enter a DID identifier (`did:neuramark:...`) OR a wallet address
3. View complete DID document including:
   - All linked wallets
   - Registered proofs list
   - Verification methods
   - IPFS CID
   - Creation timestamp

**Dashboard Integration**:
- Your dashboard shows "DID-Linked Proofs" statistic
- Displays total proofs associated with your DID
- Updates in real-time as you register new proofs

---

## � Authorship NFT Certificates (NEW!)

### Soulbound Tokens for Proof Ownership

Every registered proof automatically receives a **soulbound NFT** (non-transferable ERC-721 token) that serves as an immutable certificate of authorship.

#### Key Features

- **🔒 Soulbound**: Tokens cannot be transferred or sold, ensuring authentic ownership
- **🎨 ERC-721 Standard**: Compatible with OpenSea, Rarible, and other NFT marketplaces (view-only)
- **📊 On-Chain Metadata**: Proof hashes, IPFS CIDs, and model info stored directly on blockchain
- **🖼️ Visual Certificates**: Each token links to rich metadata including proof content
- **🔗 Permanent Linkage**: Token ID tied to proof ID for verifiable authenticity

#### Smart Contract

**Contract Address**: [`0x951df3400098cB80990B54E6bE651a54f94A36BF`](https://sepolia.etherscan.io/address/0x951df3400098cB80990B54E6bE651a54f94A36BF)  
**Token Name**: NeuraMark Authorship Token  
**Symbol**: NEURA  
**Network**: Sepolia Testnet

```solidity
contract AuthorshipToken is ERC721, Ownable {
    struct ProofMetadata {
        string promptHash;
        string outputHash;
        string ipfsCID;
        string modelInfo;
        uint256 timestamp;
        address creator;
    }
    
    function mintAuthorshipToken(
        address to,
        string memory promptHash,
        string memory outputHash,
        string memory ipfsCID,
        string memory modelInfo
    ) external returns (uint256 tokenId);
    
    // Transfer functions are overridden to revert (soulbound)
}
```

#### How It Works

1. **Register Proof**: User registers AI content proof on blockchain
2. **Auto-Mint NFT**: System automatically mints soulbound token with proof metadata
3. **Store Token ID**: Database links proof to token for easy retrieval
4. **View Certificate**: Users see NFT in dashboard "Authorship Certificates" section
5. **Verify On-Chain**: Anyone can view token on Etherscan/OpenSea (testnet)

#### Dashboard Integration

The dashboard now features a dedicated **"Your Authorship Certificates"** section displaying:

- Token ID and soulbound badge
- Model information and creation date
- Proof content hash
- Links to Etherscan and OpenSea
- Visual preview (for image-based proofs)

#### Links

- **Etherscan**: [View Contract](https://sepolia.etherscan.io/address/0x951df3400098cB80990B54E6bE651a54f94A36BF)
- **Blockscout**: [View Verified Source](https://eth-sepolia.blockscout.com/address/0x951df3400098cB80990B54E6bE651a54f94A36BF#code)
- **OpenSea Testnet**: View your tokens at `https://testnets.opensea.io/assets/sepolia/0x951df3400098cB80990B54E6bE651a54f94A36BF/[tokenId]`

---

## 🆔 Decentralized Identifier (DID-Lite) System

### Unified Web2 + Web3 Identity

NeuraMark implements a **DID-Lite system** that creates a unified decentralized identifier for each user, linking their Firebase account (Web2) with their Ethereum wallets (Web3) and all verified AI proofs.

#### Key Features

- **🌐 Universal Identity**: One DID represents your entire NeuraMark identity
- **🔗 Cross-Platform**: Links email authentication with multiple wallet addresses
- **📦 IPFS Storage**: DID documents are immutably stored on IPFS
- **✅ Proof Aggregation**: All your verified proofs are linked to your DID
- **📱 QR Code Verification**: Generate QR codes for easy identity verification
- **🔐 Cryptographic Signatures**: Optional wallet signatures for DID documents
- **🔍 Public Verification**: Anyone can verify a DID via wallet or DID ID

#### DID Document Structure

```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:neuramark:clx1234567890",
  "name": "User Display Name",
  "email": "user@example.com",
  "wallets": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3"],
  "verifiedProofs": [
    {
      "proofId": "0x1a2b3c...",
      "ipfsCID": "QmX...",
      "model": "GPT-4",
      "timestamp": "2025-10-21T12:00:00.000Z",
      "txHash": "0xabc..."
    }
  ],
  "createdAt": "2025-10-21T10:00:00.000Z",
  "updatedAt": "2025-10-21T12:00:00.000Z"
}
```

#### Automatic DID Creation

**When you sign up:**
1. Create Firebase account (Google OAuth or Email/Password)
2. DID is automatically generated with format: `did:neuramark:<userId>`
3. Initial DID document is created with your email and display name
4. Document is uploaded to IPFS and CID stored in database

**When you link a wallet:**
1. Connect MetaMask wallet
2. DID document is updated with new wallet address
3. Updated document re-uploaded to IPFS (new CID)
4. All changes are immutable via IPFS versioning

**When you register a proof:**
1. Proof is registered on blockchain
2. Proof metadata automatically added to your DID document
3. DID document re-uploaded to IPFS
4. Proof count incremented in database

#### DID Verification

Navigate to `/verify-did` to verify any identity:

1. **Enter DID**: `did:neuramark:clx1234567890`
2. **Or Wallet Address**: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3`
3. **View Results**:
   - Complete DID document
   - All linked wallets
   - All verified proofs with timestamps
   - IPFS storage link
   - QR code for mobile verification

#### API Endpoints

- **POST `/api/did/create`**: Create new DID (automatic on signup)
- **GET `/api/did/get?didId=<did>`**: Fetch DID by DID ID
- **GET `/api/did/get?wallet=<address>`**: Fetch DID by wallet address
- **PATCH `/api/did/update`**: Update DID (add proof, add/remove wallet)

#### Integration in Dashboard

Your profile and dashboard display:
- **DID Badge**: Shows your DID with copy-to-clipboard
- **Proof Count**: Total verified proofs linked to your DID
- **Wallet Count**: Number of linked Ethereum addresses
- **IPFS Link**: Direct link to your DID document on IPFS
- **QR Code Button**: Generate scannable QR code for verification

#### Benefits

✅ **Portable Identity**: Your DID can be used across platforms  
✅ **Immutable History**: All proofs permanently linked to your identity  
✅ **Privacy-Preserving**: Only you control what's in your DID  
✅ **Verifiable**: Anyone can verify your identity and proofs  
✅ **Multi-Wallet**: Link multiple wallets to one identity  
✅ **Future-Proof**: Based on W3C DID standards

---

## 🏗️ Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Layer                   │
│  Next.js 15 + React 19 + TypeScript + Tailwind CSS  │
│         Framer Motion + shadcn/ui + Lucide          │
│              AuthContext + Firebase SDK             │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                   API Routes Layer                  │
│      Next.js API Routes (Serverless Functions)      │
│    /api/register-proof  /api/verify-proof           │
│    /api/user/*  /api/wallet/*  /api/get-proofs      │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬───────────┐
          ▼               ▼               ▼           ▼
┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐
│   Firebase  │  │  Blockchain  │  │    IPFS    │  │ Database │
│    Auth     │  │  (Sepolia)   │  │  (Pinata)  │  │(Supabase)│
│OAuth/Email  │  │  Ethers.js   │  │Content CID │  │  Prisma  │
└─────────────┘  └──────────────┘  └────────────┘  └──────────┘
```

### Smart Contract

```solidity
struct Proof {
    address creator;
    string promptHash;
    string outputHash;
    string modelInfo;
    string ipfsHash;
    uint256 timestamp;
}
```

**Key Functions:**
- `registerProof()` - Register new proof
- `getProofById()` - Retrieve proof by ID
- `getProofsByCreator()` - Get all proofs by wallet address

### Database Schema (Prisma)

```prisma
model User {
  id          String   @id @default(cuid())
  firebaseUid String   @unique
  email       String   @unique
  displayName String?
  photoURL    String?
  wallets     Wallet[]
  proofs      Proof[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Wallet {
  id        String   @id @default(cuid())
  address   String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  isPrimary Boolean  @default(false)
  label     String?
  createdAt DateTime @default(now())
}

model Proof {
  id         String   @id @default(cuid())
  proofId    String   @unique
  wallet     String
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  modelInfo  String
  promptHash String
  outputHash String
  promptCID  String
  outputCID  String
  outputType String   @default("text")
  txHash     String
  timestamp  DateTime @default(now())
  
  @@index([wallet])
  @@index([userId])
}
```

**Key Relationships:**

- **One User → Many Wallets**: Users can link multiple Ethereum addresses
- **One Wallet → One User**: Each wallet address can only belong to one user (enforced via `@unique`)
- **One User → Many Proofs**: All proofs are linked to the user account

### Authentication & Identity System

NeuraMark implements a **hybrid authentication model** combining Web2 and Web3 identity:

**Firebase Authentication (Web2):**

- Google OAuth sign-in
- Email/Password authentication
- Session management and token refresh
- User profile storage (name, email, photo)

**MetaMask Wallet Integration (Web3):**

- Ethereum address connection
- Transaction signing for proof registration
- Multi-wallet support per user account
- Cryptographic ownership verification

**Unified Account Badge:**

The navbar features an innovative merged component that displays both user identity and wallet status in one cohesive UI element:

- User avatar and display name
- Connected wallet address (truncated)
- Connection status indicator (animated pulse)
- Dropdown with wallet management and profile access
- Auto-linking: Connecting a wallet automatically links it to your account

**Security Rules:**

1. ✅ One user can link multiple wallet addresses
2. ❌ One wallet can only be linked to one user (database-enforced uniqueness)
3. 🔐 All API routes validate Firebase authentication via `x-firebase-uid` header
4. 🛡️ Wallet ownership validated through MetaMask connection

---

## 🛠️ Development

### Project Structure

```
NeuraMark/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── register/            # Proof registration
│   ├── dashboard/           # User dashboard
│   ├── explorer/            # Public proof explorer
│   ├── verify/              # Proof verification
│   ├── profile/             # User profile & wallet management
│   └── api/                 # API routes
│       ├── register-proof/  # Register proof endpoint
│       ├── verify-proof/    # Verify proof endpoint
│       ├── generate-certificate/  # PDF certificate generation
│       ├── user/create/     # Create user in database
│       └── wallet/          # Wallet management endpoints
├── components/              # React components
│   ├── Navbar.tsx           # Navigation with unified badge
│   ├── AuthModal.tsx        # Sign in/sign up modal
│   ├── UnifiedAccountBadge.tsx  # Merged profile + wallet
│   ├── ExplorerSearchBar.tsx    # Explorer search and filters
│   ├── ExplorerProofTable.tsx   # Explorer table with animations
│   ├── Footer.tsx
│   ├── GlassmorphicCard.tsx
│   └── ProofCard.tsx
├── contexts/                # React Context providers
│   └── AuthContext.tsx      # Firebase authentication state
├── lib/                     # Utilities
│   ├── firebase.ts          # Firebase auth functions
│   ├── ethersClient.ts      # Web3 interactions
│   ├── pinata.ts            # IPFS operations
│   ├── pdfGenerator.ts      # PDF certificate generation
│   ├── fetchProofs.ts       # Explorer data fetching
│   ├── prisma.ts            # Database queries
│   └── utils.ts             # Helper functions
├── prisma/                  # Database schema
│   └── schema.prisma        # User, Wallet, Proof models
├── public/                  # Static assets
└── hardhat-example/         # Smart contract development
    ├── contracts/
    ├── ignition/modules/
    └── test/
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open Prisma Studio GUI

# Smart Contract (in hardhat-example/)
npx hardhat compile      # Compile contracts
npx hardhat test         # Run tests
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## 🧪 Testing

### Run Unit Tests

```bash
cd hardhat-example
npm test
```

### Test Coverage

- Smart contract function coverage
- Registration flow end-to-end
- Verification logic
- IPFS upload/retrieval

### Manual Testing Checklist

**Authentication:**

- [ ] Sign in with Google OAuth
- [ ] Sign up with Email/Password
- [ ] Sign in with Email/Password
- [ ] Profile page loads correctly
- [ ] Sign out functionality

**Wallet Management:**

- [ ] Link first wallet (becomes Primary)
- [ ] Link multiple wallets to one account
- [ ] Unlink wallet with confirmation
- [ ] Wallet linking validation (duplicate wallet detection)
- [ ] Unified account badge displays correctly

**Proof Management:**

- [ ] Proof registration with transaction confirmation
- [ ] Dashboard displays user's registered proofs
- [ ] Search and filter functionality
- [ ] Proof verification by ID
- [ ] Certificate download (PDF with QR code)
- [ ] IPFS content retrieval
- [ ] Etherscan transaction links

**Public Explorer:**

- [ ] Explorer page loads with statistics
- [ ] Search filters by wallet/model/proof ID
- [ ] Model filter works correctly
- [ ] Type filter (Text/Image/Code) works
- [ ] Sort changes order (recent/oldest)
- [ ] Row expansion shows full details
- [ ] Copy buttons work with visual feedback
- [ ] QR code modal generates correctly
- [ ] Load more button fetches additional proofs
- [ ] Empty state shows when no proofs match filters

**UI/UX:**

- [ ] Glassmorphism design consistency
- [ ] Framer Motion animations
- [ ] Mobile responsiveness
- [ ] Unified account badge dropdown

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Update documentation for API changes
- Use conventional commits

---

## 📋 Roadmap

- [x] Core proof registration and verification
- [x] IPFS integration for decentralized storage
- [x] Dashboard with search and filters
- [x] Glassmorphism UI with animations
- [x] Hybrid authentication (Firebase + Web3)
- [x] Multi-wallet support and management
- [x] PDF certificate generation with QR codes
- [x] Public proof explorer with advanced search
- [x] Soulbound NFT certificates  
- [x] AI-powered originality scoring (Gemini API)
- [ ] ENS (Ethereum Name Service) integration
- [ ] Browser extension for quick proofing
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Batch certificate download

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Firebase** - For authentication infrastructure
- **Ethereum Foundation** - For blockchain infrastructure
- **Next.js Team** - For the amazing React framework
- **Pinata** - For IPFS pinning services
- **Supabase** - For PostgreSQL hosting
- **Alchemy** - For RPC infrastructure

---

## 📞 Support

- **Documentation**: [Full Documentation](./docs)
- **Issues**: [GitHub Issues](https://github.com/varunaditya27/NeuraMark/issues)
- **Discussions**: [GitHub Discussions](https://github.com/varunaditya27/NeuraMark/discussions)
- **Email**: varunaditya2706@gmail.com

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

**Built with ❤️ by [Varun Aditya](https://github.com/varunaditya27)**

[![GitHub stars](https://img.shields.io/github/stars/varunaditya27/NeuraMark?style=social)](https://github.com/varunaditya27/NeuraMark/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/varunaditya27/NeuraMark?style=social)](https://github.com/varunaditya27/NeuraMark/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/varunaditya27/NeuraMark?style=social)](https://github.com/varunaditya27/NeuraMark/watchers)

</div>