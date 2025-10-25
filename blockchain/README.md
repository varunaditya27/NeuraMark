# NeuraMark - Blockchain Backend# Sample Hardhat 3 Beta Project (`node:test` and `viem`)



Complete blockchain infrastructure for the NeuraMark proof-of-prompt authorship verification system.This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.



## 🏗️ ArchitectureTo learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.



### Smart Contract## Project Overview

- **Contract Name**: `NeuraMark.sol`

- **Version**: Solidity ^0.8.20This example project includes:

- **Network**: Sepolia Testnet (Ethereum)

- **Purpose**: Immutable on-chain storage of AI content proof metadata- A simple Hardhat configuration file.

- Foundry-compatible Solidity unit tests.

### Tech Stack- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).

- **Blockchain Framework**: Hardhat v3.0+- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

- **Web3 Library**: Ethers.js v6 + Viem

- **Storage**: IPFS (via Pinata)## Usage

- **Database**: Supabase PostgreSQL + Prisma ORM

- **Testing**: Node.js Test Runner + Hardhat Viem### Running Tests



---To run all the tests in the project, execute the following command:



## 📁 Project Structure```shell

npx hardhat test

``````

hardhat-example/

├── contracts/You can also selectively run the Solidity or `node:test` tests:

│   ├── NeuraMark.sol          # Main smart contract

│   └── Counter.sol             # Example contract```shell

├── test/npx hardhat test solidity

│   ├── NeuraMark.ts            # Contract testsnpx hardhat test nodejs

│   └── Counter.ts              # Example tests```

├── scripts/

│   └── deploy.ts               # Deployment script### Make a deployment to Sepolia

├── ignition/

│   └── modules/This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

│       └── NeuraMark.ts        # Hardhat Ignition module

├── lib/To run the deployment to a local chain:

│   ├── ethersClient.ts         # Frontend Web3 utilities

│   ├── pinata.ts               # IPFS upload utilities```shell

│   └── prisma.ts               # Database utilitiesnpx hardhat ignition deploy ignition/modules/Counter.ts

├── prisma/```

│   └── schema.prisma           # Database schema

├── hardhat.config.ts           # Hardhat configurationTo run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

├── .env                        # Environment variables

└── README.md                   # This fileYou can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

```

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

---

```shell

## 🚀 Quick Startnpx hardhat keystore set SEPOLIA_PRIVATE_KEY

```

### 1. Install Dependencies

After setting the variable, you can run the deployment with the Sepolia network:

```bash

cd hardhat-example```shell

npm installnpx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts

``````


### 2. Setup Environment Variables

Create a `.env` file:

```env
# Sepolia Network
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here

# IPFS (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
# OR use JWT (recommended)
PINATA_JWT=your_pinata_jwt_token

# Supabase Database
SUPABASE_DB_URL=postgresql://user:password@host:port/database

# Etherscan (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Address (auto-populated after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Run Tests

```bash
# Run all tests
npx hardhat test

# Run only NeuraMark tests
npx hardhat test test/NeuraMark.ts

# Run only Node.js tests
npx hardhat test nodejs
```

### 5. Deploy to Sepolia

```bash
# Using Hardhat Ignition
npx hardhat ignition deploy ignition/modules/NeuraMark.ts --network sepolia

# OR using the deploy script
npx ts-node scripts/deploy.ts
```

### 6. Initialize Prisma Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Open Prisma Studio (DB GUI)
npx prisma studio
```

---

## 📜 Smart Contract API

### Struct: Proof

```solidity
struct Proof {
    address creator;      // Wallet address of the creator
    string promptHash;    // SHA-256 hash of the prompt
    string outputHash;    // SHA-256 hash of the AI output
    string modelInfo;     // AI model information (e.g., "GPT-4")
    string promptCID;     // IPFS CID for prompt content
    string outputCID;     // IPFS CID for output content
    uint256 timestamp;    // Block timestamp of registration
}
```

### Functions

#### `registerProof`
```solidity
function registerProof(
    string memory promptHash,
    string memory outputHash,
    string memory modelInfo,
    string memory promptCID,
    string memory outputCID
) public returns (bytes32)
```
Registers a new proof on-chain. Returns the unique `proofId`.

**Requirements:**
- All parameters must be non-empty
- Proof must not already exist

**Emits:** `ProofRegistered` event

---

#### `verifyProof`
```solidity
function verifyProof(bytes32 proofId) public view returns (Proof memory)
```
Retrieves proof details by `proofId`.

**Reverts:** If proof doesn't exist

---

#### `getProofId`
```solidity
function getProofId(
    string memory promptHash,
    string memory outputHash,
    address creator
) public pure returns (bytes32)
```
Calculates the unique proof ID for given parameters.

---

#### `isProofRegistered`
```solidity
function isProofRegistered(bytes32 proofId) public view returns (bool)
```
Checks if a proof exists.

---

#### `getProofByHashes`
```solidity
function getProofByHashes(
    string memory promptHash,
    string memory outputHash,
    address creator
) public view returns (Proof memory)
```
Retrieves proof by providing hashes and creator address.

---

## 🔧 Utility Libraries

### `lib/ethersClient.ts`

Frontend utilities for interacting with the smart contract via MetaMask.

```typescript
import { connectWallet, registerProof, verifyProof } from './lib/ethersClient';

// Connect wallet
const address = await connectWallet();

// Register proof
const result = await registerProof(
  promptHash,
  outputHash,
  "GPT-4",
  "ipfs://QmPrompt...",
  "ipfs://QmOutput..."
);

// Verify proof
const proof = await verifyProof(result.proofId);
```

### `lib/pinata.ts`

IPFS utilities for uploading content to Pinata.

```typescript
import { uploadToIPFS, uploadJSONToIPFS } from './lib/pinata';

// Upload text content
const cid = await uploadToIPFS("Your prompt text", "prompt.txt");

// Upload JSON data
const jsonCid = await uploadJSONToIPFS(
  { prompt: "...", output: "..." },
  "proof-data.json"
);
```

### `lib/prisma.ts`

Database utilities for storing and querying proof metadata.

```typescript
import { storeProof, getProofById, getProofsByWallet } from './lib/prisma';

// Store proof in database
await storeProof({
  proofId: "0x...",
  wallet: "0x...",
  modelInfo: "GPT-4",
  promptHash: "0x...",
  outputHash: "0x...",
  promptCID: "ipfs://...",
  outputCID: "ipfs://...",
  txHash: "0x...",
});

// Get all proofs for a wallet
const proofs = await getProofsByWallet("0x...");
```

---

## 🧪 Testing

### Test Coverage

- ✅ Contract deployment
- ✅ Proof registration
- ✅ Event emission
- ✅ ProofId calculation
- ✅ Input validation (empty fields)
- ✅ Duplicate prevention
- ✅ Proof verification
- ✅ Multi-user scenarios

### Running Tests

```bash
# All tests
npx hardhat test

# Watch mode
npx hardhat test --watch

# With gas reporting
REPORT_GAS=true npx hardhat test
```

---

## 🌐 Network Configuration

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC URL**: Get from [Alchemy](https://alchemy.com) or [Infura](https://infura.io)
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com
  - https://faucet.quicknode.com/ethereum/sepolia

---

## 🔐 Security Best Practices

1. **Never commit `.env` to version control**
2. **Use environment variables for all sensitive data**
3. **Only store hashes and CIDs on-chain, never raw content**
4. **Validate all user inputs before hashing**
5. **Use MetaMask for wallet management**
6. **Encrypt sensitive IPFS content if needed**

---

## 📊 Database Schema

```prisma
model Proof {
  id          String   @id @default(cuid())
  proofId     String   @unique
  wallet      String
  modelInfo   String
  promptHash  String
  outputHash  String
  promptCID   String
  outputCID   String
  txHash      String
  createdAt   DateTime @default(now())

  @@index([wallet])
  @@index([proofId])
  @@index([createdAt])
}
```

---

## 🎯 Deployment Checklist

- [x] Setup Sepolia RPC URL (Alchemy/Infura)
- [x] Get Sepolia ETH from faucet
- [x] Configure MetaMask private key
- [ ] Setup Pinata API credentials
- [ ] Configure Supabase database URL
- [x] Compile contracts
- [x] Run tests
- [x] Deploy contract to Sepolia
- [ ] Verify contract on Etherscan (optional)
- [ ] Initialize Prisma database
- [ ] Update frontend with contract address

---

## 🛠️ Troubleshooting

### Gas Estimation Failed
- **Cause**: Insufficient Sepolia ETH
- **Solution**: Get more ETH from a faucet

### Compilation Errors
- **Cause**: Solidity version mismatch
- **Solution**: Check `hardhat.config.ts` compiler versions

### Test Failures
- **Cause**: Network connection issues
- **Solution**: Check RPC URL and network status

### IPFS Upload Fails
- **Cause**: Invalid Pinata credentials
- **Solution**: Verify API keys in `.env`

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Viem Documentation](https://viem.sh)
- [Pinata IPFS Docs](https://docs.pinata.cloud)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Sepolia Testnet Info](https://sepolia.dev)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests
4. Submit a pull request

---

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review test files for usage examples

---

**Built with ❤️ for the NeuraMark Platform**
