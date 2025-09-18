"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransformer = exports.ValidationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const Joi = __importStar(require("joi"));
let ValidationMiddleware = class ValidationMiddleware {
    validationRules = new Map();
    constructor() {
        this.initializeValidationRules();
    }
    initializeValidationRules() {
        this.validationRules.set('user', {
            entity: 'user',
            schema: Joi.object({
                email: Joi.string().email().optional().allow(''),
                firstName: Joi.string().min(1).max(50).required(),
                lastName: Joi.string().min(1).max(50).required(),
                roles: Joi.array().items(Joi.string().valid('student', 'teacher', 'parent', 'admin')),
                nisn: Joi.string().optional(),
                classId: Joi.string().hex().length(24).optional(),
                isArchived: Joi.boolean().optional(),
            }),
        });
        this.validationRules.set('class', {
            entity: 'class',
            schema: Joi.object({
                name: Joi.string().min(1).max(100).required(),
                headTeacherId: Joi.string().hex().length(24).optional(),
                students: Joi.array().items(Joi.string().hex().length(24)).optional(),
            }),
        });
        this.validationRules.set('quest', {
            entity: 'quest',
            schema: Joi.object({
                title: Joi.string().min(1).max(200).required(),
                description: Joi.string().min(1).max(2000).required(),
                pointValue: Joi.number().min(0).max(1000).required(),
                category: Joi.string().valid('academic', 'behavior', 'special').required(),
                difficultyLevel: Joi.string().valid('easy', 'medium', 'hard').required(),
                targetClasses: Joi.array().items(Joi.string().hex().length(24)).optional(),
                dueDate: Joi.date().iso().min('now').optional(),
            }),
        });
        this.validationRules.set('pointLog', {
            entity: 'pointLog',
            schema: Joi.object({
                userId: Joi.string().hex().length(24).required(),
                points: Joi.number().integer().required(),
                category: Joi.string().valid('academic', 'behavior', 'special').required(),
                description: Joi.string().min(1).max(500).required(),
                awardedBy: Joi.string().hex().length(24).required(),
            }),
        });
        this.validationRules.set('appeal', {
            entity: 'appeal',
            schema: Joi.object({
                pointLogId: Joi.string().hex().length(24).required(),
                reason: Joi.string().min(10).max(1000).required(),
                status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
            }),
        });
        this.validationRules.set('syncOperation', {
            entity: 'syncOperation',
            schema: Joi.object({
                type: Joi.string().valid('create', 'update', 'delete', 'reconcile').required(),
                entity: Joi.string().required(),
                data: Joi.object().required(),
                priority: Joi.string().valid('low', 'normal', 'high', 'critical').optional(),
            }),
        });
    }
    use(req, res, next) {
        if (req.method === 'GET' || req.path.includes('/health')) {
            return next();
        }
        const entityType = this.extractEntityType(req.path);
        if (!entityType) {
            return next();
        }
        const validationResult = this.validateData(entityType, req.body);
        if (!validationResult.valid) {
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors: validationResult.errors,
            });
        }
        req.body = validationResult.sanitizedData;
        next();
    }
    validateData(entity, data) {
        const rule = this.validationRules.get(entity);
        if (!rule) {
            return { valid: true, sanitizedData: data };
        }
        const { error, value } = rule.schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value,
                type: detail.type,
            }));
            return { valid: false, errors };
        }
        return { valid: true, sanitizedData: value };
    }
    validateBatch(entity, items) {
        const errors = [];
        const sanitized = [];
        items.forEach((item, index) => {
            const result = this.validateData(entity, item);
            if (!result.valid) {
                result.errors?.forEach(error => {
                    errors.push({
                        ...error,
                        field: `[${index}].${error.field}`,
                    });
                });
            }
            else {
                sanitized.push(result.sanitizedData);
            }
        });
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            sanitizedData: sanitized,
        };
    }
    async validateConsistency(data) {
        const errors = [];
        if (data.userId && !(await this.isValidReference('user', data.userId))) {
            errors.push({
                field: 'userId',
                message: 'Referenced user does not exist',
                value: data.userId,
                type: 'reference.invalid',
            });
        }
        if (data.classId && !(await this.isValidReference('class', data.classId))) {
            errors.push({
                field: 'classId',
                message: 'Referenced class does not exist',
                value: data.classId,
                type: 'reference.invalid',
            });
        }
        if (data.points !== undefined) {
            if (data.points > 1000) {
                errors.push({
                    field: 'points',
                    message: 'Points cannot exceed 1000 in a single transaction',
                    value: data.points,
                    type: 'business.constraint',
                });
            }
        }
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            sanitizedData: data,
        };
    }
    addValidationRule(entity, schema) {
        this.validationRules.set(entity, { entity, schema });
    }
    extractEntityType(path) {
        const patterns = {
            '/users': 'user',
            '/classes': 'class',
            '/quests': 'quest',
            '/point-logs': 'pointLog',
            '/appeals': 'appeal',
            '/sync': 'syncOperation',
        };
        for (const [pattern, entity] of Object.entries(patterns)) {
            if (path.includes(pattern)) {
                return entity;
            }
        }
        return null;
    }
    async isValidReference(entity, id) {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }
};
exports.ValidationMiddleware = ValidationMiddleware;
exports.ValidationMiddleware = ValidationMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ValidationMiddleware);
class DataTransformer {
    static normalize(data, entity) {
        const normalized = { ...data };
        if (normalized._id && !normalized.id) {
            normalized.id = normalized._id;
            delete normalized._id;
        }
        const dateFields = ['createdAt', 'updatedAt', 'timestamp', 'dueDate'];
        dateFields.forEach(field => {
            if (normalized[field]) {
                normalized[field] = new Date(normalized[field]).toISOString();
            }
        });
        switch (entity) {
            case 'user':
                if (normalized.role && !normalized.roles) {
                    normalized.roles = [normalized.role];
                    delete normalized.role;
                }
                break;
            case 'class':
                if (!Array.isArray(normalized.students)) {
                    normalized.students = [];
                }
                break;
        }
        return normalized;
    }
    static sanitize(data, entity) {
        const sanitized = { ...data };
        const sensitiveFields = ['password', 'salt', 'resetToken', '__v'];
        sensitiveFields.forEach(field => {
            delete sanitized[field];
        });
        switch (entity) {
            case 'user':
                if (sanitized.email && !sanitized.isAdmin) {
                    const [local, domain] = sanitized.email.split('@');
                    sanitized.email = `${local.substring(0, 2)}***@${domain}`;
                }
                break;
        }
        return sanitized;
    }
    static transformBatch(items, entity) {
        return items.map(item => this.normalize(item, entity));
    }
}
exports.DataTransformer = DataTransformer;
//# sourceMappingURL=validation.middleware.js.map