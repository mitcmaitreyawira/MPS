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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    create(createNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }
    findAll(query) {
        return this.notificationsService.findAll(query);
    }
    getUnreadCount(userId) {
        return this.notificationsService.getUnreadCount(userId);
    }
    findOne(id) {
        return this.notificationsService.findOne(id);
    }
    update(id, updateNotificationDto) {
        return this.notificationsService.update(id, updateNotificationDto);
    }
    markAsRead(id) {
        return this.notificationsService.markAsRead(id);
    }
    markAllAsReadForUser(userId) {
        return this.notificationsService.markAllAsReadForUser(userId);
    }
    remove(id) {
        return this.notificationsService.remove(id);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new notification' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Notification created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateNotificationDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all notifications with filtering and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String, description: 'Filter by user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search in message content' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String, description: 'Sort field' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notifications retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryNotificationsDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread-count/:userId'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notification count for a user' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Unread notification count retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific notification by ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notification retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Notification not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a notification' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notification updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Notification not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateNotificationDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/mark-read'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a notification as read' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notification marked as read successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Notification not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read/:userId'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read for a user' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'All notifications marked as read successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsReadForUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a notification' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notification deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Notification not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Insufficient permissions',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "remove", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map