import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RateLimit } from '../../common/guards/rate-limit.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

/**
 * AdminController handles dangerous administrative operations
 * These endpoints are restricted to admin users only and include
 * destructive operations that should be used with extreme caution.
 */
@ApiTags('Admin - Restricted Operations')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Post('bulk-delete-users')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 300000, maxRequests: 2 }) // 2 requests per 5 minutes
  @ApiOperation({
    summary: 'Bulk delete users (DANGEROUS)',
    description: 'Permanently delete multiple users. This action cannot be undone.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of user IDs to delete',
        },
      },
      required: ['userIds'],
    },
  })
  @ApiResponse({ status: 200, description: 'Users deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async bulkDeleteUsers(@Body() body: { userIds: string[] }): Promise<{ deletedCount: number }> {
    this.logger.warn(`Admin bulk delete users requested for ${body.userIds.length} users`);
    return this.adminService.bulkDeleteUsers(body.userIds);
  }

  @Delete('badge/:badgeId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 60000, maxRequests: 10 }) // 10 requests per minute
  @ApiOperation({
    summary: 'Delete Badge (DANGEROUS)',
    description: 'Permanently delete a badge and revoke it from all users.',
  })
  @ApiParam({ name: 'badgeId', description: 'Badge ID to delete' })
  @ApiResponse({ status: 200, description: 'Badge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async deleteBadge(@Param('badgeId') badgeId: string): Promise<{ deletedBadge: string; affectedUsers: number }> {
    this.logger.warn(`Admin delete badge requested for badge: ${badgeId}`);
    return this.adminService.deleteBadge(badgeId);
  }



  @Post('emergency-reset')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 3600000, maxRequests: 1 }) // 1 request per hour
  @ApiOperation({
    summary: 'Emergency system reset (NUCLEAR OPTION)',
    description: 'Emergency system reset. This will reset most system data. USE ONLY IN EMERGENCIES.',
  })
  @ApiResponse({ status: 200, description: 'Emergency reset completed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async emergencySystemReset(): Promise<{ message: string; timestamp: string }> {
    this.logger.error('NUCLEAR OPTION: Emergency system reset requested');
    return this.adminService.emergencySystemReset();
  }
}