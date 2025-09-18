"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEndOfDay = exports.getStartOfDay = exports.isDateInRange = exports.getTimeAgo = exports.addMinutes = exports.addHours = exports.addDays = exports.isValidDate = exports.formatDate = void 0;
const formatDate = (date, format = 'YYYY-MM-DD') => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return format
        .replace('YYYY', year.toString())
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};
exports.formatDate = formatDate;
const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};
exports.isValidDate = isValidDate;
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const addHours = (date, hours) => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
};
exports.addHours = addHours;
const addMinutes = (date, minutes) => {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
};
exports.addMinutes = addMinutes;
const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'just now';
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
        return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};
exports.getTimeAgo = getTimeAgo;
const isDateInRange = (date, startDate, endDate) => {
    return date >= startDate && date <= endDate;
};
exports.isDateInRange = isDateInRange;
const getStartOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};
exports.getStartOfDay = getStartOfDay;
const getEndOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};
exports.getEndOfDay = getEndOfDay;
//# sourceMappingURL=date.utils.js.map