"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLES = exports.AUTH_CONSTANTS = void 0;
exports.AUTH_CONSTANTS = {
    JWT: {
        ACCESS_TOKEN_EXPIRES_IN: '15m',
        ALGORITHM: 'HS256',
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
    },
};
exports.ROLES = {
    ADMIN: 'admin',
    USER: 'user',
};
//# sourceMappingURL=auth.constants.js.map