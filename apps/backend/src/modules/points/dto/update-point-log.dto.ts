import { PartialType } from '@nestjs/swagger';
import { CreatePointLogDto } from './create-point-log.dto';

export class UpdatePointLogDto extends PartialType(CreatePointLogDto) {}