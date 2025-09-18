import { Model } from 'mongoose';
import { CreatePointLogDto, UpdatePointLogDto, QueryPointLogsDto, BulkCreatePointLogsDto } from './dto';
import { PointLog as PointLogEntity, BadgeTier } from './entities/point-log.entity';
import { PointLogDocument } from '../../database/schemas/point-log.schema';
import { UserDocument } from '../../database/schemas/user.schema';
export declare class PointLogsService {
    private pointLogModel;
    private userModel;
    constructor(pointLogModel: Model<PointLogDocument>, userModel: Model<UserDocument>);
    private initializeStudentPoints;
    private getStudentTotalPoints;
    private convertToEntity;
    create(createPointLogDto: CreatePointLogDto): Promise<PointLogEntity>;
    bulkCreate(bulkCreatePointLogsDto: BulkCreatePointLogsDto): Promise<PointLogEntity[]>;
    findAll(query: QueryPointLogsDto): Promise<{
        data: PointLogEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<PointLogEntity>;
    update(id: string, updatePointLogDto: UpdatePointLogDto): Promise<PointLogEntity>;
    remove(id: string): Promise<void>;
    getStats(): Promise<{
        totalEntries: number;
        totalPointsAwarded: number;
        totalPointsDeducted: number;
        netPoints: number;
        entriesByType: Record<string, number>;
        entriesByCategory: Record<string, number>;
        badgesAwarded: number;
        averagePointsPerEntry: number;
    }>;
    getStudentSummary(studentId: string): Promise<{
        studentId: string;
        totalPoints: number;
        percentage: number;
        recentLogs: PointLogEntity[];
        pointsByCategory: Record<string, number>;
        badges: ({
            id: string;
            tier: BadgeTier;
            reason: string;
            awardedBy: string;
            awardedOn: Date;
            icon?: string;
        } | undefined)[];
        logCount: number;
    }>;
}
//# sourceMappingURL=point-logs.service.d.ts.map