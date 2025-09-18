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
var DropUsernameIndexMigration_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropUsernameIndexMigration = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DropUsernameIndexMigration = DropUsernameIndexMigration_1 = class DropUsernameIndexMigration {
    connection;
    logger = new common_1.Logger(DropUsernameIndexMigration_1.name);
    constructor(connection) {
        this.connection = connection;
    }
    async run() {
        try {
            const db = this.connection.db;
            if (!db) {
                this.logger.error('Database connection not available');
                return;
            }
            const collection = db.collection('users');
            const indexes = await collection.listIndexes().toArray();
            const usernameIndex = indexes.find(index => index.name === 'username_1');
            if (usernameIndex) {
                this.logger.log('Found legacy username_1 index, attempting to drop...');
                try {
                    await collection.dropIndex('username_1');
                    this.logger.log('✅ Successfully dropped username_1 index');
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.warn(`Failed to drop username_1 index: ${errorMessage}`);
                    try {
                        const result = await collection.deleteMany({ username: null });
                        this.logger.log(`Removed ${result.deletedCount} documents with null username`);
                    }
                    catch (cleanupError) {
                        const cleanupMessage = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
                        this.logger.warn(`Failed to cleanup null username documents: ${cleanupMessage}`);
                    }
                }
            }
            else {
                this.logger.log('No username_1 index found, migration not needed');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Migration failed: ${errorMessage}`);
        }
    }
};
exports.DropUsernameIndexMigration = DropUsernameIndexMigration;
exports.DropUsernameIndexMigration = DropUsernameIndexMigration = DropUsernameIndexMigration_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], DropUsernameIndexMigration);
//# sourceMappingURL=drop-username-index.migration.js.map