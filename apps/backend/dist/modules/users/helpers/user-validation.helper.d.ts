import { Model } from 'mongoose';
import { User } from '../../../database/schemas/user.schema';
export declare class UserValidationHelper {
    private userModel;
    constructor(userModel: Model<User>);
    static validateUserId(id: string): void;
    static validateUserIdRequired(id: string): void;
    static validateUserIdComplete(id: string): void;
    validateNisnUniqueness(nisn: string, excludeUserId?: string): Promise<void>;
    validateUsernameUniqueness(username: string, excludeUserId?: string): Promise<void>;
    validateAllUniqueness(nisn?: string, username?: string, excludeUserId?: string): Promise<void>;
    validateBatchUniqueness(users: Array<{
        nisn?: string;
        username?: string;
    }>): Promise<void>;
}
//# sourceMappingURL=user-validation.helper.d.ts.map