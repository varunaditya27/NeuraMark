// Type definitions for environment variables
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');
export const DATABASE_URL = process.env.DATABASE_URL as string;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY as string;
export const PINATA_API_KEY = process.env.PINATA_API_KEY as string;
export const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY as string;
export const PINATA_JWT = process.env.PINATA_JWT as string;
export const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY as string;

// Validate critical environment variables
export function validateEnvConfig() {
  const missing: string[] = [];
  
  if (!CONTRACT_ADDRESS) missing.push('NEXT_PUBLIC_CONTRACT_ADDRESS');
  if (!DATABASE_URL) missing.push('DATABASE_URL');
  if (!PINATA_API_KEY && !PINATA_JWT) missing.push('PINATA_API_KEY or PINATA_JWT');
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing.join(', '));
  }
  
  return missing.length === 0;
}
