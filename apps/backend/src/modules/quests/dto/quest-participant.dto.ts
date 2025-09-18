import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class ReviewQuestDto {
  @ApiProperty({
    description: 'ID of the student whose quest submission is being reviewed',
    example: 'student123'
  })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({
    description: 'Whether the quest submission is approved',
    example: true
  })
  @IsBoolean()
  isApproved!: boolean;

  @ApiProperty({
    description: 'Optional review notes from the supervisor',
    example: 'Great work on this quest!',
    required: false
  })
  @IsString()
  @IsOptional()
  reviewNotes?: string;
}

export class JoinQuestDto {
  // No additional fields needed - questId comes from URL params
  // studentId will be extracted from authenticated user
}

export class SubmitQuestDto {
  // No additional fields needed - questId comes from URL params
  // studentId will be extracted from authenticated user
}