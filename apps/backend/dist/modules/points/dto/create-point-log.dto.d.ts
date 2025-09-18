import { PointType, Badge } from '../entities/point-log.entity';
export declare class CreatePointLogDto {
    studentId: string;
    points: number;
    type: PointType;
    category: string;
    description: string;
    addedBy: string;
    badge?: Badge;
    academicYear?: string;
}
//# sourceMappingURL=create-point-log.dto.d.ts.map