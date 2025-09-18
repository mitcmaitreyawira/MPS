import { IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'The action that was performed',
    example: 'CREATE_CLASS'
  })
  @IsString()
  action!: string;

  @ApiProperty({
    description: 'Additional details about the action',
    example: { className: 'Math 101', teacherId: 'teacher123' }
  })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;
}