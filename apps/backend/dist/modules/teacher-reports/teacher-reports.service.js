"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherReportsService = void 0;
const common_1 = require("@nestjs/common");
const teacher_report_entity_1 = require("./entities/teacher-report.entity");
let TeacherReportsService = class TeacherReportsService {
    teacherReports = [
        {
            id: 'report_001',
            submittedByUserId: 'user_001',
            isAnonymous: false,
            targetTeacherId: 'teacher_001',
            details: 'Teacher consistently arrives late to class and seems unprepared for lessons.',
            timestamp: new Date('2024-01-15T10:30:00Z'),
            status: teacher_report_entity_1.ReportStatus.NEW,
            response: undefined,
            reviewedByUserId: undefined,
            reviewedAt: undefined,
            academicYear: '2024-2025'
        },
        {
            id: 'report_002',
            submittedByUserId: 'user_002',
            isAnonymous: true,
            targetTeacherId: 'teacher_002',
            details: 'Teacher uses inappropriate language and creates a hostile learning environment.',
            timestamp: new Date('2024-01-20T14:15:00Z'),
            status: teacher_report_entity_1.ReportStatus.REVIEWED,
            response: 'We have investigated this matter and taken appropriate disciplinary action.',
            reviewedByUserId: 'admin_001',
            reviewedAt: new Date('2024-01-25T09:00:00Z'),
            academicYear: '2024-2025'
        },
        {
            id: 'report_003',
            submittedByUserId: 'user_003',
            isAnonymous: false,
            targetTeacherId: 'teacher_001',
            details: 'Teacher shows favoritism towards certain students and grades unfairly.',
            timestamp: new Date('2024-02-01T11:45:00Z'),
            status: teacher_report_entity_1.ReportStatus.NEW,
            response: undefined,
            reviewedByUserId: undefined,
            reviewedAt: undefined,
            academicYear: '2024-2025'
        }
    ];
    async create(createTeacherReportDto) {
        if (!createTeacherReportDto.submittedByUserId) {
            throw new Error('submittedByUserId is required');
        }
        const newReport = {
            id: `report_${Date.now()}`,
            submittedByUserId: createTeacherReportDto.submittedByUserId,
            isAnonymous: createTeacherReportDto.isAnonymous,
            targetTeacherId: createTeacherReportDto.targetTeacherId,
            details: createTeacherReportDto.details,
            academicYear: createTeacherReportDto.academicYear,
            timestamp: new Date(),
            status: teacher_report_entity_1.ReportStatus.NEW,
            response: undefined,
            reviewedByUserId: undefined,
            reviewedAt: undefined
        };
        this.teacherReports.push(newReport);
        return newReport;
    }
    async findAll(query) {
        let filteredReports = [...this.teacherReports];
        if (query.search) {
            const searchLower = query.search.toLowerCase();
            filteredReports = filteredReports.filter(report => report.details.toLowerCase().includes(searchLower));
        }
        if (query.status) {
            filteredReports = filteredReports.filter(report => report.status === query.status);
        }
        if (query.submittedByUserId) {
            filteredReports = filteredReports.filter(report => report.submittedByUserId === query.submittedByUserId);
        }
        if (query.targetTeacherId) {
            filteredReports = filteredReports.filter(report => report.targetTeacherId === query.targetTeacherId);
        }
        if (query.isAnonymous !== undefined) {
            filteredReports = filteredReports.filter(report => report.isAnonymous === query.isAnonymous);
        }
        if (query.academicYear) {
            filteredReports = filteredReports.filter(report => report.academicYear === query.academicYear);
        }
        const sortBy = query.sortBy || 'timestamp';
        const sortOrder = query.sortOrder || 'desc';
        filteredReports.sort((a, b) => {
            let aValue;
            let bValue;
            switch (sortBy) {
                case 'timestamp':
                    aValue = a.timestamp;
                    bValue = b.timestamp;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'targetTeacherId':
                    aValue = a.targetTeacherId;
                    bValue = b.targetTeacherId;
                    break;
                default:
                    aValue = a.timestamp;
                    bValue = b.timestamp;
            }
            if (aValue < bValue)
                return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue)
                return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        const page = query.page || 1;
        const limit = query.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedReports = filteredReports.slice(startIndex, endIndex);
        return {
            data: paginatedReports,
            total: filteredReports.length,
            page,
            limit,
            totalPages: Math.ceil(filteredReports.length / limit)
        };
    }
    async findOne(id) {
        const report = this.teacherReports.find(r => r.id === id);
        if (!report) {
            throw new common_1.NotFoundException(`Teacher report with ID ${id} not found`);
        }
        return report;
    }
    async update(id, updateTeacherReportDto) {
        const reportIndex = this.teacherReports.findIndex(r => r.id === id);
        if (reportIndex === -1) {
            throw new common_1.NotFoundException(`Teacher report with ID ${id} not found`);
        }
        const existingReport = this.teacherReports[reportIndex];
        if (updateTeacherReportDto.submittedByUserId !== undefined) {
            existingReport.submittedByUserId = updateTeacherReportDto.submittedByUserId;
        }
        if (updateTeacherReportDto.isAnonymous !== undefined) {
            existingReport.isAnonymous = updateTeacherReportDto.isAnonymous;
        }
        if (updateTeacherReportDto.targetTeacherId !== undefined) {
            existingReport.targetTeacherId = updateTeacherReportDto.targetTeacherId;
        }
        if (updateTeacherReportDto.details !== undefined) {
            existingReport.details = updateTeacherReportDto.details;
        }
        if (updateTeacherReportDto.academicYear !== undefined) {
            existingReport.academicYear = updateTeacherReportDto.academicYear;
        }
        if (updateTeacherReportDto.status !== undefined) {
            const wasReviewed = existingReport.status === teacher_report_entity_1.ReportStatus.REVIEWED;
            existingReport.status = updateTeacherReportDto.status;
            if (updateTeacherReportDto.status === teacher_report_entity_1.ReportStatus.REVIEWED && !wasReviewed) {
                existingReport.reviewedAt = new Date();
            }
        }
        if (updateTeacherReportDto.response !== undefined) {
            existingReport.response = updateTeacherReportDto.response;
        }
        if (updateTeacherReportDto.reviewedByUserId !== undefined) {
            existingReport.reviewedByUserId = updateTeacherReportDto.reviewedByUserId;
        }
        this.teacherReports[reportIndex] = existingReport;
        return existingReport;
    }
    async remove(id) {
        const reportIndex = this.teacherReports.findIndex(r => r.id === id);
        if (reportIndex === -1) {
            throw new common_1.NotFoundException(`Teacher report with ID ${id} not found`);
        }
        this.teacherReports.splice(reportIndex, 1);
    }
    async getStats() {
        const total = this.teacherReports.length;
        const byStatus = {
            [teacher_report_entity_1.ReportStatus.NEW]: this.teacherReports.filter(r => r.status === teacher_report_entity_1.ReportStatus.NEW).length,
            [teacher_report_entity_1.ReportStatus.REVIEWED]: this.teacherReports.filter(r => r.status === teacher_report_entity_1.ReportStatus.REVIEWED).length
        };
        const byTeacher = {};
        this.teacherReports.forEach(report => {
            byTeacher[report.targetTeacherId] = (byTeacher[report.targetTeacherId] || 0) + 1;
        });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentReports = this.teacherReports.filter(r => r.timestamp > thirtyDaysAgo).length;
        return {
            total,
            byStatus,
            byTeacher,
            recentReports
        };
    }
};
exports.TeacherReportsService = TeacherReportsService;
exports.TeacherReportsService = TeacherReportsService = __decorate([
    (0, common_1.Injectable)()
], TeacherReportsService);
//# sourceMappingURL=teacher-reports.service.js.map