# NeuraMark - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- MetaMask wallet with Sepolia ETH
- Alchemy/Infura account (for RPC)

### Step 1: Install Dependencies (30 seconds)
```bash
cd hardhat-example
npm install
```

### Step 2: Configure Environment (2 minutes)
```bash
# Copy template
cp .env.example .env

# Edit .env and add:
# - SEPOLIA_RPC_URL (from Alchemy/Infura)
# - SEPOLIA_PRIVATE_KEY (from MetaMask)
```

### Step 3: Test Everything (1 minute)
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test test/NeuraMark.ts
```

Expected output:
```
✔ Should deploy successfully
✔ Should register a new proof successfully
✔ Should emit ProofRegistered event
... (14 tests passing)
```

### Step 4: Deploy to Sepolia (1 minute)
```bash
npx hardhat ignition deploy ignition/modules/NeuraMark.ts --network sepolia
```

Your contract address will be saved to `.env` automatically!

---

## 🎯 What You Got

### ✅ Smart Contract
- Deployed to Sepolia testnet
- Immutable proof storage
- Event emission for tracking
- Full input validation

### ✅ IPFS Integration
- Ready-to-use Pinata utilities
- Upload functions for text/JSON
- Retrieve functions for CIDs

### ✅ Database Setup
- Prisma schema configured
- PostgreSQL-ready
- Indexed for fast queries

### ✅ Frontend Utilities
- MetaMask connection
- Contract interaction functions
- Network switching helpers
- Event listeners

---

## 📝 Next: Integrate with Frontend

### In your Next.js app:

```typescript
// 1. Connect Wallet
import { connectWallet } from '@/hardhat-example/lib/ethersClient';
const address = await connectWallet();

// 2. Upload to IPFS
import { uploadToIPFS } from '@/hardhat-example/lib/pinata';
const promptCID = await uploadToIPFS(promptText, 'prompt.txt');
const outputCID = await uploadToIPFS(outputText, 'output.txt');

// 3. Generate Hashes
const promptHash = await crypto.subtle.digest('SHA-256', 
  new TextEncoder().encode(promptText)
).then(buf => '0x' + [...new Uint8Array(buf)].map(b => 
  b.toString(16).padStart(2, '0')
).join(''));

// 4. Register On-Chain
import { registerProof } from '@/hardhat-example/lib/ethersClient';
const result = await registerProof(
  promptHash,
  outputHash,
  modelInfo,
  promptCID,
  outputCID
);

// 5. Store in Database
import { storeProof } from '@/hardhat-example/lib/prisma';
await storeProof({
  proofId: result.proofId,
  wallet: address,
  modelInfo,
  promptHash,
  outputHash,
  promptCID,
  outputCID,
  txHash: result.txHash,
});
```

---

## 🔗 Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com
- **View Your Contract**: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
- **Pinata Dashboard**: https://app.pinata.cloud
- **Alchemy Dashboard**: https://dashboard.alchemy.com

---

## 🆘 Common Issues

### "Gas estimation failed"
→ Get more Sepolia ETH from faucet

### "Contract not found"
→ Run: `npx hardhat compile`

### "Network not found"
→ Switch MetaMask to Sepolia testnet

### "Prisma error"
→ Run: `npx prisma generate`

---

## 📚 Full Documentation

See `README.md` and `IMPLEMENTATION_SUMMARY.md` for complete details.

---

**Ready to build! 🚀**
