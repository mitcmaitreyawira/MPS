import { Connection } from 'mongoose';
export declare class DropUsernameIndexMigration {
    private connection;
    private readonly logger;
    constructor(connection: Connection);
    run(): Promise<void>;
}
//# sourceMappingURL=drop-username-index.migration.d.ts.map