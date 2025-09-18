import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PointLogsService } from './point-logs.service';
import { CreatePointLogDto } from './dto';
import { PointLog } from './entities/point-log.entity';

@ApiTags('points')
@Controller('points')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class PointsController {
  constructor(private readonly pointLogsService: PointLogsService) {}

  @Post()
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Create a new point entry (alias for point-logs)' })
  @ApiResponse({
    status: 201,
    description: 'Point entry created successfully',
    type: PointLog,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createPointLogDto: CreatePointLogDto): Promise<PointLog> {
    return this.pointLogsService.create(createPointLogDto);
  }
}