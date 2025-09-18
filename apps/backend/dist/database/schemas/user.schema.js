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
exports.UserSchema = exports.User = exports.UserPreferences = exports.UserProfile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
let UserProfile = class UserProfile {
    bio;
    phone;
    dateOfBirth;
    gender;
    subject;
    address;
    socialLinks;
};
exports.UserProfile = UserProfile;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserProfile.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserProfile.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], UserProfile.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['male', 'female', 'other', 'prefer-not-to-say'] }),
    __metadata("design:type", String)
], UserProfile.prototype, "gender", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserProfile.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
    }),
    __metadata("design:type", Object)
], UserProfile.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            website: String,
            twitter: String,
            linkedin: String,
            github: String,
        },
    }),
    __metadata("design:type", Object)
], UserProfile.prototype, "socialLinks", void 0);
exports.UserProfile = UserProfile = __decorate([
    (0, mongoose_1.Schema)()
], UserProfile);
let UserPreferences = class UserPreferences {
    theme;
    language;
    timezone;
    pushNotifications;
};
exports.UserPreferences = UserPreferences;
__decorate([
    (0, mongoose_1.Prop)({ enum: ['light', 'dark', 'system'], default: 'system' }),
    __metadata("design:type", String)
], UserPreferences.prototype, "theme", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'en' }),
    __metadata("design:type", String)
], UserPreferences.prototype, "language", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'UTC' }),
    __metadata("design:type", String)
], UserPreferences.prototype, "timezone", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            enabled: { type: Boolean, default: true },
            sound: { type: Boolean, default: true },
            vibration: { type: Boolean, default: true },
        },
    }),
    __metadata("design:type", Object)
], UserPreferences.prototype, "pushNotifications", void 0);
exports.UserPreferences = UserPreferences = __decorate([
    (0, mongoose_1.Schema)()
], UserPreferences);
let User = class User {
    password;
    previousPasswords;
    passwordChangedAt;
    failedLoginAttempts;
    lockedUntil;
    lastPasswordResetRequest;
    passwordResetToken;
    passwordResetExpires;
    passwordResetAttempts;
    username;
    firstName;
    lastName;
    avatar;
    nisn;
    points;
    roles;
    classId;
    isArchived;
    lastLoginAt;
    profile;
    preferences;
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], select: false, default: [] }),
    __metadata("design:type", Array)
], User.prototype, "previousPasswords", void 0);
__decorate([
    (0, mongoose_1.Prop)({ select: false }),
    __metadata("design:type", Date)
], User.prototype, "passwordChangedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, select: false }),
    __metadata("design:type", Number)
], User.prototype, "failedLoginAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ select: false }),
    __metadata("design:type", Date)
], User.prototype, "lockedUntil", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], User.prototype, "lastPasswordResetRequest", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, select: false, required: false }),
    __metadata("design:type", Object)
], User.prototype, "passwordResetToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false, required: false }),
    __metadata("design:type", Object)
], User.prototype, "passwordResetExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, select: false }),
    __metadata("design:type", Number)
], User.prototype, "passwordResetAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ unique: true, sparse: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)({ unique: true, sparse: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "nisn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Class', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "classId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isArchived", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: UserProfile }),
    __metadata("design:type", UserProfile)
], User.prototype, "profile", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: UserPreferences }),
    __metadata("design:type", UserPreferences)
], User.prototype, "preferences", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ username: 1 }, { unique: true, sparse: true });
exports.UserSchema.index({ nisn: 1 }, { unique: true });
exports.UserSchema.index({ classId: 1 });
exports.UserSchema.index({ roles: 1 });
exports.UserSchema.index({ isArchived: 1 });
exports.UserSchema.index({ createdAt: -1 });
exports.UserSchema.index({ classId: 1, isArchived: 1 });
exports.UserSchema.index({ roles: 1, isArchived: 1 });
exports.UserSchema.index({ isArchived: 1, createdAt: -1 });
exports.UserSchema.index({ classId: 1, roles: 1 });
exports.UserSchema.index({ nisn: 1, isArchived: 1 });
exports.UserSchema.virtual('fullName').get(function () {
    const firstName = this.firstName || '';
    const lastName = this.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Anonymous User';
});
exports.UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const current = this.password;
    if (typeof current === 'string' && current.startsWith('$2')) {
        return next();
    }
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
    ;
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
exports.UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
exports.UserSchema.methods.isPasswordExpired = function (maxAgeDays) {
    if (!this.passwordChangedAt)
        return false;
    const expirationDate = new Date(this.passwordChangedAt);
    expirationDate.setDate(expirationDate.getDate() + maxAgeDays);
    return new Date() > expirationDate;
};
exports.UserSchema.methods.isLocked = function () {
    return this.lockedUntil && this.lockedUntil > new Date();
};
exports.UserSchema.methods.handleFailedLogin = async function (maxAttempts, lockoutMinutes) {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= maxAttempts) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + lockoutMinutes);
        this.lockedUntil = lockoutTime;
    }
    return this.save();
};
exports.UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});
//# sourceMappingURL=user.schema.js.map