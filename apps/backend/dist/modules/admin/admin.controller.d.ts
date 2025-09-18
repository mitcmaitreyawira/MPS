import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    private readonly logger;
    constructor(adminService: AdminService);
    bulkDeleteUsers(body: {
        userIds: string[];
    }): Promise<{
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
//# sourceMappingURL=admin.controller.d.ts.map