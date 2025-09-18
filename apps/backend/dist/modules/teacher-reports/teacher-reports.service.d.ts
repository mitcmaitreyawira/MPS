import { CreateTeacherReportDto, UpdateTeacherReportDto, QueryTeacherReportsDto } from './dto';
import { TeacherReport, ReportStatus } from './entities/teacher-report.entity';
export declare class TeacherReportsService {
    private teacherReports;
    create(createTeacherReportDto: CreateTeacherReportDto): Promise<TeacherReport>;
    findAll(query: QueryTeacherReportsDto): Promise<{
        data: TeacherReport[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<TeacherReport>;
    update(id: string, updateTeacherReportDto: UpdateTeacherReportDto): Promise<TeacherReport>;
    remove(id: string): Promise<void>;
    getStats(): Promise<{
        total: number;
        byStatus: Record<ReportStatus, number>;
        byTeacher: Record<string, number>;
        recentReports: number;
    }>;
}
//# sourceMappingURL=teacher-reports.service.d.ts.map