declare module '@digitalbazaar/ed25519-verification-key-2020' {
  export interface Ed25519VerificationKey2020Options {
    id?: string;
    controller?: string;
    publicKeyMultibase?: string;
    privateKeyMultibase?: string;
    revoked?: boolean;
    [key: string]: unknown;
  }

  export class Ed25519VerificationKey2020 {
    id: string;
    controller: string;
    type: string;
    publicKeyMultibase?: string;
    privateKeyMultibase?: string;
    revoked?: boolean;

    constructor(options?: Ed25519VerificationKey2020Options);
    
    static generate(options?: { id?: string; controller?: string; seed?: Uint8Array }): Promise<Ed25519VerificationKey2020>;
    static from(options: Ed25519VerificationKey2020Options): Promise<Ed25519VerificationKey2020>;
    static fromFingerprint(options: { fingerprint: string; controller?: string }): Ed25519VerificationKey2020;
    
    export(options?: { publicKey?: boolean; privateKey?: boolean; includeContext?: boolean }): Promise<Ed25519VerificationKey2020Options>;
    fingerprint(): string;
    verifyFingerprint(fingerprint: string): { valid: boolean };
    signer(): { sign: (data: { data: Uint8Array }) => Promise<Uint8Array> };
    verifier(): { verify: (data: { data: Uint8Array; signature: Uint8Array }) => Promise<boolean> };
  }

  export default Ed25519VerificationKey2020;
}
