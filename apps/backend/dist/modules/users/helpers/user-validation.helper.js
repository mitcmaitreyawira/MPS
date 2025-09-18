"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidationHelper = void 0;
const common_1 = require("@nestjs/common");
const validation_constants_1 = require("../../../common/validation.constants");
class UserValidationHelper {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    static validateUserId(id) {
        if (!validation_constants_1.VALIDATION_PATTERNS.MONGO_ID.test(id)) {
            throw new common_1.BadRequestException('Invalid user ID format');
        }
    }
    static validateUserIdRequired(id) {
        if (!id || id.trim() === '') {
            throw new common_1.BadRequestException('User ID is required');
        }
    }
    static validateUserIdComplete(id) {
        this.validateUserIdRequired(id);
        this.validateUserId(id);
    }
    async validateNisnUniqueness(nisn, excludeUserId) {
        return;
    }
    async validateUsernameUniqueness(username, excludeUserId) {
        if (!username)
            return;
        const normalizedUsername = username.trim().toLowerCase();
        const query = { username: normalizedUsername };
        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }
        const existingUser = await this.userModel.findOne(query).exec();
        if (existingUser) {
            throw new common_1.ConflictException('This username is already taken. The system will automatically generate a unique username based on the user\'s name and email.');
        }
    }
    async validateAllUniqueness(nisn, username, excludeUserId) {
        const validationPromises = [];
        if (nisn) {
            validationPromises.push(this.validateNisnUniqueness(nisn, excludeUserId));
        }
        if (username) {
            validationPromises.push(this.validateUsernameUniqueness(username, excludeUserId));
        }
        await Promise.all(validationPromises);
    }
    async validateBatchUniqueness(users) {
        const nisns = new Set();
        const usernames = new Set();
        for (const user of users) {
            if (user.nisn) {
                const normalizedNisn = user.nisn.trim();
                if (nisns.has(normalizedNisn)) {
                    throw new common_1.ConflictException(`Duplicate NISN found in batch: ${user.nisn}`);
                }
                nisns.add(normalizedNisn);
            }
            if (user.username) {
                const normalizedUsername = user.username.trim().toLowerCase();
                if (usernames.has(normalizedUsername)) {
                    throw new common_1.ConflictException(`Duplicate username found in batch: ${user.username}`);
                }
                usernames.add(normalizedUsername);
            }
        }
        const validationPromises = users.map(user => this.validateAllUniqueness(user.nisn, user.username));
        await Promise.all(validationPromises);
    }
}
exports.UserValidationHelper = UserValidationHelper;
//# sourceMappingURL=user-validation.helper.js.map