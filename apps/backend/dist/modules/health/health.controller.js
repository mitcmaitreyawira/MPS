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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const performance_service_1 = require("../../common/services/performance.service");
const cache_service_1 = require("../../common/services/cache.service");
const cache_interceptor_1 = require("../../common/interceptors/cache.interceptor");
const cache_decorator_1 = require("../../common/decorators/cache.decorator");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_cookie_guard_1 = require("../auth/jwt-cookie.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const persistence_1 = require("../../config/persistence");
class HealthResponseDto {
    status;
    timestamp;
    uptime;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Application health status', example: 'ok' }),
    __metadata("design:type", String)
], HealthResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current timestamp' }),
    __metadata("design:type", String)
], HealthResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Application uptime in seconds' }),
    __metadata("design:type", Number)
], HealthResponseDto.prototype, "uptime", void 0);
class MetricsResponseDto {
    timestamp;
    performance;
    cache;
    system;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current timestamp' }),
    __metadata("design:type", String)
], MetricsResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Performance statistics' }),
    __metadata("design:type", Object)
], MetricsResponseDto.prototype, "performance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cache statistics' }),
    __metadata("design:type", Object)
], MetricsResponseDto.prototype, "cache", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'System information' }),
    __metadata("design:type", Object)
], MetricsResponseDto.prototype, "system", void 0);
class DatabaseHealthResponseDto {
    dbName;
    host;
    ok;
    readyState;
    responseTimeMs;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Database name' }),
    __metadata("design:type", String)
], DatabaseHealthResponseDto.prototype, "dbName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Database host (without credentials)' }),
    __metadata("design:type", String)
], DatabaseHealthResponseDto.prototype, "host", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Database connection status' }),
    __metadata("design:type", Boolean)
], DatabaseHealthResponseDto.prototype, "ok", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Connection ready state' }),
    __metadata("design:type", Number)
], DatabaseHealthResponseDto.prototype, "readyState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response time in milliseconds' }),
    __metadata("design:type", Number)
], DatabaseHealthResponseDto.prototype, "responseTimeMs", void 0);
let HealthController = class HealthController {
    performanceService;
    cacheService;
    connection;
    constructor(performanceService, cacheService, connection) {
        this.performanceService = performanceService;
        this.cacheService = cacheService;
        this.connection = connection;
    }
    get() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
    async getMetrics() {
        const performanceStats = this.performanceService.getMetrics();
        const cacheStats = await this.cacheService.getStats();
        return {
            timestamp: new Date().toISOString(),
            performance: performanceStats,
            cache: cacheStats,
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                platform: process.platform,
                nodeVersion: process.version,
            },
        };
    }
    getSystemInfo() {
        return {
            timestamp: new Date().toISOString(),
            application: {
                name: 'MPS Launch Backend',
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                uptime: process.uptime(),
            },
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
            },
            database: {
                status: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
            },
            cache: {
                enabled: true,
                type: 'in-memory',
            },
        };
    }
    async getFullHealth() {
        const started = Date.now();
        const dbInfo = { readyState: this.connection.readyState };
        const db = this.connection.db;
        if (db) {
            try {
                const pingStart = Date.now();
                await db.admin().ping();
                dbInfo.pingMs = Date.now() - pingStart;
            }
            catch (e) {
                dbInfo.error = e instanceof Error ? e.message : String(e);
            }
        }
        else {
            dbInfo.error = 'Database not connected';
        }
        const collectionsToCount = [
            'users',
            'classes',
            'quests',
            'actionpresets',
            'teacherreports',
            'appeals',
            'pointlogs',
            'questparticipants',
            'auditlogs',
        ];
        const counts = {};
        if (db) {
            for (const name of collectionsToCount) {
                try {
                    const exists = await db.listCollections({ name }).hasNext();
                    if (!exists) {
                        counts[name] = 0;
                        continue;
                    }
                    const c = db.collection(name);
                    counts[name] = await c.countDocuments({});
                }
                catch (err) {
                    counts[name] = { error: err instanceof Error ? err.message : String(err) };
                }
            }
        }
        const cacheStats = await this.cacheService.getStats();
        return {
            status: db ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            durationMs: Date.now() - started,
            database: dbInfo,
            cache: cacheStats,
            counts,
        };
    }
    async getDatabaseHealth() {
        const started = Date.now();
        const db = this.connection.db;
        let responseTimeMs;
        let ok = false;
        if (db) {
            try {
                const pingStart = Date.now();
                await db.admin().ping();
                responseTimeMs = Date.now() - pingStart;
                ok = true;
            }
            catch (error) {
                responseTimeMs = Date.now() - started;
            }
        }
        const dbName = db?.databaseName || 'unknown';
        let host = 'unknown';
        const mongoUri = (0, persistence_1.getMongoUri)();
        if (mongoUri) {
            try {
                const url = new URL(mongoUri);
                host = `${url.hostname}:${url.port || '27017'}`;
            }
            catch (error) {
                host = this.connection.host || 'unknown';
            }
        }
        return {
            dbName,
            host,
            ok,
            readyState: this.connection.readyState,
            responseTimeMs,
        };
    }
    async getIntegrityReport() {
        const db = this.connection.db;
        if (!db) {
            return {
                status: 'degraded',
                timestamp: new Date().toISOString(),
                issues: [
                    { type: 'db_unavailable', message: 'Database not connected; cannot run integrity checks' },
                ],
            };
        }
        const getCol = async (name) => {
            const exists = await db.listCollections({ name }).hasNext();
            return exists ? db.collection(name) : undefined;
        };
        const usersCol = await getCol('users');
        const classesCol = await getCol('classes');
        const issues = [];
        if (usersCol && classesCol) {
            const usersWithClass = await usersCol
                .find({ classId: { $exists: true, $ne: null } }, { projection: { _id: 1, classId: 1, email: 1, name: 1 } })
                .toArray();
            const existingDocs = await classesCol.find({}, { projection: { _id: 1 } }).toArray();
            const existingSet = new Set(existingDocs.map((c) => c._id.toString()));
            const orphans = usersWithClass.filter((u) => !existingSet.has((u.classId || '').toString()));
            if (orphans.length) {
                issues.push({
                    type: 'orphan_user_classId',
                    message: `Users reference non-existent classes`,
                    total: orphans.length,
                    sample: orphans.slice(0, 10),
                });
            }
        }
        if (usersCol && classesCol) {
            const classesWithHead = await classesCol
                .find({ headTeacherId: { $exists: true, $ne: null } }, { projection: { _id: 1, headTeacherId: 1, name: 1 } })
                .toArray();
            const teacherIds = Array.from(new Set(classesWithHead.map((c) => (c.headTeacherId || '').toString()).filter(Boolean)));
            const allUsers = await usersCol.find({}, { projection: { _id: 1 } }).toArray();
            const existingUserSet = new Set(allUsers.map((u) => u._id.toString()));
            const invalid = classesWithHead.filter((c) => !existingUserSet.has((c.headTeacherId || '').toString()));
            if (invalid.length) {
                issues.push({
                    type: 'invalid_class_headTeacherId',
                    message: `Classes reference non-existent head teachers`,
                    total: invalid.length,
                    sample: invalid.slice(0, 10),
                });
            }
        }
        if (classesCol) {
            const allClasses = await classesCol.find({}, { projection: { _id: 1, name: 1 } }).toArray();
            const map = {};
            for (const c of allClasses) {
                const key = (c.name || '').toString().trim().toLowerCase();
                map[key] = map[key] || [];
                map[key].push(c);
            }
            const dups = Object.entries(map)
                .filter(([, arr]) => arr.length > 1)
                .map(([key, arr]) => ({ key, items: arr }));
            if (dups.length) {
                issues.push({
                    type: 'duplicate_class_names',
                    message: 'Multiple classes share the same name (case-insensitive)',
                    total: dups.length,
                    sample: dups.slice(0, 5),
                });
            }
        }
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            issues,
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check', description: 'Check application health status and availability.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is healthy', type: HealthResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "get", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance metrics', description: 'Retrieve application performance metrics and cache statistics.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics retrieved successfully', type: MetricsResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('info'),
    (0, common_1.UseInterceptors)(cache_interceptor_1.CacheInterceptor),
    (0, cache_decorator_1.CacheKey)('health-system-info'),
    (0, cache_decorator_1.CacheTTL)(60000),
    (0, swagger_1.ApiOperation)({ summary: 'Get system information', description: 'Retrieve detailed system and application information.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System information retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getSystemInfo", null);
__decorate([
    (0, common_1.Get)('full'),
    (0, swagger_1.ApiOperation)({ summary: 'Deep health check', description: 'Verify database connectivity, cache status, and basic data availability.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deep health report retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getFullHealth", null);
__decorate([
    (0, common_1.Get)('db'),
    (0, swagger_1.ApiOperation)({ summary: 'Database health check', description: 'Check database connectivity and return connection info without credentials.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Database health information retrieved successfully', type: DatabaseHealthResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDatabaseHealth", null);
__decorate([
    (0, common_1.Get)('integrity'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Data integrity audit', description: 'Detect orphaned references and duplicate entities across collections.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integrity report generated successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getIntegrityReport", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __param(2, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService,
        cache_service_1.CacheService,
        mongoose_2.Connection])
], HealthController);
//# sourceMappingURL=health.controller.js.map