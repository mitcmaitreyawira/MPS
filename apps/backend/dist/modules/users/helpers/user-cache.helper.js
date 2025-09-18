"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCacheHelper = void 0;
class UserCacheHelper {
    cacheService;
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    getUserCacheKey(userId) {
        return `user:${userId}`;
    }
    getUsersListPattern() {
        return 'users:list:*';
    }
    async invalidateUserCache(userId) {
        await this.cacheService.del(this.getUserCacheKey(userId));
    }
    async invalidateUsersListCache() {
        await this.cacheService.invalidatePattern(this.getUsersListPattern());
    }
    async invalidateUserAndListCache(userId) {
        await Promise.all([
            this.invalidateUserCache(userId),
            this.invalidateUsersListCache(),
        ]);
    }
    async invalidateAllUserCache() {
        await Promise.all([
            this.cacheService.invalidatePattern('user:*'),
            this.invalidateUsersListCache(),
        ]);
    }
    async getCachedUser(userId) {
        return await this.cacheService.get(this.getUserCacheKey(userId));
    }
    async setCachedUser(userId, userData, ttl) {
        await this.cacheService.set(this.getUserCacheKey(userId), userData, ttl);
    }
    async getUserFromCache(userId) {
        return await this.getCachedUser(userId);
    }
    async cacheUser(userId, userData, ttl = 300) {
        await this.setCachedUser(userId, userData, ttl);
    }
    async getUsersListFromCache(query) {
        const cacheKey = `users:list:${JSON.stringify(query)}`;
        return await this.cacheService.get(cacheKey);
    }
    async cacheUsersList(query, data, ttl = 120) {
        const cacheKey = `users:list:${JSON.stringify(query)}`;
        await this.cacheService.set(cacheKey, data, ttl);
    }
}
exports.UserCacheHelper = UserCacheHelper;
//# sourceMappingURL=user-cache.helper.js.map