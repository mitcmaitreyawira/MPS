"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.sanitizeInput = exports.isValidUrl = exports.isValidPhone = exports.isValidPassword = exports.isValidEmail = void 0;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPassword = (password) => {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.isValidPassword = isValidPassword;
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidUrl = isValidUrl;
const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
exports.sanitizeInput = sanitizeInput;
const validateObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
exports.validateObjectId = validateObjectId;
//# sourceMappingURL=validation.utils.js.map