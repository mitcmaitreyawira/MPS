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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppealsService } from './appeals.service';
import { CreateAppealDto, UpdateAppealDto, QueryAppealsDto } from './dto';
import { Appeal } from './entities/appeal.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('appeals')
@Controller('appeals')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppealsController {
  constructor(private readonly appealsService: AppealsService) {}

  @Post()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Create a new appeal' })
  @ApiResponse({
    status: 201,
    description: 'The appeal has been successfully created.',
    type: Appeal,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  create(@Body() createAppealDto: CreateAppealDto): Promise<Appeal> {
    return this.appealsService.create(createAppealDto);
  }

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get all appeals with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return all appeals.',
    type: [Appeal],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  findAll(@Query() query: QueryAppealsDto) {
    return this.appealsService.findAll(query);
  }

  @Get('stats')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get appeal statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return appeal statistics.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  getStats() {
    return this.appealsService.getStats();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get an appeal by id' })
  @ApiParam({ name: 'id', description: 'Appeal ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the appeal.',
    type: Appeal,
  })
  @ApiResponse({ status: 404, description: 'Appeal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  findOne(@Param('id') id: string): Promise<Appeal> {
    return this.appealsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update an appeal (including status changes)' })
  @ApiParam({ name: 'id', description: 'Appeal ID' })
  @ApiResponse({
    status: 200,
    description: 'The appeal has been successfully updated.',
    type: Appeal,
  })
  @ApiResponse({ status: 404, description: 'Appeal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  update(
    @Param('id') id: string,
    @Body() updateAppealDto: UpdateAppealDto,
  ): Promise<Appeal> {
    return this.appealsService.update(id, updateAppealDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an appeal' })
  @ApiParam({ name: 'id', description: 'Appeal ID' })
  @ApiResponse({
    status: 204,
    description: 'The appeal has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Appeal not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.appealsService.remove(id);
  }
}