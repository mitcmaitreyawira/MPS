import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/current-user.decorator';

@ApiTags('Dashboards')
@Controller('dashboards')
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get('admin')
  @Roles('admin')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiQuery({ name: 'year', required: false, description: 'Academic year filter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getAdminDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year') year?: string,
  ) {
    return this.dashboardsService.getAdminDashboard(user, year);
  }

  @Get('teacher')
  @Roles('teacher', 'head_of_class', 'admin')
  @ApiOperation({ summary: 'Get teacher dashboard data' })
  @ApiQuery({ name: 'year', required: false, description: 'Academic year filter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getTeacherDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year') year?: string,
  ) {
    return this.dashboardsService.getTeacherDashboard(user, year);
  }

  @Get('student')
  @Roles('student', 'admin')
  @ApiOperation({ summary: 'Get student dashboard data' })
  @ApiQuery({ name: 'year', required: false, description: 'Academic year filter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Student dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getStudentDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year') year?: string,
  ) {
    return this.dashboardsService.getStudentDashboard(user, year);
  }

  @Get('parent')
  @Roles('parent', 'admin')
  @ApiOperation({ summary: 'Get parent dashboard data' })
  @ApiQuery({ name: 'year', required: false, description: 'Academic year filter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Parent dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getParentDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year') year?: string,
  ) {
    return this.dashboardsService.getParentDashboard(user, year);
  }
}