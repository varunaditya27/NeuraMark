/**
 * useENS React Hook
 * 
 * Custom hook for resolving Ethereum addresses to ENS names with loading states.
 * Provides automatic resolution, caching, and fallback to truncated addresses.
 * 
 * @example
 * function Component({ address }: { address: string }) {
 *   const { displayName, ensName, isLoading } = useENS(address);
 *   
 *   return (
 *     <div>
 *       {isLoading ? <Skeleton /> : <span>{displayName}</span>}
 *     </div>
 *   );
 * }
 */

import { useState, useEffect } from 'react';
import { getDisplayName, resolveENS, formatAddress } from '@/lib/ensClient';

interface UseENSResult {
  /** Display name: ENS name if available, otherwise truncated address */
  displayName: string;
  /** Raw ENS name (null if not found) */
  ensName: string | null;
  /** Loading state during resolution */
  isLoading: boolean;
  /** Error message if resolution fails */
  error: string | null;
  /** Manually trigger re-resolution */
  refetch: () => void;
}

/**
 * Hook to resolve a single Ethereum address to ENS name
 * @param address - Ethereum address to resolve
 * @param enabled - Whether to enable resolution (default: true)
 * @returns Object with displayName, ensName, isLoading, error, and refetch
 */
export function useENS(address: string | null | undefined, enabled = true): UseENSResult {
  const [displayName, setDisplayName] = useState<string>('');
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (!address || !enabled) {
      setDisplayName('');
      setEnsName(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function resolve() {
      try {
        // Ensure address is a string
        const addrString = address as string;
        console.log(`🪝 [useENS] Resolving ENS for: ${addrString}`);
        
        const name = await getDisplayName(addrString);
        const rawEns = await resolveENS(addrString);
        
        console.log(`🪝 [useENS] Result - displayName: ${name}, ensName: ${rawEns || 'null'}`);
        
        if (isMounted) {
          setDisplayName(name);
          setEnsName(rawEns);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('🪝 [useENS] Resolution error:', err);
          setError(err instanceof Error ? err.message : 'Failed to resolve ENS');
          setDisplayName(formatAddress(address as string));
          setEnsName(null);
          setIsLoading(false);
        }
      }
    }

    resolve();

    return () => {
      isMounted = false;
    };
  }, [address, enabled, fetchTrigger]);

  const refetch = () => {
    setFetchTrigger(prev => prev + 1);
  };

  return {
    displayName,
    ensName,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to resolve multiple Ethereum addresses to ENS names
 * More efficient than calling useENS multiple times
 * 
 * @param addresses - Array of Ethereum addresses
 * @param enabled - Whether to enable resolution (default: true)
 * @returns Map of address → { displayName, ensName, isLoading }
 * 
 * @example
 * function Table({ proofs }: { proofs: Proof[] }) {
 *   const addresses = proofs.map(p => p.creator);
 *   const ensMap = useENSBatch(addresses);
 *   
 *   return proofs.map(proof => (
 *     <Row key={proof.id}>
 *       {ensMap.get(proof.creator)?.displayName}
 *     </Row>
 *   ));
 * }
 */
export function useENSBatch(
  addresses: string[],
  enabled = true
): Map<string, { displayName: string; ensName: string | null; isLoading: boolean }> {
  const [results, setResults] = useState<Map<string, { 
    displayName: string; 
    ensName: string | null; 
    isLoading: boolean 
  }>>(new Map());

  useEffect(() => {
    if (!enabled || addresses.length === 0) {
      setResults(new Map());
      return;
    }

    let isMounted = true;

    // Initialize with loading state
    const initialMap = new Map(
      addresses.map(addr => [
        addr,
        { displayName: formatAddress(addr), ensName: null, isLoading: true }
      ])
    );
    setResults(initialMap);

    async function resolveBatch() {
      const updatedMap = new Map<string, { 
        displayName: string; 
        ensName: string | null; 
        isLoading: boolean 
      }>();

      // Resolve all addresses in parallel
      await Promise.all(
        addresses.map(async (address) => {
          try {
            const displayName = await getDisplayName(address);
            const ensName = await resolveENS(address);
            
            if (isMounted) {
              updatedMap.set(address, { displayName, ensName, isLoading: false });
            }
          } catch (err) {
            console.error(`ENS resolution failed for ${address}:`, err);
            if (isMounted) {
              updatedMap.set(address, {
                displayName: formatAddress(address),
                ensName: null,
                isLoading: false
              });
            }
          }
        })
      );

      if (isMounted) {
        setResults(updatedMap);
      }
    }

    resolveBatch();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(addresses), enabled]);

  return results;
}

/**
 * Hook that returns only the display name (simplified version)
 * Use this when you don't need loading states or raw ENS name
 * 
 * @param address - Ethereum address
 * @returns Display name string
 * 
 * @example
 * function SimpleComponent({ address }: { address: string }) {
 *   const name = useENSName(address);
 *   return <span>{name}</span>;
 * }
 */
export function useENSName(address: string | null | undefined): string {
  const { displayName } = useENS(address);
  return displayName;
}
