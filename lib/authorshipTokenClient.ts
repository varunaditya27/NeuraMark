/**
 * AuthorshipToken Contract Client
 * 
 * Utilities for interacting with the soulbound NFT contract.
 */

import { ethers, BrowserProvider, Contract, Signer } from "ethers";

// AuthorshipToken Contract ABI (minimal - only functions we need)
const AUTHORSHIP_TOKEN_ABI = [
  "function mintAuthorshipToken(address to, string promptHash, string outputHash, string ipfsCID, string modelInfo) external returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getProofData(uint256 tokenId) external view returns (tuple(string promptHash, string outputHash, string ipfsCID, string modelInfo, uint256 timestamp, address creator))",
  "function getTokensByCreator(address creator) external view returns (uint256[])",
  "function totalSupply() external view returns (uint256)",
  "function exists(uint256 tokenId) external view returns (bool)",
  "event AuthorshipMinted(address indexed to, uint256 indexed tokenId, string ipfsCID, string modelInfo, uint256 timestamp)"
];

// Contract address (update after deployment)
export const AUTHORSHIP_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_AUTHORSHIP_TOKEN_ADDRESS || "";

/**
 * Mint a new authorship token
 * 
 * @param signer Ethereum signer (connected wallet)
 * @param to Recipient address (proof creator)
 * @param promptHash SHA-256 hash of the prompt
 * @param outputHash SHA-256 hash of the output
 * @param ipfsCID IPFS CID for content storage
 * @param modelInfo AI model information
 * @returns Transaction result with token ID
 */
export async function mintAuthorshipToken(
  signer: Signer,
  to: string,
  promptHash: string,
  outputHash: string,
  ipfsCID: string,
  modelInfo: string
): Promise<{ tokenId: string; txHash: string; receipt: ethers.TransactionReceipt }> {
  try {
    if (!AUTHORSHIP_TOKEN_ADDRESS) {
      throw new Error("AuthorshipToken contract address not configured");
    }

    // Create contract instance
    const contract = new Contract(AUTHORSHIP_TOKEN_ADDRESS, AUTHORSHIP_TOKEN_ABI, signer);

    console.log("🎨 Minting Authorship Token...");
    console.log("  To:", to);
    console.log("  IPFS CID:", ipfsCID);
    console.log("  Model:", modelInfo);

    // Call mint function
    const tx = await contract.mintAuthorshipToken(to, promptHash, outputHash, ipfsCID, modelInfo);
    console.log("  Transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("  ✅ Transaction confirmed!");

    // Extract token ID from events
    let tokenId = "0";
    if (receipt && receipt.logs) {
      // Find AuthorshipMinted event
      const iface = new ethers.Interface(AUTHORSHIP_TOKEN_ABI);
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "AuthorshipMinted") {
            tokenId = parsed.args[1].toString(); // args[1] is tokenId
            break;
          }
        } catch (e) {
          // Not our event, skip
          continue;
        }
      }
    }

    return {
      tokenId,
      txHash: tx.hash,
      receipt,
    };
  } catch (error) {
    console.error("❌ Error minting authorship token:", error);
    throw error;
  }
}

/**
 * Get all tokens owned by a creator
 * 
 * @param creator Wallet address
 * @returns Array of token IDs
 */
export async function getTokensByCreator(creator: string): Promise<string[]> {
  try {
    if (!AUTHORSHIP_TOKEN_ADDRESS) {
      throw new Error("AuthorshipToken contract address not configured");
    }

    const provider = new BrowserProvider(window.ethereum!);
    const contract = new Contract(AUTHORSHIP_TOKEN_ADDRESS, AUTHORSHIP_TOKEN_ABI, provider);

    const tokenIds = await contract.getTokensByCreator(creator);
    return tokenIds.map((id: bigint) => id.toString());
  } catch (error) {
    console.error("❌ Error fetching creator tokens:", error);
    return [];
  }
}

/**
 * Get proof data for a specific token
 * 
 * @param tokenId Token ID
 * @returns Proof data struct
 */
export async function getTokenProofData(tokenId: string): Promise<{
  promptHash: string;
  outputHash: string;
  ipfsCID: string;
  modelInfo: string;
  timestamp: number;
  creator: string;
} | null> {
  try {
    if (!AUTHORSHIP_TOKEN_ADDRESS) {
      throw new Error("AuthorshipToken contract address not configured");
    }

    const provider = new BrowserProvider(window.ethereum!);
    const contract = new Contract(AUTHORSHIP_TOKEN_ADDRESS, AUTHORSHIP_TOKEN_ABI, provider);

    const exists = await contract.exists(tokenId);
    if (!exists) {
      return null;
    }

    const proofData = await contract.getProofData(tokenId);
    
    return {
      promptHash: proofData[0],
      outputHash: proofData[1],
      ipfsCID: proofData[2],
      modelInfo: proofData[3],
      timestamp: Number(proofData[4]),
      creator: proofData[5],
    };
  } catch (error) {
    console.error("❌ Error fetching token proof data:", error);
    return null;
  }
}

/**
 * Get token metadata URI
 * 
 * @param tokenId Token ID
 * @returns Metadata URI
 */
export async function getTokenURI(tokenId: string): Promise<string | null> {
  try {
    if (!AUTHORSHIP_TOKEN_ADDRESS) {
      throw new Error("AuthorshipToken contract address not configured");
    }

    const provider = new BrowserProvider(window.ethereum!);
    const contract = new Contract(AUTHORSHIP_TOKEN_ADDRESS, AUTHORSHIP_TOKEN_ABI, provider);

    const uri = await contract.tokenURI(tokenId);
    return uri;
  } catch (error) {
    console.error("❌ Error fetching token URI:", error);
    return null;
  }
}

/**
 * Check if a token exists
 * 
 * @param tokenId Token ID
 * @returns True if token exists
 */
export async function tokenExists(tokenId: string): Promise<boolean> {
  try {
    if (!AUTHORSHIP_TOKEN_ADDRESS) {
      return false;
    }

    const provider = new BrowserProvider(window.ethereum!);
    const contract = new Contract(AUTHORSHIP_TOKEN_ADDRESS, AUTHORSHIP_TOKEN_ABI, provider);

    return await contract.exists(tokenId);
  } catch (error) {
    console.error("❌ Error checking token existence:", error);
    return false;
  }
}

/**
 * Get total number of tokens minted
 * 
 * @returns Total supply
 */
export async function getTotalSupply(): Promise<number> {
  try {
    if (!AUTHORSHIP_TOKEN_ADDRESS) {
      return 0;
    }

    const provider = new BrowserProvider(window.ethereum!);
    const contract = new Contract(AUTHORSHIP_TOKEN_ADDRESS, AUTHORSHIP_TOKEN_ABI, provider);

    const supply = await contract.totalSupply();
    return Number(supply);
  } catch (error) {
    console.error("❌ Error fetching total supply:", error);
    return 0;
  }
}
