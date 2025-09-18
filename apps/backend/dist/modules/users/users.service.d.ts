import { Model, Connection } from 'mongoose';
import { User } from '../../database/schemas/user.schema';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto';
import { CacheService } from '../../common/services/cache.service';
import { PerformanceService } from '../../common/services/performance.service';
import { ErrorResponseService } from '../../common/services/error-response.service';
import { PointLogsService } from '../points/point-logs.service';
import { AuditService } from '../auth/services/audit.service';
export declare class UsersService {
    private userModel;
    private connection;
    private cacheService;
    private performanceService;
    private errorResponseService;
    private pointLogsService;
    private auditService;
    private readonly performanceHelper;
    private readonly cacheHelper;
    private readonly validationHelper;
    constructor(userModel: Model<User>, connection: Connection, cacheService: CacheService, performanceService: PerformanceService, errorResponseService: ErrorResponseService, pointLogsService: PointLogsService, auditService: AuditService);
    private executeWithTransaction;
    private executeWithoutTransaction;
    findByClassId(classId: string): Promise<User[]>;
    findAll(query: QueryUsersDto): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<User>;
    create(createUserDto: CreateUserDto): Promise<User>;
    createBulk(createUserDtos: CreateUserDto[]): Promise<{
        created: User[];
        errors: Array<{
            index: number;
            nisn: string;
            error: string;
        }>;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    archive(id: string): Promise<User>;
    restore(id: string): Promise<User>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=users.service.d.ts.map