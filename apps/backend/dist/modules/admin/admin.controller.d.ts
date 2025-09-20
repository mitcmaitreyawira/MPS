import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    private readonly logger;
    constructor(adminService: AdminService);
    bulkDeleteUsers(body: {
        userIds: string[];
        confirmDeletion: string;
    }): Promise<{
        deletedCount: number;
    }>;
    deleteBadge(badgeId: string, body: {
        confirmDeletion: string;
    }): Promise<{
        deletedBadge: string;
        affectedUsers: number;
    }>;
    emergencySystemReset(body: {
        confirmReset: string;
    }): Promise<{
        message: string;
        timestamp: string;
    }>;
}
//# sourceMappingURL=admin.controller.d.ts.map