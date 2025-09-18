import { PartialType } from '@nestjs/swagger';
import { CreateActionPresetDto } from './create-action-preset.dto';

export class UpdateActionPresetDto extends PartialType(CreateActionPresetDto) {}