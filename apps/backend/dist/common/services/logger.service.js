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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredLoggerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let StructuredLoggerService = class StructuredLoggerService {
    configService;
    logLevel;
    isDevelopment;
    constructor(configService) {
        this.configService = configService;
        this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
        this.logLevel = this.isDevelopment
            ? ['log', 'error', 'warn', 'debug', 'verbose']
            : ['log', 'error', 'warn'];
    }
    log(message, context) {
        this.writeLog('log', message, context);
    }
    error(message, trace, context) {
        this.writeLog('error', message, { ...context, trace });
    }
    warn(message, context) {
        this.writeLog('warn', message, context);
    }
    debug(message, context) {
        if (this.isDevelopment) {
            this.writeLog('debug', message, context);
        }
    }
    verbose(message, context) {
        if (this.isDevelopment) {
            this.writeLog('verbose', message, context);
        }
    }
    logRequest(context) {
        const { method, url } = context;
        this.log(`Incoming Request: ${method} ${url}`, {
            ...context,
            type: 'request',
        });
    }
    logResponse(context) {
        const { method, url, statusCode, responseTime } = context;
        this.log(`Outgoing Response: ${method} ${url} - ${statusCode} (${responseTime}ms)`, {
            ...context,
            type: 'response',
        });
    }
    logError(error, context) {
        this.error(`Error: ${error.message}`, error.stack, {
            ...context,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            type: 'error',
        });
    }
    logSecurityEvent(event, context) {
        this.warn(`Security Event: ${event}`, {
            ...context,
            type: 'security',
            severity: 'high',
        });
    }
    logDatabaseOperation(operation, context) {
        this.debug(`Database Operation: ${operation}`, {
            ...context,
            type: 'database',
        });
    }
    writeLog(level, message, context) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...context,
        };
        if (this.isDevelopment) {
            process.stdout.write(`[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
            if (context && Object.keys(context).length > 0) {
                process.stdout.write(`Context: ${JSON.stringify(context, null, 2)}\n`);
            }
        }
        else {
            process.stdout.write(`${JSON.stringify(logEntry)}\n`);
        }
    }
};
exports.StructuredLoggerService = StructuredLoggerService;
exports.StructuredLoggerService = StructuredLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StructuredLoggerService);
//# sourceMappingURL=logger.service.js.map