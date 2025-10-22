declare module '@digitalbazaar/vc' {
  export interface VerifiableCredential {
    '@context': Array<string | Record<string, unknown>>;
    type: string[] | string;
    id?: string;
    issuer: string | { id: string; [key: string]: unknown };
    issuanceDate: string;
    expirationDate?: string;
    credentialSubject: {
      id?: string;
      [key: string]: unknown;
    };
    proof?: unknown;
    [key: string]: unknown;
  }

  export interface VerificationResult {
    verified: boolean;
    results?: unknown[];
    error?: Error;
    [key: string]: unknown;
  }

  export interface IssueCredentialOptions {
    credential: VerifiableCredential;
    suite: unknown;
    documentLoader?: (url: string) => Promise<unknown>;
    [key: string]: unknown;
  }

  export interface VerifyCredentialOptions {
    credential: VerifiableCredential;
    suite?: unknown;
    documentLoader?: (url: string) => Promise<unknown>;
    [key: string]: unknown;
  }

  export function issue(options: IssueCredentialOptions): Promise<VerifiableCredential>;
  export function verifyCredential(options: VerifyCredentialOptions): Promise<VerificationResult>;
  
  export const defaultDocumentLoader: (url: string) => Promise<unknown>;
}
