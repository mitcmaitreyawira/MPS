import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AwardsService } from './awards.service';
import { AwardsController } from './awards.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AwardsController],
  providers: [AwardsService],
  exports: [AwardsService],
})
export class AwardsModule {}