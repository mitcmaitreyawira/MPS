import { OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
export declare class EphemeralCollectionsService implements OnModuleInit {
    private readonly connection;
    private readonly logger;
    constructor(connection: Connection);
    onModuleInit(): Promise<void>;
    createTTLIndexes(): Promise<void>;
    private createTTLIndex;
    getTTLInfo(): Promise<Array<{
        collection: string;
        ttl: number;
        description: string;
    }>>;
    cleanupExpiredDocuments(collectionName?: string): Promise<{
        [collection: string]: number;
    }>;
}
//# sourceMappingURL=ephemeral-collections.service.d.ts.map