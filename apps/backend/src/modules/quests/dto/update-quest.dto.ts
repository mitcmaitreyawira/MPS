import { PartialType } from '@nestjs/swagger';
import { CreateQuestDto } from './create-quest.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuestDto extends PartialType(CreateQuestDto) {
  @ApiPropertyOptional({
    description: 'Whether the quest is currently active',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}