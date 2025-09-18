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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBackupCodes = exports.generateMfaSecret = exports.comparePassword = exports.hashPassword = exports.generateSecureToken = exports.generateRandomBytes = exports.generateHash = void 0;
const crypto = __importStar(require("crypto"));
const generateHash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};
exports.generateHash = generateHash;
const generateRandomBytes = (length) => {
    return crypto.randomBytes(length).toString('hex');
};
exports.generateRandomBytes = generateRandomBytes;
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('base64url');
};
exports.generateSecureToken = generateSecureToken;
const hashPassword = async (password) => {
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
    return bcrypt.hash(password, 12);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
    return bcrypt.compare(password, hash);
};
exports.comparePassword = comparePassword;
const generateMfaSecret = () => {
    return crypto.randomBytes(20).toString('base32');
};
exports.generateMfaSecret = generateMfaSecret;
const generateBackupCodes = (count = 10) => {
    return Array.from({ length: count }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
};
exports.generateBackupCodes = generateBackupCodes;
//# sourceMappingURL=crypto.utils.js.map