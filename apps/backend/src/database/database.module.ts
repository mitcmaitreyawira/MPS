import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './schemas/user.schema';
import { Class, ClassSchema } from './schemas/class.schema';
import { ActionPreset, ActionPresetSchema } from './schemas/action-preset.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { Award, AwardSchema } from './schemas/award.schema';

import { PointLog, PointLogSchema } from './schemas/point-log.schema';
import { Quest, QuestSchema } from './schemas/quest.schema';
import { QuestParticipant, QuestParticipantSchema } from './schemas/quest-participant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Class.name, schema: ClassSchema },
      { name: ActionPreset.name, schema: ActionPresetSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Award.name, schema: AwardSchema },

      { name: PointLog.name, schema: PointLogSchema },
      { name: Quest.name, schema: QuestSchema },
      { name: QuestParticipant.name, schema: QuestParticipantSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}