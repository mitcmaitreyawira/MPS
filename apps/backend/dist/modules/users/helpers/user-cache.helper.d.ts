import { CacheService } from '../../../common/services/cache.service';
export declare class UserCacheHelper {
    private readonly cacheService;
    constructor(cacheService: CacheService);
    private getUserCacheKey;
    private getUsersListPattern;
    invalidateUserCache(userId: string): Promise<void>;
    invalidateUsersListCache(): Promise<void>;
    invalidateUserAndListCache(userId: string): Promise<void>;
    invalidateAllUserCache(): Promise<void>;
    getCachedUser(userId: string): Promise<any>;
    setCachedUser(userId: string, userData: any, ttl?: number): Promise<void>;
    getUserFromCache(userId: string): Promise<any>;
    cacheUser(userId: string, userData: any, ttl?: number): Promise<void>;
    getUsersListFromCache(query: any): Promise<any>;
    cacheUsersList(query: any, data: any, ttl?: number): Promise<void>;
}
//# sourceMappingURL=user-cache.helper.d.ts.map