import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to send notification to' })
  @IsNotEmpty()
  @IsMongoId()
  @Transform(({ value }) => new Types.ObjectId(value))
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Notification message' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Whether the notification is read', default: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean = false;

  @ApiPropertyOptional({ description: 'Notification timestamp', default: 'Current date' })
  @IsOptional()
  timestamp?: Date;
}