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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AwardsService } from './awards.service';
import { CreateAwardDto, UpdateAwardDto, QueryAwardsDto } from './dto/index';
import { CurrentUser, AuthenticatedUser } from '../auth/current-user.decorator';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('awards')
@Controller('awards')
@UseGuards(JwtCookieAuthGuard)
@ApiBearerAuth()
export class AwardsController {
  constructor(private readonly awardsService: AwardsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'head_of_class', 'teacher')
  @ApiOperation({ summary: 'Create a new award' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Award created successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async create(
    @Body() createAwardDto: CreateAwardDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.awardsService.create(createAwardDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get all awards with filtering and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Awards retrieved successfully' })
  async findAll(@Query() query: QueryAwardsDto) {
    return this.awardsService.findAll(query);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head_of_class')
  @ApiOperation({ summary: 'Get award statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.awardsService.getStats();
  }

  @Get('templates')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head_of_class', 'teacher')
  @ApiOperation({ summary: 'Get award templates' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Templates retrieved successfully' })
  async getTemplates() {
    return this.awardsService.getTemplates();
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get award leaderboard' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leaderboard retrieved successfully' })
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.awardsService.getLeaderboard(limit);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student award summary' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Student awards retrieved successfully' })
  async getStudentSummary(@Param('studentId') studentId: string) {
    return this.awardsService.getStudentSummary(studentId);
  }

  @Get('recipient/:recipientId')
  @ApiOperation({ summary: 'Get awards by recipient ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recipient awards retrieved successfully' })
  async getAwardsByRecipient(@Param('recipientId') recipientId: string) {
    return this.awardsService.getStudentSummary(recipientId);
  }

  @Post('template/:templateId/create')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head_of_class', 'teacher')
  @ApiOperation({ summary: 'Create award from template' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Award created from template successfully' })
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body('recipientId') recipientId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.awardsService.createFromTemplate(templateId, recipientId, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get award by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Award retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Award not found' })
  async findOne(@Param('id') id: string) {
    return this.awardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head_of_class', 'teacher')
  @ApiOperation({ summary: 'Update an award' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Award updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Award not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async update(
    @Param('id') id: string,
    @Body() updateAwardDto: UpdateAwardDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.awardsService.update(id, updateAwardDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head_of_class', 'teacher')
  @ApiOperation({ summary: 'Revoke an award' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Award revoked successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Award not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.awardsService.remove(id, currentUser);
  }
}