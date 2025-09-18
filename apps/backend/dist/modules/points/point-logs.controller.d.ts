import { PointLogsService } from './point-logs.service';
import { CreatePointLogDto, UpdatePointLogDto, QueryPointLogsDto, BulkCreatePointLogsDto } from './dto';
import { PointLog } from './entities/point-log.entity';
export declare class PointLogsController {
    private readonly pointLogsService;
    constructor(pointLogsService: PointLogsService);
    create(createPointLogDto: CreatePointLogDto): Promise<PointLog>;
    bulkCreate(bulkCreatePointLogsDto: BulkCreatePointLogsDto): Promise<PointLog[]>;
    findAll(queryPointLogsDto: QueryPointLogsDto): Promise<{
        data: PointLog[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
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
        recentLogs: PointLog[];
        pointsByCategory: Record<string, number>;
        badges: ({
            id: string;
            tier: import("./entities/point-log.entity").BadgeTier;
            reason: string;
            awardedBy: string;
            awardedOn: Date;
            icon?: string;
        } | undefined)[];
        logCount: number;
    }>;
    findOne(id: string): Promise<PointLog>;
    update(id: string, updatePointLogDto: UpdatePointLogDto): Promise<PointLog>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=point-logs.controller.d.ts.map