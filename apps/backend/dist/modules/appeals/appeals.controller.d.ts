import { AppealsService } from './appeals.service';
import { CreateAppealDto, UpdateAppealDto, QueryAppealsDto } from './dto';
import { Appeal } from './entities/appeal.entity';
export declare class AppealsController {
    private readonly appealsService;
    constructor(appealsService: AppealsService);
    create(createAppealDto: CreateAppealDto): Promise<Appeal>;
    findAll(query: QueryAppealsDto): Promise<{
        appeals: Appeal[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        approvalRate: number;
    }>;
    findOne(id: string): Promise<Appeal>;
    update(id: string, updateAppealDto: UpdateAppealDto): Promise<Appeal>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=appeals.controller.d.ts.map