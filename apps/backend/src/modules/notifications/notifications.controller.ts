import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto, QueryNotificationsDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification created successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all notifications with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in message content' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notifications retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  findAll(@Query() query: QueryNotificationsDto) {
    return this.notificationsService.findAll(query);
  }

  @Get('unread-count/:userId')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get unread notification count for a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unread notification count retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a specific notification by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(':id/mark-read')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marked as read successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-read/:userId')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All notifications marked as read successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  markAllAsReadForUser(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsReadForUser(userId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}