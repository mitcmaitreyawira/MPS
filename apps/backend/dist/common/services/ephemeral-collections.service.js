"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EphemeralCollectionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EphemeralCollectionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ephemeral_collections_1 = require("../../config/ephemeral-collections");
let EphemeralCollectionsService = EphemeralCollectionsService_1 = class EphemeralCollectionsService {
    connection;
    logger = new common_1.Logger(EphemeralCollectionsService_1.name);
    constructor(connection) {
        this.connection = connection;
    }
    async onModuleInit() {
        try {
            await this.createTTLIndexes();
            this.logger.log(`✅ TTL indexes initialized for ${ephemeral_collections_1.EPHEMERAL_COLLECTIONS.length} ephemeral collections`);
        }
        catch (error) {
            this.logger.error('Failed to initialize TTL indexes:', error);
        }
    }
    async createTTLIndexes() {
        const db = this.connection.db;
        if (!db) {
            throw new Error('Database connection not available');
        }
        for (const config of ephemeral_collections_1.EPHEMERAL_COLLECTIONS) {
            try {
                await this.createTTLIndex(config);
                this.logger.debug(`TTL index created for collection: ${config.name}`);
            }
            catch (error) {
                this.logger.warn(`Failed to create TTL index for ${config.name}:`, error);
            }
        }
    }
    async createTTLIndex(config) {
        const db = this.connection.db;
        if (!db) {
            throw new Error('Database connection not available');
        }
        const collection = db.collection(config.name);
        const indexField = config.indexField || 'createdAt';
        const indexSpec = { [indexField]: 1 };
        const indexOptions = {
            expireAfterSeconds: config.ttlSeconds,
            background: true,
            name: `${indexField}_ttl`
        };
        try {
            await collection.createIndex(indexSpec, indexOptions);
            this.logger.debug(`TTL index created: ${config.name}.${indexField} (${config.ttlSeconds}s) - ${config.description}`);
        }
        catch (error) {
            if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
                this.logger.debug(`TTL index already exists for ${config.name}, skipping`);
            }
            else {
                throw error;
            }
        }
    }
    async getTTLInfo() {
        return ephemeral_collections_1.EPHEMERAL_COLLECTIONS.map(config => ({
            collection: config.name,
            ttl: config.ttlSeconds,
            description: config.description
        }));
    }
    async cleanupExpiredDocuments(collectionName) {
        const db = this.connection.db;
        if (!db) {
            throw new Error('Database connection not available');
        }
        const results = {};
        const collectionsToClean = collectionName
            ? ephemeral_collections_1.EPHEMERAL_COLLECTIONS.filter(c => c.name === collectionName)
            : ephemeral_collections_1.EPHEMERAL_COLLECTIONS;
        for (const config of collectionsToClean) {
            try {
                const collection = db.collection(config.name);
                const indexField = config.indexField || 'createdAt';
                const cutoffTime = new Date(Date.now() - (config.ttlSeconds * 1000));
                const deleteResult = await collection.deleteMany({
                    [indexField]: { $lt: cutoffTime }
                });
                results[config.name] = deleteResult.deletedCount || 0;
                if (deleteResult.deletedCount && deleteResult.deletedCount > 0) {
                    this.logger.log(`Cleaned up ${deleteResult.deletedCount} expired documents from ${config.name}`);
                }
            }
            catch (error) {
                this.logger.warn(`Failed to cleanup ${config.name}:`, error);
                results[config.name] = -1;
            }
        }
        return results;
    }
};
exports.EphemeralCollectionsService = EphemeralCollectionsService;
exports.EphemeralCollectionsService = EphemeralCollectionsService = EphemeralCollectionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], EphemeralCollectionsService);
//# sourceMappingURL=ephemeral-collections.service.js.map