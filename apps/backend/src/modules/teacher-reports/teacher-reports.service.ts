import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherReportDto, UpdateTeacherReportDto, QueryTeacherReportsDto } from './dto';
import { TeacherReport, ReportStatus } from './entities/teacher-report.entity';

@Injectable()
export class TeacherReportsService {
  private teacherReports: TeacherReport[] = [
    {
      id: 'report_001',
      submittedByUserId: 'user_001',
      isAnonymous: false,
      targetTeacherId: 'teacher_001',
      details: 'Teacher consistently arrives late to class and seems unprepared for lessons.',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      status: ReportStatus.NEW,
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
      status: ReportStatus.REVIEWED,
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
      status: ReportStatus.NEW,
      response: undefined,
      reviewedByUserId: undefined,
      reviewedAt: undefined,
      academicYear: '2024-2025'
    }
  ];

  async create(createTeacherReportDto: CreateTeacherReportDto): Promise<TeacherReport> {
    // Ensure submittedByUserId is provided (should be set by controller)
    if (!createTeacherReportDto.submittedByUserId) {
      throw new Error('submittedByUserId is required');
    }

    const newReport: TeacherReport = {
      id: `report_${Date.now()}`,
      submittedByUserId: createTeacherReportDto.submittedByUserId,
      isAnonymous: createTeacherReportDto.isAnonymous,
      targetTeacherId: createTeacherReportDto.targetTeacherId,
      details: createTeacherReportDto.details,
      academicYear: createTeacherReportDto.academicYear,
      timestamp: new Date(),
      status: ReportStatus.NEW,
      response: undefined,
      reviewedByUserId: undefined,
      reviewedAt: undefined
    };

    this.teacherReports.push(newReport);
    return newReport;
  }

  async findAll(query: QueryTeacherReportsDto): Promise<{
    data: TeacherReport[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let filteredReports = [...this.teacherReports];

    // Apply filters
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredReports = filteredReports.filter(report =>
        report.details.toLowerCase().includes(searchLower)
      );
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

    // Apply sorting
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    
    filteredReports.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
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
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
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

  async findOne(id: string): Promise<TeacherReport> {
    const report = this.teacherReports.find(r => r.id === id);
    if (!report) {
      throw new NotFoundException(`Teacher report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: string, updateTeacherReportDto: UpdateTeacherReportDto): Promise<TeacherReport> {
    const reportIndex = this.teacherReports.findIndex(r => r.id === id);
    if (reportIndex === -1) {
      throw new NotFoundException(`Teacher report with ID ${id} not found`);
    }

    const existingReport = this.teacherReports[reportIndex]!; // Non-null assertion since we checked the index
    
    // Update only the provided fields, keeping existing required fields
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
      const wasReviewed = existingReport.status === ReportStatus.REVIEWED;
      existingReport.status = updateTeacherReportDto.status;
      
      // Set reviewedAt when status changes to REVIEWED
      if (updateTeacherReportDto.status === ReportStatus.REVIEWED && !wasReviewed) {
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

  async remove(id: string): Promise<void> {
    const reportIndex = this.teacherReports.findIndex(r => r.id === id);
    if (reportIndex === -1) {
      throw new NotFoundException(`Teacher report with ID ${id} not found`);
    }
    this.teacherReports.splice(reportIndex, 1);
  }

  async getStats(): Promise<{
    total: number;
    byStatus: Record<ReportStatus, number>;
    byTeacher: Record<string, number>;
    recentReports: number;
  }> {
    const total = this.teacherReports.length;
    const byStatus = {
      [ReportStatus.NEW]: this.teacherReports.filter(r => r.status === ReportStatus.NEW).length,
      [ReportStatus.REVIEWED]: this.teacherReports.filter(r => r.status === ReportStatus.REVIEWED).length
    };

    const byTeacher: Record<string, number> = {};
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
}