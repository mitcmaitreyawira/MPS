import { Model } from 'mongoose';
import { UserDocument } from '../../database/schemas/user.schema';
import { AwardDocument } from '../../database/schemas/award.schema';
import { ClassDocument } from '../../database/schemas/class.schema';
import { PointLogDocument } from '../../database/schemas/point-log.schema';
import { QuestDocument } from '../../database/schemas/quest.schema';
export declare class AdminService {
    private readonly userModel;
    private readonly awardModel;
    private readonly classModel;
    private readonly pointLogModel;
    private readonly questModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, awardModel: Model<AwardDocument>, classModel: Model<ClassDocument>, pointLogModel: Model<PointLogDocument>, questModel: Model<QuestDocument>);
    bulkDeleteUsers(userIds: string[]): Promise<{
        deletedCount: number;
    }>;
    deleteBadge(badgeId: string): Promise<{
        deletedBadge: string;
        affectedUsers: number;
    }>;
    emergencySystemReset(): Promise<{
        message: string;
        timestamp: string;
    }>;
}
//# sourceMappingURL=admin.service.d.ts.map