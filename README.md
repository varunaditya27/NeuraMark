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
- **⛓️ Blockchain-Backed**: Immutable proof stored on Ethereum (Sepolia)
- **📦 IPFS Storage**: Decentralized content storage via Pinata
- **🎨 Modern UI**: Glassmorphism design with Framer Motion animations
- **� Hybrid Authentication**: Firebase Auth (Google OAuth + Email/Password) + Web3 wallets
- **💼 Multi-Wallet Support**: Link multiple Ethereum addresses to one account
- **🔗 Unified Account Badge**: Innovative UI merging profile and wallet status
- **🔍 Public Verification**: Anyone can verify registered proofs

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **👤 User Authentication** | Sign in with Google OAuth or Email/Password via Firebase |
| **💼 Multi-Wallet Management** | Link and manage multiple Ethereum addresses per account |
| **🎭 Proof Registration** | Register AI prompts, outputs, and model metadata with cryptographic hashing |
| **✅ Proof Verification** | Verify any registered proof using proof ID or content hash |
| **📊 Dashboard** | View all your registered proofs with search, filter, and sort capabilities |
| **👤 Profile Management** | Manage account settings, linked wallets, and user preferences |
| **🌐 IPFS Integration** | Decentralized content storage with permanent CID references |
| **🔗 Blockchain Tracking** | View transaction details on Etherscan |

### Technical Features

- **Hybrid Authentication**: Firebase Auth for Web2 + MetaMask for Web3 identity
- **Smart Contract**: Solidity-based proof registry on Sepolia testnet
- **Database**: PostgreSQL (Supabase) with Prisma ORM for user and proof data
- **Multi-Wallet Architecture**: One user account can link multiple Ethereum addresses
- **Wallet Linking Rules**: Enforced one-to-one mapping (one wallet = one user only)
- **Hash Generation**: Client-side SHA-256 hashing via Web Crypto API
- **Gas Optimization**: Minimal on-chain storage to reduce costs
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

---

## 🚀 Demo

### Live Application

🌐 **Frontend**: [Your deployed URL here]  
⚙️ **Smart Contract**: [`0xe11b27FAfE1D18a2d9F1ab36314f84D47326A795`](https://sepolia.etherscan.io/address/0xe11b27FAfE1D18a2d9F1ab36314f84D47326A795)  
🔗 **Network**: Sepolia Testnet

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
```

### Get Your Credentials

1. **Firebase**: [https://console.firebase.google.com](https://console.firebase.google.com) - Create project, enable Authentication (Google + Email/Password)
2. **Supabase**: [https://supabase.com](https://supabase.com) - Create project and get database URL
3. **Pinata**: [https://pinata.cloud](https://pinata.cloud) - Sign up and get API keys
4. **Alchemy**: [https://alchemy.com](https://alchemy.com) - Create app for Sepolia network
5. **Etherscan**: [https://etherscan.io/apis](https://etherscan.io/apis) - Get API key for contract verification

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

1. **Enter AI Prompt**: The prompt you used to generate content
2. **Enter AI Output**: The generated content from the AI model
3. **Specify Model**: Model name (e.g., GPT-4, Claude 3, DALL-E)
4. **Submit**: Approve MetaMask transaction (small gas fee)

The system will:

- Hash your prompt and output (SHA-256)
- Upload content to IPFS
- Register proof on blockchain
- Store metadata in database (linked to your user account)

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

### 6. Verify a Proof

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
│   ├── verify/              # Proof verification
│   ├── profile/             # User profile & wallet management
│   └── api/                 # API routes
│       ├── register-proof/  # Register proof endpoint
│       ├── verify-proof/    # Verify proof endpoint
│       ├── user/create/     # Create user in database
│       └── wallet/          # Wallet management endpoints
├── components/              # React components
│   ├── Navbar.tsx           # Navigation with unified badge
│   ├── AuthModal.tsx        # Sign in/sign up modal
│   ├── UnifiedAccountBadge.tsx  # Merged profile + wallet
│   ├── Footer.tsx
│   ├── GlassmorphicCard.tsx
│   └── ProofCard.tsx
├── contexts/                # React Context providers
│   └── AuthContext.tsx      # Firebase authentication state
├── lib/                     # Utilities
│   ├── firebase.ts          # Firebase auth functions
│   ├── ethersClient.ts      # Web3 interactions
│   ├── pinata.ts            # IPFS operations
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
- [ ] IPFS content retrieval
- [ ] Etherscan transaction links

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
- [ ] Soulbound NFT certificates
- [ ] AI-based originality scoring
- [ ] ENS/DID integration
- [ ] Browser extension for quick proofing
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Proof export as verifiable PDF

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