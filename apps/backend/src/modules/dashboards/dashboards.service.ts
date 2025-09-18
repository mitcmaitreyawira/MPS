import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { QuestsService } from '../quests/quests.service';
import { QuestParticipantsService } from '../quests/quest-participants.service';
import { AppealsService } from '../appeals/appeals.service';
import { PointLogsService } from '../points/point-logs.service';
import { TeacherReportsService } from '../teacher-reports/teacher-reports.service';
import { ActionPresetsService } from '../action-presets/action-presets.service';
import { ClassesService } from '../classes/classes.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AwardsService } from '../awards/awards.service';
import { PointType } from '../points/entities/point-log.entity';
import { AuthenticatedUser } from '../auth/current-user.decorator';

@Injectable()
export class DashboardsService {
  private readonly logger = new Logger(DashboardsService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private questsService: QuestsService,
    private questParticipantsService: QuestParticipantsService,
    private appealsService: AppealsService,
    private pointLogsService: PointLogsService,
    private teacherReportsService: TeacherReportsService,
    private actionPresetsService: ActionPresetsService,
    private classesService: ClassesService,
    private auditLogsService: AuditLogsService,
    private awardsService: AwardsService,
  ) {}

  private startTimer(operation: string, metadata?: any): string {
    this.logger.debug(`Starting timer for: dashboard_${operation}`, { metadata });
    return `dashboard_${operation}_${Date.now()}`;
  }

  async getAdminDashboard(user: AuthenticatedUser, year?: string) {
    const timerId = this.startTimer('admin_dashboard', { userId: user.nisn, year });
    
    try {
      // Fetch real data from services
      const [allUsers, questsData, appealsData, pointLogsData, teacherReportsData, actionPresetsData, classesData, questParticipantsData, auditLogsData] = await Promise.all([
        this.userModel.find().sort({ _id: -1 }).limit(100).exec(),
        this.questsService.findAll({ page: 1, limit: 50 }),
        this.appealsService.findAll({ page: 1, limit: 50 }),
        this.pointLogsService.findAll({ page: 1, limit: 100 }),
        this.teacherReportsService.findAll({ page: 1, limit: 50 }),
        this.actionPresetsService.findAll({ page: 1, limit: 50 }),
        this.classesService.findAll({ page: 1, limit: 50 }),
        this.questParticipantsService.findAll({ page: 1, limit: 100 }),
        this.auditLogsService.findAll({ page: 1, limit: 100 })
      ]);

      // Calculate points, badges, and streaks for each user
      const users = await Promise.all(allUsers.map(async (student) => {
        const userObj = student.toObject();
        const studentId = (student._id as Types.ObjectId).toString();
        
        // Calculate total points from point logs
        const userPointLogs = pointLogsData.data.filter(log => log.studentId === studentId);
        const totalPoints = userPointLogs.reduce((sum, log) => {
          return log.type === PointType.REWARD ? sum + log.points : sum - log.points;
        }, 0);

        // Calculate badge count and award points from awards
        let badgeCount = 0;
        let awardPoints = 0;
        try {
          const studentSummary = await this.awardsService.getStudentSummary(studentId);
          badgeCount = studentSummary.totalAwards;
          awardPoints = studentSummary.totalPoints;
        } catch (error) {
          // If student has no awards or invalid ID, keep defaults
          this.logger.debug(`No awards found for student ${studentId}`);
        }

        // Calculate streak (days since last violation)
        let streak = 0;
        const violations = userPointLogs
          .filter(log => log.type === PointType.VIOLATION)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        if (violations.length > 0) {
          const lastViolation = violations[0];
          if (lastViolation) {
            const lastViolationDate = new Date(lastViolation.timestamp);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            lastViolationDate.setHours(0, 0, 0, 0);
            
            const diffTime = today.getTime() - lastViolationDate.getTime();
            streak = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          }
        }

        return {
          ...userObj,
          name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.nisn || 'Unknown User',
          points: Math.max(0, Math.min(100, totalPoints)), // Cap at 100 points
          badge: badgeCount,
          streakDay: streak,
          totalPoints: Math.max(0, Math.min(100, totalPoints)),
          badgeCount,
          awardPoints
        };
      }));

      const dashboardData = {
        users,
        quests: questsData.quests,
        actionPresets: actionPresetsData.data,
        teacherReports: teacherReportsData.data,
        points: pointLogsData.data,
        classes: classesData.classes,
        appeals: appealsData.appeals,
        questParticipants: questParticipantsData.participants,
        auditLogs: auditLogsData.logs,
      };

      this.logger.debug(`Completed timer for: ${timerId}`);
      return dashboardData;
    } catch (error) {
      this.logger.debug(`Completed timer for: ${timerId}`, { error: true });
      this.logger.error('Failed to fetch admin dashboard data', error instanceof Error ? error.stack : String(error), {
        metadata: { userId: user.id || user.nisn, year },
      });
      throw error;
    }
  }

  async getTeacherDashboard(user: AuthenticatedUser, year?: string) {
    const timerId = this.startTimer('teacher_dashboard', { userId: user.nisn, year });
    
    try {
      // Debug: Log the authenticated user data
      console.log('Teacher Dashboard Service - Authenticated User:', JSON.stringify(user, null, 2));
      
      // First, find the current teacher's user record by NISN
      const currentTeacher = await this.userModel.findOne({ nisn: user.nisn }).exec();
      console.log('Teacher found by NISN:', currentTeacher ? currentTeacher.firstName + ' ' + currentTeacher.lastName : 'Not found');
      
      if (!currentTeacher) {
        throw new Error('Teacher not found');
      }

      // Fetch real data from services - enhanced to include all users and classes for proper integration
      const [allUsers, pointLogsData, questsData, appealsData, questParticipantsData, classesData, teacherReportsData] = await Promise.all([
        this.userModel.find().sort({ _id: -1 }).limit(100).exec(),
        this.pointLogsService.findAll({ page: 1, limit: 100 }),
        this.questsService.findAll({ page: 1, limit: 50 }),
        this.appealsService.findAll({ page: 1, limit: 50 }),
        this.questParticipantsService.findAll({ page: 1, limit: 100 }),
        this.classesService.findAll({ page: 1, limit: 50 }),
        this.teacherReportsService.findAll({ page: 1, limit: 50 })
      ]);

      // Find classes where this teacher is the head teacher
      const teacherClasses = classesData.classes.filter(cls => 
        cls.headTeacherId && cls.headTeacherId.toString() === (currentTeacher._id as any).toString()
      );

      // Get student IDs from teacher's classes
      const studentIds = new Set<string>();
      teacherClasses.forEach(cls => {
        if (cls.students && Array.isArray(cls.students)) {
          cls.students.forEach(studentId => studentIds.add(studentId.toString()));
        }
      });

      // Filter students to only include those in teacher's classes and ensure consistent data structure
      const students = allUsers.filter(u => 
        u.roles && u.roles.includes('student') && 
        studentIds.has((u._id as any).toString())
      ).map(user => {
        const userObj = user.toObject();
        return {
          ...userObj,
          name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.nisn || 'Unknown User'
        };
      });

      // Ensure all users have consistent name field for search functionality
      const enhancedAllUsers = allUsers.map(user => {
        const userObj = user.toObject();
        return {
          ...userObj,
          name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.nisn || 'Unknown User'
        };
      });
      
      // Debug logging to see what data we're returning
      console.log('Teacher Dashboard Service - Debug Info:');
      console.log('Current teacher:', currentTeacher.firstName, currentTeacher.lastName, 'ID:', (currentTeacher._id as any).toString());
      console.log('Total classes found:', classesData.classes.length);
      console.log('Teacher classes found:', teacherClasses.length);
      console.log('Teacher classes:', teacherClasses.map(cls => ({ name: cls.name, students: cls.students?.length || 0 })));
      console.log('Student IDs in teacher classes:', Array.from(studentIds));
      console.log('Total users found:', allUsers.length);
      console.log('Students filtered for teacher:', students.length);
      console.log('Sample student structure:', students[0] ? {
        id: students[0]._id,
        firstName: students[0].firstName,
        lastName: students[0].lastName,
        roles: students[0].roles
      } : 'No students found for this teacher');

      const dashboardData = {
        students, // Keep for backward compatibility with enhanced name field
        users: enhancedAllUsers, // Add all users with consistent name field for admin integration
        classes: classesData.classes, // Add classes data for proper integration
        teacherReports: teacherReportsData.data, // Add teacher reports for integration
        points: pointLogsData.data,
        questParticipants: questParticipantsData.participants,
        quests: questsData.quests,
        appeals: appealsData.appeals,
      };

      this.logger.debug(`Completed timer for: ${timerId}`);
      return dashboardData;
    } catch (error) {
      this.logger.debug(`Completed timer for: ${timerId}`, { error: true });
      this.logger.error('Failed to fetch teacher dashboard data', error instanceof Error ? error.stack : String(error), {
        metadata: { userId: user.id || user.nisn, year },
      });
      throw error;
    }
  }

  async getStudentDashboard(user: AuthenticatedUser, year?: string) {
    const timerId = this.startTimer('student_dashboard', { userId: user.nisn, year });
    
    try {
      // Fetch real data from services - filter point logs by current student and include class info
      const [pointLogsData, questsData, leaderboardUsers, appealsData, teacherReportsData, currentUser, questParticipantsData, allPointLogs] = await Promise.all([
        this.pointLogsService.findAll({ page: 1, limit: 100, studentId: (user as any).id }),
        this.questsService.findAll({ page: 1, limit: 50 }),
        this.userModel.find({ roles: 'student' }).limit(100).exec(), // Get more students for better leaderboard
        this.appealsService.findAll({ page: 1, limit: 50 }),
        this.teacherReportsService.findAll({ page: 1, limit: 50 }),
        this.userModel.findById((user as any).id).populate('classId').exec(),
        this.questParticipantsService.findAll({ page: 1, limit: 100, studentId: (user as any).id }),
        this.pointLogsService.findAll({ page: 1, limit: 1000 }) // Get all point logs for leaderboard calculation
      ]);

      // Get class information if user has a class assigned
      let userClass: any = null;
      if (currentUser?.classId) {
        // Extract the ObjectId from the populated classId object
        const classId = typeof currentUser.classId === 'object' && currentUser.classId._id 
          ? currentUser.classId._id.toString() 
          : currentUser.classId.toString();
        const classData = await this.classesService.findOne(classId);
        userClass = classData;
      }

      // Get award points for all students
      const studentIds = leaderboardUsers.map(student => (student as any)._id.toString());
      const awardPointsMap = await this.awardsService.getAwardPointsForUsers(studentIds);

      // Calculate leaderboard data with actual point totals, award points, and streak
      const leaderboardData = leaderboardUsers.map(student => {
        const studentId = (student as any)._id.toString();
        const studentPoints = allPointLogs.data.filter(p => p.studentId === studentId);
        const totalPoints = studentPoints.reduce((acc, p) => acc + p.points, 0);
        const badgeCount = studentPoints.filter(p => p.badge).length;
        
        // Get award points from the new award system
        const awardPoints = awardPointsMap[studentId] || 0;
        
        // Calculate streak (days since last violation) - same logic as individual student dashboard
        let streak = 0;
        const violations = studentPoints
          .filter(log => log.type === PointType.VIOLATION)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        if (violations.length > 0) {
          const lastViolation = violations[0];
          if (lastViolation) {
            const lastViolationDate = new Date(lastViolation.timestamp);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            lastViolationDate.setHours(0, 0, 0, 0);
            
            const diffTime = today.getTime() - lastViolationDate.getTime();
            streak = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          }
        } else {
          // No violations ever - calculate days since first activity or set to reasonable default
          const firstActivity = studentPoints
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
          
          if (firstActivity) {
            const firstActivityDate = new Date(firstActivity.timestamp);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            firstActivityDate.setHours(0, 0, 0, 0);
            
            const diffTime = today.getTime() - firstActivityDate.getTime();
            streak = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          } else {
            streak = 0;
          }
        }
        
        return {
          ...student.toObject(),
          totalPoints: Math.max(0, Math.min(100, totalPoints)), // Cap at 100 points
          badgeCount,
          awardPoints,
          streak
        };
      }).sort((a, b) => b.totalPoints - a.totalPoints); // Sort by points descending

      // Create class-specific leaderboard if user has a class
      let classLeaderboardData: typeof leaderboardData = [];
      if (currentUser?.classId) {
        const classId = typeof currentUser.classId === 'object' && currentUser.classId._id 
          ? currentUser.classId._id.toString() 
          : currentUser.classId.toString();
        
        classLeaderboardData = leaderboardData.filter(student => {
          if (!student || !student.classId) {
            return false;
          }
          const studentClassId = typeof student.classId === 'object' && student.classId._id 
            ? student.classId._id.toString() 
            : student.classId?.toString();
          return studentClassId === classId;
        });
        
        // Ensure current user is always included in class leaderboard for "Your Performance" section
        const currentUserInClassLeaderboard = classLeaderboardData.find(student => 
          (student._id as any).toString() === (user as any).id
        );
        
        if (!currentUserInClassLeaderboard) {
          // Find current user in the main leaderboard data and add them to class leaderboard
          const currentUserData = leaderboardData.find(student => 
            (student._id as any).toString() === (user as any).id
          );
          if (currentUserData) {
            classLeaderboardData.push(currentUserData);
            // Re-sort the class leaderboard after adding current user
            classLeaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
          }
        }
      }
      
      // Streak calculation is working correctly for both leaderboards

      const dashboardData = {
        points: pointLogsData.data,
        quests: questsData.quests,
        questParticipants: questParticipantsData.participants || [],
        leaderboardUsers: leaderboardData, // School-wide leaderboard
        classLeaderboardUsers: classLeaderboardData, // Class-specific leaderboard
        appeals: appealsData.appeals,
        teacherReports: teacherReportsData.data,
        userClass, // Include class information
      };

      this.logger.debug(`Completed timer for: ${timerId}`);
      return dashboardData;
    } catch (error) {
      this.logger.debug(`Completed timer for: ${timerId}`, { error: true });
      this.logger.error('Failed to fetch student dashboard data', error instanceof Error ? error.stack : String(error), {
        metadata: { userId: user.id || user.nisn, year },
      });
      throw error;
    }
  }

  async getParentDashboard(user: AuthenticatedUser, year?: string) {
    const timerId = this.startTimer('parent_dashboard', { userId: user.nisn, year });
    
    try {
      // Fetch real data from services
      // In a real implementation, you would fetch data for the parent's children
      const [pointLogsData, questsData, appealsData, teacherReportsData] = await Promise.all([
        this.pointLogsService.findAll({ page: 1, limit: 100 }),
        this.questsService.findAll({ page: 1, limit: 50 }),
        this.appealsService.findAll({ page: 1, limit: 50 }),
        this.teacherReportsService.findAll({ page: 1, limit: 50 })
      ]);

      const dashboardData = {
        children: [], // TODO: Implement children relationship
        points: pointLogsData.data,
        quests: questsData.quests,
        questParticipants: [], // TODO: Implement quest participants collection
        appeals: appealsData.appeals,
        teacherReports: teacherReportsData.data,
      };

      this.logger.debug(`Completed timer for: ${timerId}`);
      return dashboardData;
    } catch (error) {
      this.logger.debug(`Completed timer for: ${timerId}`, { error: true });
      this.logger.error('Failed to fetch parent dashboard data', error instanceof Error ? error.stack : String(error), {
        metadata: { userId: user.id || user.nisn, year },
      });
      throw error;
    }
  }
}