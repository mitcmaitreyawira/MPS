import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePointLogDto } from './create-point-log.dto';

export class BulkCreatePointLogsDto {
  @ApiProperty({
    description: 'Array of point logs to create',
    type: [CreatePointLogDto],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreatePointLogDto)
  pointLogs: CreatePointLogDto[];
}