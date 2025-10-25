# NeuraMark Features

NeuraMark is packed with features designed to provide a comprehensive solution for AI content authorship and verification.

## Core Functionality

| Feature                  | Description                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| **User Authentication**  | Sign in with Google OAuth or Email/Password via Firebase.                                           |
| **Decentralized Identity (DID)** | Auto-generated DID linking Web2 account + Web3 wallets + all proofs.                               |
| **Multi-Wallet Management**  | Link and manage multiple Ethereum addresses per account.                                            |
| **Proof Registration**   | Register AI prompts, outputs, and model metadata with cryptographic hashing.                        |
| **Authorship NFTs**      | Automatically mint soulbound ERC-721 tokens for each registered proof.                              |
| **Verifiable Credentials** | Issue W3C-compliant VCs for portable, platform-independent proof verification.                  |
| **Proof Verification**   | Verify any registered proof using proof ID or content hash.                                         |
| **DID Verification**     | Public verification of decentralized identities via DID or wallet address.                          |
| **VC Verification**      | Upload and verify W3C Verifiable Credentials from any source.                                       |
| **Public Proof Explorer**| Browse all registered proofs with advanced search and filters.                                      |
| **Dashboard**            | View all your registered proofs with search, filter, and sort capabilities.                         |
| **Profile Management**   | Manage account settings, linked wallets, and user preferences.                                      |
| **Certificate Generation**| Download professional PDF certificates with QR codes for any proof.                                 |
| **IPFS Integration**     | Decentralized content storage with permanent CID references.                                        |
| **Blockchain Tracking**  | View transaction details on Etherscan.                                                              |
| **AI Originality Analysis** | Gemini AI compares proofs and generates a 0-100% uniqueness score.                                 |
| **Semantic Search**      | Find similar proofs using natural language queries via ChromaDB + Jina AI.                          |
| **ENS Name Resolution**  | Display human-readable ENS names (e.g., vitalik.eth) instead of addresses.                          |

## Technical Features

- **Hybrid Authentication**: Firebase Auth for Web2 + MetaMask for Web3 identity.
- **Smart Contracts**: Two Solidity contracts on Sepolia (NeuraMark proof registry + AuthorshipToken NFTs).
- **DID System**: W3C DID Core v1.0 compliant with IPFS-backed immutable documents.
- **Verifiable Credentials**: W3C VC Data Model v1.1 with Ed25519 cryptographic signatures.
- **Database**: PostgreSQL (Supabase) with Prisma ORM for users, wallets, proofs, DIDs, and VCs.
- **Multi-Wallet Architecture**: One user account can link multiple Ethereum addresses.
- **Wallet Linking Rules**: Enforced one-to-one mapping (one wallet = one user only).
- **ENS Resolution**: Automatic ENS name lookup with 1-hour caching for user-friendly address display.
- **Hash Generation**: Client-side SHA-256 hashing via Web Crypto API for privacy.
- **Gas Optimization**: Minimal on-chain storage to reduce costs.
- **Type Safety**: Full TypeScript implementation with strict mode.
- **Responsive Design**: Mobile-first approach with Tailwind CSS and glassmorphism.