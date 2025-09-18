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
exports.ClassesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const classes_service_1 = require("./classes.service");
const create_class_dto_1 = require("./dto/create-class.dto");
const update_class_dto_1 = require("./dto/update-class.dto");
const query_classes_dto_1 = require("./dto/query-classes.dto");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ClassesController = class ClassesController {
    classesService;
    constructor(classesService) {
        this.classesService = classesService;
    }
    async create(createClassDto) {
        return this.classesService.create(createClassDto);
    }
    async findAll(query) {
        return this.classesService.findAll(query);
    }
    async findOne(id) {
        return this.classesService.findOne(id);
    }
    async update(id, updateClassDto) {
        return this.classesService.update(id, updateClassDto);
    }
    async remove(id) {
        return this.classesService.remove(id);
    }
};
exports.ClassesController = ClassesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new class' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Class created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Class with this name already exists.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_dto_1.CreateClassDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all classes with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Classes retrieved successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_classes_dto_1.QueryClassesDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a class by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Class retrieved successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Class not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a class' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Class updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Class not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Class with this name already exists.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_dto_1.UpdateClassDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a class' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Class deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Class not found.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "remove", null);
exports.ClassesController = ClassesController = __decorate([
    (0, swagger_1.ApiTags)('classes'),
    (0, common_1.Controller)('classes'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [classes_service_1.ClassesService])
], ClassesController);
//# sourceMappingURL=classes.controller.js.map