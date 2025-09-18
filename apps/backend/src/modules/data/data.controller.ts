import { Body, Controller, Get, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, IsNumber, IsOptional, IsDefined, IsObject } from 'class-validator';
import { UsersService } from '../users/users.service';
import { PointLogsService } from '../points/point-logs.service';
import { ActionPresetsService } from '../action-presets/action-presets.service';
import { BulkCreatePointLogsDto, CreatePointLogDto } from '../points/dto';
import { PointType, BadgeTier } from '../points/entities/point-log.entity';
import { JwtCookieAuthGuard } from '../auth/jwt-cookie.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/current-user.decorator';

// --- DTOs for bulk action body ---
class PointsActionDto {
  @IsIn(['points'])
  type!: 'points';

  @IsNumber()
  points!: number;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  academicYear?: string;
}

class BadgeActionDto {
  @IsIn(['badge'])
  type!: 'badge';

  @IsString()
  @IsNotEmpty()
  presetId!: string;

  @IsOptional()
  @IsString()
  academicYear?: string;
}

class BulkActionBodyDto {
  @IsString()
  @IsNotEmpty()
  classId!: string;

  // Accept either PointsActionDto or BadgeActionDto; validation handled in handler
  @IsDefined()
  @IsObject()
  action!: PointsActionDto | BadgeActionDto;
}

/**
 * DataController provides endpoints for general data that doesn't fit into specific modules.
 * This includes academic years, system configuration, and other utility data.
 */
@ApiTags('Data')
@ApiExtraModels(PointsActionDto, BadgeActionDto)
@Controller('data')
export class DataController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pointLogsService: PointLogsService,
    private readonly actionPresetsService: ActionPresetsService,
  ) {}

  @Get('academic-years')
  @ApiOperation({ summary: 'Get available academic years', description: 'Retrieve list of available academic years for filtering data.' })
  @ApiResponse({ status: 200, description: 'Academic years retrieved successfully', type: [String] })
  getAcademicYears(): string[] {
    // Generate academic years based on current date
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11
    
    // Assuming school year starts in July (month 6)
    const currentAcademicYear = currentMonth >= 6 
      ? `${currentYear}/${currentYear + 1}` 
      : `${currentYear - 1}/${currentYear}`;
    
    // Return current year and previous 3 years
    const years: string[] = [];
    for (let i = 0; i < 4; i++) {
      const year = currentYear - i;
      const academicYear = currentMonth >= 6 
        ? `${year}/${year + 1}` 
        : `${year - 1}/${year}`;
      years.push(academicYear);
    }
    
    return years.sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)
  }

  @Post('bulk-action')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Apply a bulk action to a class', description: 'Apply points or a preset badge to all students in the specified class.' })
  @ApiResponse({ status: 201, description: 'Bulk action applied successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        classId: { type: 'string' },
        action: {
          oneOf: [
            { $ref: getSchemaPath(PointsActionDto) },
            { $ref: getSchemaPath(BadgeActionDto) },
          ],
          discriminator: { propertyName: 'type' },
        },
      },
      required: ['classId', 'action'],
    },
  })
  async bulkAction(@Body() body: BulkActionBodyDto, @CurrentUser() user: AuthenticatedUser) {
    const { classId, action } = body as any;

    // Fetch class students (non-archived)
    const users = await this.usersService.findByClassId(classId);
    if (!users.length) {
      return { created: 0, message: 'No active users found in class' };
    }

    // Determine academic year if not supplied
    const academicYear = (action as any).academicYear || this.getAcademicYears()[0];

    const pointLogs: CreatePointLogDto[] = [];

    const addedByUserId = user?.id || 'system';

    // Runtime validation for discriminated union to satisfy whitelist/forbid flags
    if (!action || typeof action !== 'object' || typeof (action as any).type !== 'string') {
      throw new BadRequestException('action.type is required and must be a string');
    }
    if ((action as any).type === 'points') {
      const act = action as PointsActionDto as any;
      if (typeof act.points !== 'number') throw new BadRequestException('action.points must be a number');
      if (!act.category || typeof act.category !== 'string') throw new BadRequestException('action.category is required');
      if (!act.description || typeof act.description !== 'string') throw new BadRequestException('action.description is required');
    } else if ((action as any).type === 'badge') {
      const act = action as BadgeActionDto as any;
      if (!act.presetId || typeof act.presetId !== 'string') throw new BadRequestException('action.presetId is required');
    } else {
      throw new BadRequestException(`Unsupported action.type: ${(action as any).type}`);
    }

    if (action.type === 'points') {
      const act = action as PointsActionDto;
      for (const u of users) {
        pointLogs.push({
          studentId: (u as any)._id?.toString?.() || (u as any).id,
          points: act.points,
          type: act.points >= 0 ? PointType.REWARD : PointType.VIOLATION,
          category: act.category,
          description: act.description,
          addedBy: addedByUserId,
          academicYear,
        });
      }
    } else if (action.type === 'badge') {
      const act = action as BadgeActionDto;
      const preset = await this.actionPresetsService.findOne(act.presetId);

      // Map preset type to PointType
      const typeMap: Record<string, PointType> = {
        reward: PointType.REWARD,
        violation: PointType.VIOLATION,
        medal: PointType.REWARD,
      };
      const mappedType = typeMap[(preset as any).type] || PointType.REWARD;

      for (const u of users) {
        pointLogs.push({
          studentId: (u as any)._id?.toString?.() || (u as any).id,
          points: preset.points,
          type: mappedType,
          category: preset.category,
          description: preset.description,
          addedBy: user.id,
          academicYear,
          badge: preset.badgeTier
            ? {
              id: preset._id?.toString?.() || 'preset',
              tier: (preset.badgeTier as any) as BadgeTier,
              reason: preset.name,
              awardedBy: user.id,
              awardedOn: new Date(),
              icon: preset.icon,
            }
            : undefined,
        });
      }
    }

    const created = await this.pointLogsService.bulkCreate({ pointLogs } as BulkCreatePointLogsDto);
    return { created: created.length };
  }
}