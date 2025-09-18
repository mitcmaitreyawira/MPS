import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppealsService } from './appeals.service';
import { AppealsController } from './appeals.controller';
import { CommonModule } from '../../common/common.module';
import { Appeal, AppealSchema } from '../../database/schemas/appeal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appeal.name, schema: AppealSchema }]),
    JwtModule,
    CommonModule,
  ],
  controllers: [AppealsController],
  providers: [AppealsService],
  exports: [AppealsService],
})
export class AppealsModule {}