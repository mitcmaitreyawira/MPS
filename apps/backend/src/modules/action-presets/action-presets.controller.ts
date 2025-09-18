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
import { ActionPresetsService } from './action-presets.service';
import { CreateActionPresetDto, UpdateActionPresetDto, QueryActionPresetsDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TokenPayload } from '@template/shared';
import { Types } from 'mongoose';

@ApiTags('Action Presets')
@Controller('action-presets')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActionPresetsController {
  constructor(private readonly actionPresetsService: ActionPresetsService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new action preset' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Action preset created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Action preset with this name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  create(
    @Body() createActionPresetDto: CreateActionPresetDto,
    @CurrentUser() user: TokenPayload
  ) {
    const presetWithCreator = {
      ...createActionPresetDto,
      createdBy: new Types.ObjectId(user.sub)
    };
    return this.actionPresetsService.create(presetWithCreator);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all action presets with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or description' })
  @ApiQuery({ name: 'type', required: false, enum: ['POSITIVE', 'NEGATIVE'], description: 'Filter by action type' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'isArchived', required: false, type: Boolean, description: 'Filter by archived status' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Action presets retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  findAll(@Query() query: QueryActionPresetsDto) {
    return this.actionPresetsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a specific action preset by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Action preset retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Action preset not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  findOne(@Param('id') id: string) {
    return this.actionPresetsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update an action preset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Action preset updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Action preset not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Action preset with this name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  update(@Param('id') id: string, @Body() updateActionPresetDto: UpdateActionPresetDto) {
    return this.actionPresetsService.update(id, updateActionPresetDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an action preset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Action preset deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Action preset not found',
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
    return this.actionPresetsService.remove(id);
  }
}