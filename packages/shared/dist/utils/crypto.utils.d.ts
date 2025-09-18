export declare const generateHash: (data: string) => string;
export declare const generateRandomBytes: (length: number) => string;
export declare const generateSecureToken: (length?: number) => string;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateMfaSecret: () => string;
export declare const generateBackupCodes: (count?: number) => string[];
//# sourceMappingURL=crypto.utils.d.ts.map