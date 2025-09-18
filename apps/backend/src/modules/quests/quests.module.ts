import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestsService } from './quests.service';
import { QuestParticipantsService } from './quest-participants.service';
import { QuestsController } from './quests.controller';
import { QuestParticipantsController } from './quest-participants.controller';
import { CommonModule } from '../../common/common.module';
import { PointLogsModule } from '../points/point-logs.module';
import { Quest, QuestSchema } from '../../database/schemas/quest.schema';
import { QuestParticipant, QuestParticipantSchema } from '../../database/schemas/quest-participant.schema';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    PointLogsModule,
    MongooseModule.forFeature([
      { name: Quest.name, schema: QuestSchema },
      { name: QuestParticipant.name, schema: QuestParticipantSchema },
    ]),
  ],
  controllers: [QuestsController, QuestParticipantsController],
  providers: [QuestsService, QuestParticipantsService],
  exports: [QuestsService, QuestParticipantsService],
})
export class QuestsModule {}