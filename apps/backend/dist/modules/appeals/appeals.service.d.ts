import { Model } from 'mongoose';
import { CreateAppealDto, UpdateAppealDto, QueryAppealsDto } from './dto';
import { Appeal } from './entities/appeal.entity';
import { AppealDocument } from '../../database/schemas/appeal.schema';
export declare class AppealsService {
    private appealModel;
    constructor(appealModel: Model<AppealDocument>);
    create(createAppealDto: CreateAppealDto): Promise<Appeal>;
    findAll(query: QueryAppealsDto): Promise<{
        appeals: Appeal[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Appeal>;
    update(id: string, updateAppealDto: UpdateAppealDto): Promise<Appeal>;
    remove(id: string): Promise<void>;
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        approvalRate: number;
    }>;
    private toAppealEntity;
}
//# sourceMappingURL=appeals.service.d.ts.map