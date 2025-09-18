import { Request } from 'express';
import { TeacherReportsService } from './teacher-reports.service';
import { CreateTeacherReportDto, UpdateTeacherReportDto, QueryTeacherReportsDto } from './dto';
import { TeacherReport, ReportStatus } from './entities/teacher-report.entity';
export declare class TeacherReportsController {
    private readonly teacherReportsService;
    constructor(teacherReportsService: TeacherReportsService);
    create(createTeacherReportDto: CreateTeacherReportDto, req: Request): Promise<TeacherReport>;
    findAll(query: QueryTeacherReportsDto): Promise<{
        data: TeacherReport[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        total: number;
        byStatus: Record<ReportStatus, number>;
        byTeacher: Record<string, number>;
        recentReports: number;
    }>;
    findOne(id: string): Promise<TeacherReport>;
    update(id: string, updateTeacherReportDto: UpdateTeacherReportDto): Promise<TeacherReport>;
    review(id: string): Promise<TeacherReport>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=teacher-reports.controller.d.ts.map