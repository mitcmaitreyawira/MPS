import { CreateTeacherReportDto } from './create-teacher-report.dto';
import { ReportStatus } from '../entities/teacher-report.entity';
declare const UpdateTeacherReportDto_base: import("@nestjs/common").Type<Partial<CreateTeacherReportDto>>;
export declare class UpdateTeacherReportDto extends UpdateTeacherReportDto_base {
    status?: ReportStatus;
    response?: string;
    reviewedByUserId?: string;
}
export {};
//# sourceMappingURL=update-teacher-report.dto.d.ts.map