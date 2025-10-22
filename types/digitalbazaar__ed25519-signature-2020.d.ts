declare module '@digitalbazaar/ed25519-signature-2020' {
  export interface Ed25519Signature2020Options {
    verificationMethod?: string;
    signer?: {
      sign: (data: { data: Uint8Array }) => Promise<Uint8Array>;
      id?: string;
    };
    date?: string | Date;
    useNativeCanonize?: boolean;
    [key: string]: unknown;
  }

  export class Ed25519Signature2020 {
    type: string;
    verificationMethod: string;
    created?: string;
    proofPurpose?: string;
    proofValue?: string;

    constructor(options?: Ed25519Signature2020Options);
    
    createProof(options: {
      document: unknown;
      purpose: unknown;
      documentLoader?: (url: string) => Promise<unknown>;
      expansionMap?: unknown;
      compactProof?: boolean;
    }): Promise<{ proof: unknown }>;
    
    verifyProof(options: {
      proof: unknown;
      document: unknown;
      purpose: unknown;
      documentLoader?: (url: string) => Promise<unknown>;
      expansionMap?: unknown;
    }): Promise<{ verified: boolean; error?: Error }>;
    
    matchProof(options: { proof: unknown }): boolean;
  }

  export default Ed25519Signature2020;
}
