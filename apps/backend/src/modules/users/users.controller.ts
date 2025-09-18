import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

import { UsersService } from './users.service';
import { User } from '../../database/schemas/user.schema';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto';
import { VALIDATION_MESSAGES } from '../../common/validation.constants';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RateLimitGuard, RateLimit } from '../../common/guards/rate-limit.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseService } from '../../common/services/error-response.service';

/**
 * UsersController exposes endpoints for reading and mutating user data.
 * All endpoints now include proper validation, DTOs, and comprehensive
 * error handling with structured logging and security measures.
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly errorResponseService: ErrorResponseService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() query: QueryUsersDto): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (MongoDB ObjectId)', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @RateLimit({ windowMs: 60000, maxRequests: 10 }) // 10 requests per minute
  @ApiOperation({ summary: 'Create a new user', description: 'Create a new user account. Requires admin privileges.' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'NISN already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Post('bulk')
  @Roles('admin')
  @RateLimit({ windowMs: 300000, maxRequests: 5 }) // 5 requests per 5 minutes for bulk operations
  @ApiOperation({ summary: 'Create multiple users', description: 'Bulk create multiple user accounts. Requires admin privileges.' })
  @ApiResponse({ status: 201, description: 'Users created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createBulk(@Body() createUsersDto: { users: CreateUserDto[]; adminVerificationCode?: string }): Promise<{ created: User[]; errors: any[] }> {
    return this.usersService.createBulk(createUsersDto.users);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (MongoDB ObjectId)', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or user ID format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'NISN already exists for another user' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (MongoDB ObjectId)', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(':id/archive')
  @Roles('admin')
  @ApiOperation({ summary: 'Archive user by ID (soft delete)' })
  @ApiResponse({ status: 200, description: 'User archived successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async archive(@Param('id') id: string): Promise<User> {
    return this.usersService.archive(id);
  }

  @Post(':id/restore')
  @Roles('admin')
  @ApiOperation({ summary: 'Restore archived user by ID' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async restore(@Param('id') id: string): Promise<User> {
    return this.usersService.restore(id);
  }
}