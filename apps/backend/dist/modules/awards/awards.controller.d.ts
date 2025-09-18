import { AwardsService } from './awards.service';
import { CreateAwardDto, UpdateAwardDto, QueryAwardsDto } from './dto/index';
import { AuthenticatedUser } from '../auth/current-user.decorator';
export declare class AwardsController {
    private readonly awardsService;
    constructor(awardsService: AwardsService);
    create(createAwardDto: CreateAwardDto, currentUser: AuthenticatedUser): Promise<import("./entities/award.entity").Award>;
    findAll(query: QueryAwardsDto): Promise<{
        awards: import("./entities/award.entity").Award[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        totalAwards: number;
        awardsByTier: any;
        awardsByStatus: any;
        recentAwards: import("./entities/award.entity").Award[];
    }>;
    getTemplates(): Promise<import("./entities/award.entity").Award[]>;
    getLeaderboard(limit?: number): Promise<any[]>;
    getStudentSummary(studentId: string): Promise<{
        awards: import("./entities/award.entity").Award[];
        totalAwards: number;
        totalPoints: any;
        awardsByTier: Record<import("./entities/award.entity").AwardTier, number>;
    }>;
    getAwardsByRecipient(recipientId: string): Promise<{
        awards: import("./entities/award.entity").Award[];
        totalAwards: number;
        totalPoints: any;
        awardsByTier: Record<import("./entities/award.entity").AwardTier, number>;
    }>;
    createFromTemplate(templateId: string, recipientId: string, currentUser: AuthenticatedUser): Promise<import("./entities/award.entity").Award>;
    findOne(id: string): Promise<import("./entities/award.entity").Award>;
    update(id: string, updateAwardDto: UpdateAwardDto, currentUser: AuthenticatedUser): Promise<import("./entities/award.entity").Award>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<void>;
}
//# sourceMappingURL=awards.controller.d.ts.map