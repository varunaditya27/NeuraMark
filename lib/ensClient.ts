/**
 * ENS (Ethereum Name Service) Client
 * Provides ENS name resolution with caching and fallback to truncated addresses
 * 
 * Features:
 * - Resolves ENS names from Ethereum addresses on mainnet
 * - In-memory caching to reduce RPC calls
 * - Fallback to truncated address format (0x1234...5678)
 * - Batch resolution support for multiple addresses
 * - Handles reverse resolution (address → ENS name)
 */

import { createPublicClient, http, Address, PublicClient } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// In-memory cache for ENS names
// Key: lowercase address, Value: ENS name or null (if no ENS)
const ensCache = new Map<string, string | null>();

// Cache expiration time (1 hour)
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

// Interface for cached entries with timestamps
interface CachedEntry {
  name: string | null;
  timestamp: number;
}

// Enhanced cache with timestamps
const ensTimestampCache = new Map<string, CachedEntry>();

// Public client for ENS resolution (mainnet only)
let publicClient: PublicClient | null = null;

/**
 * Initialize the Viem public client for ENS resolution
 * Uses Ethereum mainnet with public RPC endpoint
 */
function getPublicClient(): PublicClient {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: mainnet,
      transport: http(), // Uses default public mainnet RPC
    });
  }
  return publicClient;
}

/**
 * Truncate an Ethereum address to short format
 * @param address - Full Ethereum address (0x...)
 * @returns Truncated format (0x1234...5678)
 * 
 * @example
 * formatAddress("0x1234567890abcdef1234567890abcdef12345678")
 * // Returns: "0x1234...5678"
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Check if cached ENS name is still valid (not expired)
 * @param address - Ethereum address (lowercase)
 * @returns True if cache entry exists and is valid
 */
function isCacheValid(address: string): boolean {
  const cached = ensTimestampCache.get(address);
  if (!cached) return false;
  
  const now = Date.now();
  const isExpired = now - cached.timestamp > CACHE_EXPIRATION_MS;
  
  if (isExpired) {
    ensTimestampCache.delete(address);
    ensCache.delete(address);
    return false;
  }
  
  return true;
}

/**
 * Resolve an Ethereum address to its ENS name
 * Uses reverse resolution (address → ENS name)
 * Results are cached for 1 hour
 * 
 * @param address - Ethereum address to resolve
 * @returns ENS name if found, null otherwise
 * 
 * @example
 * const name = await resolveENS("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
 * // Returns: "vitalik.eth" or null
 */
export async function resolveENS(address: string): Promise<string | null> {
  if (!address) return null;
  
  const addressLower = address.toLowerCase();
  
  // Check cache first
  if (isCacheValid(addressLower)) {
    const cached = ensCache.get(addressLower);
    return cached ?? null;
  }
  
  try {
    const client = getPublicClient();
    
    // Perform reverse ENS lookup
    const ensName = await client.getEnsName({
      address: address as Address,
    });
    
    // Cache the result (even if null)
    ensCache.set(addressLower, ensName);
    ensTimestampCache.set(addressLower, {
      name: ensName,
      timestamp: Date.now(),
    });
    
    return ensName;
  } catch (error) {
    console.error(`ENS resolution failed for ${address}:`, error);
    
    // Cache null result to avoid repeated failed lookups
    ensCache.set(addressLower, null);
    ensTimestampCache.set(addressLower, {
      name: null,
      timestamp: Date.now(),
    });
    
    return null;
  }
}

/**
 * Resolve multiple addresses to ENS names in parallel
 * More efficient than calling resolveENS() individually
 * 
 * @param addresses - Array of Ethereum addresses
 * @returns Map of address → ENS name (or null if not found)
 * 
 * @example
 * const names = await resolveENSBatch(["0xabc...", "0xdef..."]);
 * // Returns: Map { "0xabc..." => "alice.eth", "0xdef..." => null }
 */
export async function resolveENSBatch(
  addresses: string[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  
  // Resolve all addresses in parallel
  const promises = addresses.map(async (address) => {
    const name = await resolveENS(address);
    results.set(address, name);
  });
  
  await Promise.all(promises);
  return results;
}

/**
 * Get display name for an address (ENS or truncated)
 * This is the primary function UI components should use
 * 
 * @param address - Ethereum address
 * @returns ENS name if available, otherwise truncated address
 * 
 * @example
 * const display = await getDisplayName("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
 * // Returns: "vitalik.eth" or "0xd8dA...6045"
 */
export async function getDisplayName(address: string): Promise<string> {
  if (!address) return '';
  
  const ensName = await resolveENS(address);
  return ensName || formatAddress(address);
}

/**
 * Clear the entire ENS cache
 * Useful for testing or when RPC endpoint changes
 */
export function clearENSCache(): void {
  ensCache.clear();
  ensTimestampCache.clear();
}

/**
 * Get cache statistics for monitoring
 * @returns Object with cache size and hit rate info
 */
export function getENSCacheStats(): {
  size: number;
  entries: number;
} {
  return {
    size: ensCache.size,
    entries: ensTimestampCache.size,
  };
}

/**
 * Validate if a string is a valid ENS name format
 * @param name - Potential ENS name
 * @returns True if valid ENS format
 * 
 * @example
 * isValidENSName("vitalik.eth") // true
 * isValidENSName("invalid") // false
 */
export function isValidENSName(name: string): boolean {
  if (!name) return false;
  
  try {
    // ENS names must end with .eth or other valid TLD
    const validTLDs = ['.eth', '.xyz', '.luxe', '.kred', '.art', '.club'];
    const hasValidTLD = validTLDs.some(tld => name.toLowerCase().endsWith(tld));
    
    if (!hasValidTLD) return false;
    
    // Try to normalize (will throw if invalid)
    normalize(name);
    return true;
  } catch {
    return false;
  }
}

/**
 * Preload ENS names for multiple addresses
 * Call this early to populate cache before rendering UI
 * 
 * @param addresses - Array of addresses to preload
 * 
 * @example
 * // In page component
 * useEffect(() => {
 *   preloadENSNames(proofs.map(p => p.walletAddress));
 * }, [proofs]);
 */
export async function preloadENSNames(addresses: string[]): Promise<void> {
  // Deduplicate addresses
  const uniqueAddresses = [...new Set(addresses)];
  
  // Resolve all in parallel (results are cached)
  await resolveENSBatch(uniqueAddresses);
}

/**
 * React hook for ENS resolution with loading state
 * Can be used in client components for real-time resolution
 * 
 * @example
 * function Component({ address }: { address: string }) {
 *   const { displayName, isLoading } = useENS(address);
 *   return <span>{isLoading ? '...' : displayName}</span>;
 * }
 */
export function useENSSync(address: string): {
  displayName: string;
  ensName: string | null;
  isLoading: boolean;
} {
  // This is a sync version that checks cache only
  // For true React hook, use React.useEffect in components
  const addressLower = address.toLowerCase();
  
  if (isCacheValid(addressLower)) {
    const ensName = ensCache.get(addressLower) ?? null;
    return {
      displayName: ensName || formatAddress(address),
      ensName,
      isLoading: false,
    };
  }
  
  return {
    displayName: formatAddress(address),
    ensName: null,
    isLoading: true,
  };
}
