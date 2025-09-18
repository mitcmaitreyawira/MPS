import { IsOptional, IsString, IsInt, Min, Max, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryClassesDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for class name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by head teacher ID' })
  @IsOptional()
  @IsMongoId({ message: 'Head teacher ID must be a valid MongoDB ObjectId' })
  headTeacherId?: string;

  @ApiPropertyOptional({ description: 'Sort field', enum: ['createdAt', 'updatedAt', 'name'] })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'name'], {
    message: 'Invalid sort field'
  })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort order must be asc or desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}