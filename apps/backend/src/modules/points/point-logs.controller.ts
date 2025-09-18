import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PointLogsService } from './point-logs.service';
import {
  CreatePointLogDto,
  UpdatePointLogDto,
  QueryPointLogsDto,
  BulkCreatePointLogsDto,
} from './dto';
import { PointLog } from './entities/point-log.entity';

@ApiTags('point-logs')
@Controller('point-logs')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class PointLogsController {
  constructor(private readonly pointLogsService: PointLogsService) {}

  @Post()
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Create a new point log entry' })
  @ApiResponse({
    status: 201,
    description: 'Point log entry created successfully',
    type: PointLog,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createPointLogDto: CreatePointLogDto): Promise<PointLog> {
    return this.pointLogsService.create(createPointLogDto);
  }

  @Post('bulk')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Create multiple point log entries' })
  @ApiResponse({
    status: 201,
    description: 'Point log entries created successfully',
    type: [PointLog],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  bulkCreate(@Body() bulkCreatePointLogsDto: BulkCreatePointLogsDto): Promise<PointLog[]> {
    return this.pointLogsService.bulkCreate(bulkCreatePointLogsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all point log entries with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Point log entries retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/PointLog' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryPointLogsDto: QueryPointLogsDto) {
    return this.pointLogsService.findAll(queryPointLogsDto);
  }

  @Get('stats')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Get point log statistics' })
  @ApiResponse({
    status: 200,
    description: 'Point log statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalEntries: { type: 'number' },
        totalPointsAwarded: { type: 'number' },
        totalPointsDeducted: { type: 'number' },
        netPoints: { type: 'number' },
        entriesByType: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        entriesByCategory: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        badgesAwarded: { type: 'number' },
        averagePointsPerEntry: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStats() {
    return this.pointLogsService.getStats();
  }

  @Get('student/:studentId/summary')
  @ApiOperation({ summary: 'Get point summary for a specific student' })
  @ApiResponse({
    status: 200,
    description: 'Student point summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        totalPoints: { type: 'number' },
        pointsAwarded: { type: 'number' },
        pointsDeducted: { type: 'number' },
        totalEntries: { type: 'number' },
        entriesByType: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        entriesByCategory: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        badges: {
          type: 'array',
          items: { $ref: '#/components/schemas/Badge' },
        },
        recentEntries: {
          type: 'array',
          items: { $ref: '#/components/schemas/PointLog' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  getStudentSummary(@Param('studentId') studentId: string) {
    return this.pointLogsService.getStudentSummary(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a point log entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Point log entry retrieved successfully',
    type: PointLog,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Point log entry not found' })
  findOne(@Param('id') id: string): Promise<PointLog> {
    return this.pointLogsService.findOne(id);
  }

  @Patch(':id')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Update a point log entry' })
  @ApiResponse({
    status: 200,
    description: 'Point log entry updated successfully',
    type: PointLog,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Point log entry not found' })
  update(
    @Param('id') id: string,
    @Body() updatePointLogDto: UpdatePointLogDto,
  ): Promise<PointLog> {
    return this.pointLogsService.update(id, updatePointLogDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a point log entry' })
  @ApiResponse({ status: 204, description: 'Point log entry deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Point log entry not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.pointLogsService.remove(id);
  }
}