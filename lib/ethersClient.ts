import { ethers, BrowserProvider, Contract, Signer, InterfaceAbi } from "ethers";
import { CONTRACT_ADDRESS } from "./config";

// Contract ABI
const contractABI: InterfaceAbi = [
  "function registerProof(string promptHash, string outputHash, string modelInfo, string promptCID, string outputCID) external returns (bytes32)",
  "function verifyProof(bytes32 proofId) external view returns (tuple(address creator, string promptHash, string outputHash, string modelInfo, string promptCID, string outputCID, uint256 timestamp))",
  "function isProofRegistered(bytes32 proofId) external view returns (bool)",
  "function getProofId(string promptHash, string outputHash, address creator) external pure returns (bytes32)",
  "function getProofByHashes(string promptHash, string outputHash, address creator) external view returns (tuple(address creator, string promptHash, string outputHash, string modelInfo, string promptCID, string outputCID, uint256 timestamp))",
  "event ProofRegistered(bytes32 indexed proofId, address indexed creator, string modelInfo, uint256 timestamp)"
];

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export interface ProofData {
  creator: string;
  promptHash: string;
  outputHash: string;
  modelInfo: string;
  promptCID: string;
  outputCID: string;
  timestamp: number;
}

export interface RegisterProofResult {
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

    // Check if MetaMask is locked
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: "eth_accounts" 
        }) as string[];
        
        // If no accounts returned, MetaMask is locked or no accounts connected
        if (accounts.length === 0) {
          console.log("📝 No accounts found, requesting connection...");
        }
      } catch (err) {
        console.error("Error checking accounts:", err);
      }
    }

    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock MetaMask and try again.");
    }

    console.log("✅ Wallet connected:", accounts[0]);
    return accounts[0];
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    console.error("❌ Error connecting wallet:", error);
    
    // Provide more specific error messages
    if (err.code === 4001) {
      throw new Error("Connection request was rejected. Please approve the connection in MetaMask.");
    } else if (err.code === -32002) {
      throw new Error("Connection request already pending. Please check MetaMask.");
    } else if (err.message?.toLowerCase().includes("user rejected")) {
      throw new Error("Connection request was rejected by user.");
    }
    
    throw error;
  }
};

/**
 * Get connected account address
 * @throws Error if no account is connected or MetaMask is locked
 */
export const getAccount = async (): Promise<string> => {
  try {
    // First check if any accounts are available
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ 
        method: "eth_accounts" 
      }) as string[];
      
      if (accounts.length === 0) {
        throw new Error("No accounts connected. Please connect your wallet.");
      }
      
      return accounts[0];
    }
    
    // Fallback to provider method
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
    throw new Error("Contract address not found. Please check your environment variables.");
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
              rpcUrls: ["https://ethereum-sepolia.publicnode.com"],
              blockExplorerUrls: ["https://sepolia.etherscan.io/"],
            },
          ],
        });
        console.log("✅ Sepolia network added");
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
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts: unknown) => {
      callback(accounts as string[]);
    });
  }
};

/**
 * Listen for chain changes
 */
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (window.ethereum) {
    window.ethereum.on("chainChanged", (chainId: unknown) => {
      callback(chainId as string);
    });
  }
};

/**
 * Remove account change listener
 */
export const removeAccountsChangedListener = (callback: (accounts: string[]) => void): void => {
  if (window.ethereum) {
    window.ethereum.removeListener("accountsChanged", (accounts: unknown) => {
      callback(accounts as string[]);
    });
  }
};

/**
 * Remove chain change listener
 */
export const removeChainChangedListener = (callback: (chainId: string) => void): void => {
  if (window.ethereum) {
    window.ethereum.removeListener("chainChanged", (chainId: unknown) => {
      callback(chainId as string);
    });
  }
};

/**
 * Format address for display (0x1234...5678)
 */
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Hash text using keccak256
 */
export const hashText = (text: string): string => {
  return ethers.keccak256(ethers.toUtf8Bytes(text));
};
