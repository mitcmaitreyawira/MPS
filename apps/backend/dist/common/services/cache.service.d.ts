import { Cache } from 'cache-manager';
import { StructuredLoggerService } from './logger.service';
export declare class CacheService {
    private cacheManager;
    private logger;
    constructor(cacheManager: Cache, logger: StructuredLoggerService);
    getOrSet<T>(key: string, fallback: () => Promise<T>, ttl?: number): Promise<T>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    deletePattern(pattern: string): Promise<void>;
    getStats(): Promise<any>;
    warmUp(entries: Array<{
        key: string;
        value: any;
        ttl?: number;
    }>): Promise<void>;
    private matchPattern;
}
//# sourceMappingURL=cache.service.d.ts.map