import { Model } from 'mongoose';
import { CreateQuestDto, UpdateQuestDto, QueryQuestsDto } from './dto';
import { Quest } from './entities/quest.entity';
import { QuestDocument as QuestDoc } from '../../database/schemas/quest.schema';
import { QuestParticipantDocument } from '../../database/schemas/quest-participant.schema';
export declare class QuestsService {
    private questModel;
    private questParticipantModel;
    constructor(questModel: Model<QuestDoc>, questParticipantModel: Model<QuestParticipantDocument>);
    findAll(query: QueryQuestsDto): Promise<{
        quests: Quest[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Quest>;
    create(createQuestDto: CreateQuestDto): Promise<Quest>;
    update(id: string, updateQuestDto: UpdateQuestDto): Promise<Quest>;
    remove(id: string): Promise<void>;
    getStats(): Promise<{
        total: number;
        active: number;
        expired: number;
    }>;
    private transformToEntity;
}
//# sourceMappingURL=quests.service.d.ts.map