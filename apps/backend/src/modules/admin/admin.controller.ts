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
        confirmDeletion: {
          type: 'string',
          description: 'Must be "yes-i-know" to confirm this dangerous operation',
          example: 'yes-i-know'
        },
      },
      required: ['userIds', 'confirmDeletion'],
    },
  })
  @ApiResponse({ status: 200, description: 'Users deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async bulkDeleteUsers(@Body() body: { userIds: string[]; confirmDeletion: string }): Promise<{ deletedCount: number }> {
    if (body.confirmDeletion !== 'yes-i-know') {
      throw new Error('Safety guard: confirmDeletion must be "yes-i-know" to proceed with this dangerous operation');
    }
    this.logger.warn(`Admin bulk delete users requested for ${body.userIds.length} users`);
    return this.adminService.bulkDeleteUsers(body.userIds);
  }

  @Post('badge/:badgeId/delete')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 60000, maxRequests: 10 }) // 10 requests per minute
  @ApiOperation({
    summary: 'Delete Badge (DANGEROUS)',
    description: 'Permanently delete a badge and revoke it from all users.',
  })
  @ApiParam({ name: 'badgeId', description: 'Badge ID to delete' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        confirmDeletion: {
          type: 'string',
          description: 'Must be "yes-i-know" to confirm this dangerous operation',
          example: 'yes-i-know'
        },
      },
      required: ['confirmDeletion'],
    },
  })
  @ApiResponse({ status: 200, description: 'Badge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async deleteBadge(
    @Param('badgeId') badgeId: string,
    @Body() body: { confirmDeletion: string }
  ): Promise<{ deletedBadge: string; affectedUsers: number }> {
    if (body.confirmDeletion !== 'yes-i-know') {
      throw new Error('Safety guard: confirmDeletion must be "yes-i-know" to proceed with this dangerous operation');
    }
    this.logger.warn(`Admin delete badge requested: ${badgeId}`);
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        confirmReset: {
          type: 'string',
          description: 'Must be "yes-i-know-this-is-destructive" to confirm this nuclear operation',
          example: 'yes-i-know-this-is-destructive'
        },
      },
      required: ['confirmReset'],
    },
  })
  @ApiResponse({ status: 200, description: 'Emergency reset completed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async emergencySystemReset(@Body() body: { confirmReset: string }): Promise<{ message: string; timestamp: string }> {
    if (body.confirmReset !== 'yes-i-know-this-is-destructive') {
      throw new Error('Safety guard: confirmReset must be "yes-i-know-this-is-destructive" to proceed with this nuclear operation');
    }
    this.logger.error('EMERGENCY SYSTEM RESET REQUESTED');
    return this.adminService.emergencySystemReset();
  }
}