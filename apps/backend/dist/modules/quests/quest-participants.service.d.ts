import { Model } from 'mongoose';
import { QuestParticipant, QuestCompletionStatus } from './entities/quest-participant.entity';
import { StructuredLoggerService } from '../../common/services/logger.service';
import { PerformanceService } from '../../common/services/performance.service';
export interface CreateQuestParticipantDto {
    questId: string;
    studentId: string;
    academicYear?: string;
}
export interface UpdateQuestParticipantDto {
    status?: QuestCompletionStatus;
    reviewNotes?: string;
}
export interface QueryQuestParticipantsDto {
    page?: number;
    limit?: number;
    questId?: string;
    studentId?: string;
    status?: QuestCompletionStatus;
    academicYear?: string;
}
export declare class QuestParticipantsService {
    private readonly questParticipantModel;
    private readonly logger;
    private readonly performanceService;
    constructor(questParticipantModel: Model<any>, logger: StructuredLoggerService, performanceService: PerformanceService);
    create(createDto: CreateQuestParticipantDto): Promise<QuestParticipant>;
    findAll(query: QueryQuestParticipantsDto): Promise<{
        participants: QuestParticipant[];
        total: number;
        pagination: any;
    }>;
    findOne(questId: string, studentId: string): Promise<QuestParticipant>;
    update(questId: string, studentId: string, updateDto: UpdateQuestParticipantDto): Promise<QuestParticipant>;
    remove(questId: string, studentId: string): Promise<void>;
    private transformToEntity;
}
//# sourceMappingURL=quest-participants.service.d.ts.map