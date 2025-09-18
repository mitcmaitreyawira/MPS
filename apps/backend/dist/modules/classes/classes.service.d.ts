import { Model } from 'mongoose';
import { Class, ClassDocument } from '../../database/schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { CacheService } from '../../common/services/cache.service';
import { PerformanceService } from '../../common/services/performance.service';
import { StructuredLoggerService } from '../../common/services/logger.service';
export declare class ClassesService {
    private classModel;
    private readonly cacheService;
    private readonly performanceService;
    private readonly logger;
    constructor(classModel: Model<ClassDocument>, cacheService: CacheService, performanceService: PerformanceService, logger: StructuredLoggerService);
    findAll(query: QueryClassesDto): Promise<{
        classes: Class[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Class>;
    create(createClassDto: CreateClassDto): Promise<Class>;
    update(id: string, updateClassDto: UpdateClassDto): Promise<Class>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=classes.service.d.ts.map