import { IsString, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ description: 'Class name', example: 'Grade 10A' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Head teacher ID (MongoDB ObjectId)' })
  @IsOptional()
  @IsMongoId({ message: 'Head teacher ID must be a valid MongoDB ObjectId' })
  headTeacherId?: string;
}