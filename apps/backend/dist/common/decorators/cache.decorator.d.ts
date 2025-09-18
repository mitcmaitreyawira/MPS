export declare const CACHE_KEY_METADATA = "cache:key";
export declare const CACHE_TTL_METADATA = "cache:ttl";
export declare const CacheKey: (key: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const CacheTTL: (ttl: number) => import("@nestjs/common").CustomDecorator<string>;
export declare const Cache: (key: string, ttl?: number) => (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => void;
//# sourceMappingURL=cache.decorator.d.ts.map