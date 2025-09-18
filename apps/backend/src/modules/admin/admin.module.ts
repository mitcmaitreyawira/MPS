import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Award, AwardSchema } from '../../database/schemas/award.schema';
import { Class, ClassSchema } from '../../database/schemas/class.schema';
import { PointLog, PointLogSchema } from '../../database/schemas/point-log.schema';
import { Quest, QuestSchema } from '../../database/schemas/quest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Award.name, schema: AwardSchema },
      { name: Class.name, schema: ClassSchema },
      { name: PointLog.name, schema: PointLogSchema },
      { name: Quest.name, schema: QuestSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}