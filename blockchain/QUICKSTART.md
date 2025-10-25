# Blockchain Backend Quick Start

This guide provides a fast path for developers to get the NeuraMark blockchain backend up and running. For a more comprehensive understanding of the smart contracts and their functions, please see the [main `README.md`](./README.md).

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 18+
- MetaMask wallet with Sepolia ETH
- An RPC URL from a service like [Alchemy](https://alchemy.com) or [Infura](https://infura.io)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Then, edit the `.env` file and add your:
- `SEPOLIA_RPC_URL` (from Alchemy or Infura)
- `SEPOLIA_PRIVATE_KEY` (from MetaMask)

### Step 3: Compile and Test
```bash
# Compile the smart contracts
npx hardhat compile

# Run the test suite
npx hardhat test
```

### Step 4: Deploy to Sepolia
```bash
npx hardhat ignition deploy ignition/modules/NeuraMark.ts --network sepolia
```
The deployed contract address will be printed in your console.

## 🚀 Next Steps

With the smart contracts deployed, you can now begin interacting with them from your client application. Refer to the **Client-Side Interaction (`ethers.js`)** section in the [main `README.md`](./README.md) for code examples on how to:

- Connect to the contract
- Register a proof
- Verify a proof

## 🔗 Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com
- **Etherscan**: https://sepolia.etherscan.io
- **Hardhat Documentation**: https://hardhat.org/
