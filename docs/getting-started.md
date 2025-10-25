# Getting Started with NeuraMark

This guide will walk you through the process of setting up the NeuraMark project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**, **yarn**, or **pnpm**
- **MetaMask**: Browser extension for wallet management
- **Sepolia ETH**: Testnet Ether for transactions. You can get some from a [Sepolia Faucet](https://sepoliafaucet.com/).

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/varunaditya27/NeuraMark.git
    cd NeuraMark
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file by copying the example file:

    ```bash
    cp .env.local.example .env.local
    ```

    Then, edit the `.env.local` file with your actual credentials for the services listed.

4.  **Initialize the database:**

    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

5.  **Start the development server:**

    ```bash
    npm run dev
    ```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Configuration

Your `.env.local` file is crucial for connecting to the various services NeuraMark relies on. Below is a breakdown of the required variables.

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

# Jina AI (for semantic embeddings)
JINA_API_KEY=your_jina_api_key

# ChromaDB (for vector storage)
CHROMA_DB_API_KEY=your_chromadb_api_key
CHROMA_DB_TENANT_ID=your_tenant_id
CHROMA_DB_DATABASE_NAME=your_database_name
```

### Obtaining Credentials

- **Firebase**: Create a project at [https://console.firebase.google.com](https://console.firebase.google.com).
- **Supabase**: Create a project at [https://supabase.com](https://supabase.com).
- **Pinata**: Get API keys at [https://pinata.cloud](https://pinata.cloud).
- **Alchemy**: Create an app for the Sepolia network at [https://alchemy.com](https://alchemy.com).
- **Etherscan**: Get an API key at [https://etherscan.io/apis](https://etherscan.io/apis).
- **Gemini AI**: Get an API key at [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey).
- **Jina AI**: Get an API key at [https://jina.ai](https://jina.ai).
- **ChromaDB**: Create a hosted instance at [https://trychroma.com](https://trychroma.com).