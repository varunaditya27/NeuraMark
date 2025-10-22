/**
 * Proof Fetching Utility for Public Explorer
 * 
 * Fetches proof data from Supabase (cache) with blockchain fallback.
 * Provides filtering, sorting, and pagination capabilities.
 */

import { ProofRecord } from "@/lib/prisma";

/**
 * Extended proof type for explorer display
 */
export interface ExplorerProof {
  id: string;
  proofId: string;
  creator: string; // wallet address
  modelInfo: string;
  timestamp: string;
  proofType: 'text' | 'image' | 'code';
  txHash: string;
  promptHash: string;
  outputHash: string;
  promptCID: string;
  outputCID: string;
  etherscanUrl: string;
  originalityScore?: number | null;
  originalityAnalysis?: string | null;
  originalityConfidence?: number | null;
}

/**
 * Filter options for proof explorer
 */
export interface ProofFilters {
  searchQuery?: string;
  modelFilter?: string;
  typeFilter?: 'all' | 'text' | 'image' | 'code';
  sortBy?: 'recent' | 'oldest';
  page?: number;
  limit?: number;
}

/**
 * Fetch all public proofs from database
 * 
 * @param filters Optional filters and pagination
 * @returns Array of explorer proofs with metadata
 */
export async function fetchAllProofs(filters?: ProofFilters): Promise<{
  proofs: ExplorerProof[];
  totalCount: number;
  hasMore: boolean;
}> {
  try {
    const limit = filters?.limit || 50;
    const page = filters?.page || 1;
    
    // Build query params
    const params = new URLSearchParams();
    params.append('limit', String(limit * 2)); // Fetch extra for client-side filtering
    
    const response = await fetch(`/api/get-proofs?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch proofs: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.proofs)) {
      throw new Error('Invalid response format from API');
    }
    
    // Transform proofs to ExplorerProof format
    let explorerProofs: ExplorerProof[] = data.proofs.map((proof: ProofRecord & { createdAt: string }) => {
      // Determine proof type from outputType or modelInfo
      let proofType: 'text' | 'image' | 'code' = 'text';
      if (proof.outputType === 'image') {
        proofType = 'image';
      } else if (proof.modelInfo.toLowerCase().includes('code') || 
                 proof.modelInfo.toLowerCase().includes('copilot') ||
                 proof.modelInfo.toLowerCase().includes('codex')) {
        proofType = 'code';
      }
      
      return {
        id: proof.id,
        proofId: proof.proofId,
        creator: proof.wallet,
        modelInfo: proof.modelInfo,
        timestamp: proof.createdAt,
        proofType,
        txHash: proof.txHash,
        promptHash: proof.promptHash,
        outputHash: proof.outputHash,
        promptCID: proof.promptCID,
        outputCID: proof.outputCID,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${proof.txHash}`,
        originalityScore: proof.originalityScore ?? null,
        originalityAnalysis: proof.originalityAnalysis ?? null,
        originalityConfidence: proof.originalityConfidence ?? null,
      };
    });
    
    // Apply client-side filters
    if (filters) {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        explorerProofs = explorerProofs.filter(proof => 
          proof.creator.toLowerCase().includes(query) ||
          proof.modelInfo.toLowerCase().includes(query) ||
          proof.proofId.toLowerCase().includes(query)
        );
      }
      
      // Model filter
      if (filters.modelFilter && filters.modelFilter !== 'all') {
        explorerProofs = explorerProofs.filter(proof =>
          proof.modelInfo.toLowerCase().includes(filters.modelFilter!.toLowerCase())
        );
      }
      
      // Type filter
      if (filters.typeFilter && filters.typeFilter !== 'all') {
        explorerProofs = explorerProofs.filter(proof =>
          proof.proofType === filters.typeFilter
        );
      }
      
      // Sort
      if (filters.sortBy === 'oldest') {
        explorerProofs.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      } else {
        // Default: recent first
        explorerProofs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
    }
    
    // Pagination
    const totalCount = explorerProofs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProofs = explorerProofs.slice(startIndex, endIndex);
    const hasMore = endIndex < totalCount;
    
    return {
      proofs: paginatedProofs,
      totalCount,
      hasMore,
    };
    
  } catch (error) {
    console.error('❌ Error fetching proofs for explorer:', error);
    
    // Return empty result on error
    return {
      proofs: [],
      totalCount: 0,
      hasMore: false,
    };
  }
}

/**
 * Get explorer statistics
 * 
 * @returns Total proof count, model breakdown, type breakdown
 */
export async function getExplorerStats(): Promise<{
  totalProofs: number;
  modelBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
}> {
  try {
    const response = await fetch('/api/get-proofs?limit=1000');
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    const data = await response.json();
    const proofs = data.proofs || [];
    
    // Calculate statistics
    const modelBreakdown: Record<string, number> = {};
    const typeBreakdown: Record<string, number> = {
      text: 0,
      image: 0,
      code: 0,
    };
    
    proofs.forEach((proof: ProofRecord & { createdAt: string }) => {
      // Model stats
      const model = proof.modelInfo;
      modelBreakdown[model] = (modelBreakdown[model] || 0) + 1;
      
      // Type stats
      if (proof.outputType === 'image') {
        typeBreakdown.image++;
      } else if (proof.modelInfo.toLowerCase().includes('code')) {
        typeBreakdown.code++;
      } else {
        typeBreakdown.text++;
      }
    });
    
    return {
      totalProofs: proofs.length,
      modelBreakdown,
      typeBreakdown,
    };
    
  } catch (error) {
    console.error('❌ Error fetching explorer stats:', error);
    return {
      totalProofs: 0,
      modelBreakdown: {},
      typeBreakdown: { text: 0, image: 0, code: 0 },
    };
  }
}

/**
 * Format timestamp to human-readable format
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Relative time for recent proofs
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // Absolute date for older proofs
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Shorten wallet address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
