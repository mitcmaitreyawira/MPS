import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAppealDto } from './create-appeal.dto';
import { AppealStatus } from '../entities/appeal.entity';

export class UpdateAppealDto extends PartialType(CreateAppealDto) {
  @ApiProperty({
    description: 'Status of the appeal',
    enum: AppealStatus,
    example: AppealStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppealStatus)
  status?: AppealStatus;

  @ApiProperty({
    description: 'ID of the user who reviewed the appeal',
    example: '507f1f77bcf86cd799439013',
    required: false,
  })
  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @ApiProperty({
    description: 'Review notes or response to the appeal',
    example: 'Appeal approved. Points have been restored.',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNotes?: string;
}