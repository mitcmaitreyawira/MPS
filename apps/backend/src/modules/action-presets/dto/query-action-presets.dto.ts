import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActionType } from '../../../database/schemas/action-preset.schema';

export class QueryActionPresetsDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ActionType, description: 'Filter by action type' })
  @IsOptional()
  @IsEnum(ActionType)
  type?: ActionType;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by archived status', default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isArchived?: boolean = false;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}