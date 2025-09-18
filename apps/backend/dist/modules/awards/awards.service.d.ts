import { Model } from 'mongoose';
import { CreateAwardDto, UpdateAwardDto, QueryAwardsDto } from './dto/index';
import { Award as AwardEntity, AwardTier } from './entities/award.entity';
import { AwardDocument } from '../../database/schemas/award.schema';
import { UserDocument } from '../../database/schemas/user.schema';
import { AuthenticatedUser } from '../auth/current-user.decorator';
export declare class AwardsService {
    private awardModel;
    private userModel;
    constructor(awardModel: Model<AwardDocument>, userModel: Model<UserDocument>);
    private canGrantAwardTier;
    private convertToEntity;
    create(createAwardDto: CreateAwardDto, currentUser: AuthenticatedUser): Promise<AwardEntity>;
    findAll(query: QueryAwardsDto): Promise<{
        awards: AwardEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<AwardEntity>;
    update(id: string, updateAwardDto: UpdateAwardDto, currentUser: AuthenticatedUser): Promise<AwardEntity>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<void>;
    getStats(): Promise<{
        totalAwards: number;
        awardsByTier: any;
        awardsByStatus: any;
        recentAwards: AwardEntity[];
    }>;
    getStudentSummary(studentId: string): Promise<{
        awards: AwardEntity[];
        totalAwards: number;
        totalPoints: any;
        awardsByTier: Record<AwardTier, number>;
    }>;
    getTemplates(): Promise<AwardEntity[]>;
    createFromTemplate(templateId: string, recipientId: string, currentUser: AuthenticatedUser): Promise<AwardEntity>;
    private getCurrentAcademicYear;
    getLeaderboard(limit?: number): Promise<any[]>;
    getAwardPointsForUsers(userIds: string[]): Promise<{
        [userId: string]: number;
    }>;
}
//# sourceMappingURL=awards.service.d.ts.map