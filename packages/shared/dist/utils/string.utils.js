"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = exports.maskEmail = exports.generateSlug = exports.truncate = exports.snakeCase = exports.kebabCase = exports.camelCase = exports.capitalize = void 0;
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
const camelCase = (str) => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
        .replace(/\s+/g, '');
};
exports.camelCase = camelCase;
const kebabCase = (str) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
};
exports.kebabCase = kebabCase;
const snakeCase = (str) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
};
exports.snakeCase = snakeCase;
const truncate = (str, length) => {
    return str.length > length ? str.substring(0, length) + '...' : str;
};
exports.truncate = truncate;
const generateSlug = (str) => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
};
exports.generateSlug = generateSlug;
const maskEmail = (email) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
};
exports.maskEmail = maskEmail;
const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
//# sourceMappingURL=string.utils.js.map