import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsMongoId } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class QueryNotificationsDto {
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

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  userId?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Filter by read status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Search in message content' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort field', default: 'timestamp' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}