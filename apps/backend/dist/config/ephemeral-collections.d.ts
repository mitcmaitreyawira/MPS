export interface EphemeralCollectionConfig {
    name: string;
    ttlSeconds: number;
    description: string;
    indexField?: string;
}
export declare const EPHEMERAL_COLLECTIONS: EphemeralCollectionConfig[];
export declare function getCollectionTTL(collectionName: string): EphemeralCollectionConfig | undefined;
export declare function isEphemeralCollection(collectionName: string): boolean;
export declare function getEphemeralCollectionNames(): string[];
//# sourceMappingURL=ephemeral-collections.d.ts.map