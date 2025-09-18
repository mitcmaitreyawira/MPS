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
import { QuestsService } from './quests.service';
import { CreateQuestDto, UpdateQuestDto, QueryQuestsDto } from './dto';
import { Quest } from './entities/quest.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('quests')
@Controller('quests')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new quest' })
  @ApiResponse({
    status: 201,
    description: 'The quest has been successfully created.',
    type: Quest,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  create(@Body() createQuestDto: CreateQuestDto): Promise<Quest> {
    return this.questsService.create(createQuestDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all quests with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return all quests.',
    type: [Quest],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  findAll(@Query() query: QueryQuestsDto) {
    return this.questsService.findAll(query);
  }

  @Get('stats')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get quest statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return quest statistics.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  getStats() {
    return this.questsService.getStats();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a quest by id' })
  @ApiParam({ name: 'id', description: 'Quest ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the quest.',
    type: Quest,
  })
  @ApiResponse({ status: 404, description: 'Quest not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  findOne(@Param('id') id: string): Promise<Quest> {
    return this.questsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a quest' })
  @ApiParam({ name: 'id', description: 'Quest ID' })
  @ApiResponse({
    status: 200,
    description: 'The quest has been successfully updated.',
    type: Quest,
  })
  @ApiResponse({ status: 404, description: 'Quest not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  update(
    @Param('id') id: string,
    @Body() updateQuestDto: UpdateQuestDto,
  ): Promise<Quest> {
    return this.questsService.update(id, updateQuestDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a quest' })
  @ApiParam({ name: 'id', description: 'Quest ID' })
  @ApiResponse({
    status: 204,
    description: 'The quest has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Quest not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.questsService.remove(id);
  }
}