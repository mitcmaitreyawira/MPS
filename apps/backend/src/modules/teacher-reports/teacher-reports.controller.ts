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
  HttpCode,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherReportsService } from './teacher-reports.service';
import { CreateTeacherReportDto, UpdateTeacherReportDto, QueryTeacherReportsDto } from './dto';
import { TeacherReport, ReportStatus } from './entities/teacher-report.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('teacher-reports')
@Controller('teacher-reports')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeacherReportsController {
  constructor(private readonly teacherReportsService: TeacherReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new teacher report' })
  @ApiResponse({
    status: 201,
    description: 'Teacher report created successfully',
    type: TeacherReport
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles('student', 'teacher', 'admin')
  async create(
    @Body() createTeacherReportDto: CreateTeacherReportDto,
    @Req() req: Request
  ): Promise<TeacherReport> {
    // Extract user ID from JWT token and add to DTO
    const submittedByUserId = (req as any).user?.sub;
    const reportWithUserId = {
      ...createTeacherReportDto,
      submittedByUserId
    };
    return this.teacherReportsService.create(reportWithUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teacher reports with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Teacher reports retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TeacherReport' }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'teacher')
  async findAll(@Query() query: QueryTeacherReportsDto) {
    return this.teacherReportsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get teacher report statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: {
          type: 'object',
          additionalProperties: { type: 'number' }
        },
        byTeacher: {
          type: 'object',
          additionalProperties: { type: 'number' }
        },
        recentReports: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin')
  async getStats() {
    return this.teacherReportsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a teacher report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher report retrieved successfully',
    type: TeacherReport
  })
  @ApiResponse({ status: 404, description: 'Teacher report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'teacher')
  async findOne(@Param('id') id: string): Promise<TeacherReport> {
    return this.teacherReportsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a teacher report' })
  @ApiResponse({
    status: 200,
    description: 'Teacher report updated successfully',
    type: TeacherReport
  })
  @ApiResponse({ status: 404, description: 'Teacher report not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateTeacherReportDto: UpdateTeacherReportDto
  ): Promise<TeacherReport> {
    return this.teacherReportsService.update(id, updateTeacherReportDto);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Mark a teacher report as reviewed' })
  @ApiResponse({
    status: 200,
    description: 'Teacher report marked as reviewed successfully',
    type: TeacherReport
  })
  @ApiResponse({ status: 404, description: 'Teacher report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin')
  async review(@Param('id') id: string): Promise<TeacherReport> {
    return this.teacherReportsService.update(id, {
      status: ReportStatus.REVIEWED,
      reviewedAt: new Date()
    } as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a teacher report' })
  @ApiResponse({ status: 204, description: 'Teacher report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Teacher report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.teacherReportsService.remove(id);
  }
}