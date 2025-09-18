import { Request } from 'express';
import { QuestParticipantsService } from './quest-participants.service';
import { PointLogsService } from '../points/point-logs.service';
import { QuestsService } from './quests.service';
import { ReviewQuestDto, JoinQuestDto, SubmitQuestDto } from './dto';
import { QuestParticipant } from './entities/quest-participant.entity';
import { PointLog } from '../points/entities/point-log.entity';
export declare class QuestParticipantsController {
    private readonly questParticipantsService;
    private readonly pointLogsService;
    private readonly questsService;
    constructor(questParticipantsService: QuestParticipantsService, pointLogsService: PointLogsService, questsService: QuestsService);
    joinQuest(questId: string, joinQuestDto: JoinQuestDto, req: Request): Promise<QuestParticipant>;
    submitQuest(questId: string, submitQuestDto: SubmitQuestDto, req: Request): Promise<QuestParticipant>;
    reviewQuest(questId: string, reviewQuestDto: ReviewQuestDto, req: Request): Promise<{
        updatedParticipant: QuestParticipant;
        pointLog: PointLog | null;
    }>;
}
//# sourceMappingURL=quest-participants.controller.d.ts.map