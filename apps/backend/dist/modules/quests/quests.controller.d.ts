import { QuestsService } from './quests.service';
import { CreateQuestDto, UpdateQuestDto, QueryQuestsDto } from './dto';
import { Quest } from './entities/quest.entity';
export declare class QuestsController {
    private readonly questsService;
    constructor(questsService: QuestsService);
    create(createQuestDto: CreateQuestDto): Promise<Quest>;
    findAll(query: QueryQuestsDto): Promise<{
        quests: Quest[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        expired: number;
    }>;
    findOne(id: string): Promise<Quest>;
    update(id: string, updateQuestDto: UpdateQuestDto): Promise<Quest>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=quests.controller.d.ts.map