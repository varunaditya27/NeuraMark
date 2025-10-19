import { ethers, BrowserProvider, Contract, Signer, InterfaceAbi } from "ethers";

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

// This will be populated after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Import the contract ABI after compilation
// The ABI will be available after running: npx hardhat compile
let contractABI: InterfaceAbi = [];

try {
  // This import will work after contract compilation
  // eslint-disable-next-line
  const artifact = require("../artifacts/contracts/NeuraMark.sol/NeuraMark.json");
  contractABI = artifact.abi as InterfaceAbi;
} catch {
  console.warn("⚠️ Contract ABI not found. Please compile contracts first.");
}

interface ProofData {
  creator: string;
  promptHash: string;
  outputHash: string;
  modelInfo: string;
  promptCID: string;
  outputCID: string;
  timestamp: number;
}

interface RegisterProofResult {
  proofId: string;
  txHash: string;
  receipt: unknown;
}

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum && window.ethereum.isMetaMask);
};

/**
 * Get Ethereum provider
 */
export const getProvider = (): BrowserProvider => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  if (!window.ethereum) {
    throw new Error("Ethereum provider not found");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Get signer (connected wallet)
 */
export const getSigner = async (): Promise<Signer> => {
  const provider = getProvider();
  return await provider.getSigner();
};

/**
 * Request account access (connect wallet)
 */
export const connectWallet = async (): Promise<string> => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this feature.");
    }

    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock MetaMask.");
    }

    console.log("✅ Wallet connected:", accounts[0]);
    return accounts[0];
  } catch (error) {
    console.error("❌ Error connecting wallet:", error);
    throw error;
  }
};

/**
 * Get connected account address
 */
export const getAccount = async (): Promise<string> => {
  try {
    const signer = await getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error("❌ Error getting account:", error);
    throw error;
  }
};

/**
 * Get account balance in ETH
 */
export const getBalance = async (address?: string): Promise<string> => {
  try {
    const provider = getProvider();
    const accountAddress = address || (await getAccount());
    const balance = await provider.getBalance(accountAddress);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("❌ Error getting balance:", error);
    throw error;
  }
};

/**
 * Get NeuraMark contract instance
 */
export const getContract = async (): Promise<Contract> => {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not found. Please deploy the contract first.");
  }

  if (!contractABI || contractABI.length === 0) {
    throw new Error("Contract ABI not found. Please compile the contract first.");
  }

  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
};

/**
 * Register a new proof on-chain
 */
export const registerProof = async (
  promptHash: string,
  outputHash: string,
  modelInfo: string,
  promptCID: string,
  outputCID: string
): Promise<RegisterProofResult> => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const signerAddress = await signer.getAddress();

    console.log("📝 Registering proof on-chain...");

    // Call the contract function
    const tx = await contract.registerProof(
      promptHash,
      outputHash,
      modelInfo,
      promptCID,
      outputCID
    );

    console.log("⏳ Transaction submitted:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    console.log("✅ Proof registered successfully!");

    // Calculate proofId (same as contract does)
    const proofId = ethers.keccak256(
      ethers.solidityPacked(
        ["string", "string", "address"],
        [promptHash, outputHash, signerAddress]
      )
    );

    return {
      proofId,
      txHash: receipt.hash,
      receipt,
    };
  } catch (error) {
    console.error("❌ Error registering proof:", error);
    throw error;
  }
};

/**
 * Verify a proof on-chain
 */
export const verifyProof = async (proofId: string): Promise<ProofData> => {
  try {
    const contract = await getContract();
    console.log("🔍 Verifying proof:", proofId);

    const proof = await contract.verifyProof(proofId);

    console.log("✅ Proof verified:", proof);

    return {
      creator: proof.creator,
      promptHash: proof.promptHash,
      outputHash: proof.outputHash,
      modelInfo: proof.modelInfo,
      promptCID: proof.promptCID,
      outputCID: proof.outputCID,
      timestamp: Number(proof.timestamp),
    };
  } catch (error) {
    console.error("❌ Error verifying proof:", error);
    throw error;
  }
};

/**
 * Check if a proof is registered
 */
export const isProofRegistered = async (proofId: string): Promise<boolean> => {
  try {
    const contract = await getContract();
    return await contract.isProofRegistered(proofId);
  } catch (error) {
    console.error("❌ Error checking proof registration:", error);
    throw error;
  }
};

/**
 * Get proof ID from hashes
 */
export const getProofId = async (
  promptHash: string,
  outputHash: string,
  creatorAddress?: string
): Promise<string> => {
  try {
    const creator = creatorAddress || (await getAccount());
    const contract = await getContract();
    return await contract.getProofId(promptHash, outputHash, creator);
  } catch (error) {
    console.error("❌ Error getting proof ID:", error);
    throw error;
  }
};

/**
 * Get current network information
 */
export const getNetworkInfo = async (): Promise<{
  chainId: number;
  name: string;
}> => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  } catch (error) {
    console.error("❌ Error getting network info:", error);
    throw error;
  }
};

/**
 * Switch to Sepolia network
 */
export const switchToSepolia = async (): Promise<void> => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // Sepolia chainId in hex
    });

    console.log("✅ Switched to Sepolia network");
  } catch (error: unknown) {
    // If the network hasn't been added to MetaMask
    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: number }).code : null;
    if (errorCode === 4902) {
      try {
        if (!window.ethereum) throw new Error("Ethereum provider not found");
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Test Network",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } catch (addError) {
        console.error("❌ Error adding Sepolia network:", addError);
        throw addError;
      }
    } else {
      console.error("❌ Error switching to Sepolia:", error);
      throw error;
    }
  }
};

/**
 * Listen for account changes
 */
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (typeof window !== "undefined" && window.ethereum) {
    window.ethereum.on("accountsChanged", (...args: unknown[]) => {
      callback(args as string[]);
    });
  }
};

/**
 * Listen for network changes
 */
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (typeof window !== "undefined" && window.ethereum) {
    window.ethereum.on("chainChanged", (...args: unknown[]) => {
      callback(args[0] as string);
    });
  }
};
