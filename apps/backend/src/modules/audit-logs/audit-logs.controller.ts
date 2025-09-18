import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { AuditLog } from './entities/audit-log.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new audit log entry' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Audit log created successfully',
    type: AuditLog,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @Req() req: Request,
  ): Promise<AuditLog> {
    const user = (req as any).user;
    return this.auditLogsService.create(
      createAuditLogDto,
      user.id,
      user.email || user.name || 'Unknown User',
    );
  }

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get audit logs with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        logs: {
          type: 'array',
          items: { $ref: '#/components/schemas/AuditLog' },
        },
        total: { type: 'number' },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async findAll(@Query() query: QueryAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }
}