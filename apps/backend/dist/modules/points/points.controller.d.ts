import { PointLogsService } from './point-logs.service';
import { CreatePointLogDto } from './dto';
import { PointLog } from './entities/point-log.entity';
export declare class PointsController {
    private readonly pointLogsService;
    constructor(pointLogsService: PointLogsService);
    create(createPointLogDto: CreatePointLogDto): Promise<PointLog>;
}
//# sourceMappingURL=points.controller.d.ts.map