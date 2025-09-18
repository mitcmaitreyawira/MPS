import { UsersService } from '../users/users.service';
import { PointLogsService } from '../points/point-logs.service';
import { ActionPresetsService } from '../action-presets/action-presets.service';
import { AuthenticatedUser } from '../auth/current-user.decorator';
declare class PointsActionDto {
    type: 'points';
    points: number;
    category: string;
    description: string;
    academicYear?: string;
}
declare class BadgeActionDto {
    type: 'badge';
    presetId: string;
    academicYear?: string;
}
declare class BulkActionBodyDto {
    classId: string;
    action: PointsActionDto | BadgeActionDto;
}
export declare class DataController {
    private readonly usersService;
    private readonly pointLogsService;
    private readonly actionPresetsService;
    constructor(usersService: UsersService, pointLogsService: PointLogsService, actionPresetsService: ActionPresetsService);
    getAcademicYears(): string[];
    bulkAction(body: BulkActionBodyDto, user: AuthenticatedUser): Promise<{
        created: number;
        message: string;
    } | {
        created: number;
        message?: undefined;
    }>;
}
export {};
//# sourceMappingURL=data.controller.d.ts.map