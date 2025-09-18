"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DashboardsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../database/schemas/user.schema");
const quests_service_1 = require("../quests/quests.service");
const quest_participants_service_1 = require("../quests/quest-participants.service");
const appeals_service_1 = require("../appeals/appeals.service");
const point_logs_service_1 = require("../points/point-logs.service");
const teacher_reports_service_1 = require("../teacher-reports/teacher-reports.service");
const action_presets_service_1 = require("../action-presets/action-presets.service");
const classes_service_1 = require("../classes/classes.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const awards_service_1 = require("../awards/awards.service");
const point_log_entity_1 = require("../points/entities/point-log.entity");
let DashboardsService = DashboardsService_1 = class DashboardsService {
    userModel;
    questsService;
    questParticipantsService;
    appealsService;
    pointLogsService;
    teacherReportsService;
    actionPresetsService;
    classesService;
    auditLogsService;
    awardsService;
    logger = new common_1.Logger(DashboardsService_1.name);
    constructor(userModel, questsService, questParticipantsService, appealsService, pointLogsService, teacherReportsService, actionPresetsService, classesService, auditLogsService, awardsService) {
        this.userModel = userModel;
        this.questsService = questsService;
        this.questParticipantsService = questParticipantsService;
        this.appealsService = appealsService;
        this.pointLogsService = pointLogsService;
        this.teacherReportsService = teacherReportsService;
        this.actionPresetsService = actionPresetsService;
        this.classesService = classesService;
        this.auditLogsService = auditLogsService;
        this.awardsService = awardsService;
    }
    startTimer(operation, metadata) {
        this.logger.debug(`Starting timer for: dashboard_${operation}`, { metadata });
        return `dashboard_${operation}_${Date.now()}`;
    }
    async getAdminDashboard(user, year) {
        const timerId = this.startTimer('admin_dashboard', { userId: user.nisn, year });
        try {
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
            const users = await Promise.all(allUsers.map(async (student) => {
                const userObj = student.toObject();
                const studentId = student._id.toString();
                const userPointLogs = pointLogsData.data.filter(log => log.studentId === studentId);
                const totalPoints = userPointLogs.reduce((sum, log) => {
                    return log.type === point_log_entity_1.PointType.REWARD ? sum + log.points : sum - log.points;
                }, 0);
                let badgeCount = 0;
                let awardPoints = 0;
                try {
                    const studentSummary = await this.awardsService.getStudentSummary(studentId);
                    badgeCount = studentSummary.totalAwards;
                    awardPoints = studentSummary.totalPoints;
                }
                catch (error) {
                    this.logger.debug(`No awards found for student ${studentId}`);
                }
                let streak = 0;
                const violations = userPointLogs
                    .filter(log => log.type === point_log_entity_1.PointType.VIOLATION)
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
                    points: Math.max(0, Math.min(100, totalPoints)),
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
        }
        catch (error) {
            this.logger.debug(`Completed timer for: ${timerId}`, { error: true });
            this.logger.error('Failed to fetch admin dashboard data', error instanceof Error ? error.stack : String(error), {
                metadata: { userId: user.id || user.nisn, year },
            });
            throw error;
        }
    }
    async getTeacherDashboard(user, year) {
        const timerId = this.startTimer('teacher_dashboard', { userId: user.nisn, year });
        try {
            console.log('Teacher Dashboard Service - Authenticated User:', JSON.stringify(user, null, 2));
            const currentTeacher = await this.userModel.findOne({ nisn: user.nisn }).exec();
            console.log('Teacher found by NISN:', currentTeacher ? currentTeacher.firstName + ' ' + currentTeacher.lastName : 'Not found');
            if (!currentTeacher) {
                throw new Error('Teacher not found');
            }
            const [allUsers, pointLogsData, questsData, appealsData, questParticipantsData, classesData, teacherReportsData] = await Promise.all([
                this.userModel.find().sort({ _id: -1 }).limit(100).exec(),
                this.pointLogsService.findAll({ page: 1, limit: 100 }),
                this.questsService.findAll({ page: 1, limit: 50 }),
                this.appealsService.findAll({ page: 1, limit: 50 }),
                this.questParticipantsService.findAll({ page: 1, limit: 100 }),
                this.classesService.findAll({ page: 1, limit: 50 }),
                this.teacherReportsService.findAll({ page: 1, limit: 50 })
            ]);
            const teacherClasses = classesData.classes.filter(cls => cls.headTeacherId && cls.headTeacherId.toString() === currentTeacher._id.toString());
            const studentIds = new Set();
            teacherClasses.forEach(cls => {
                if (cls.students && Array.isArray(cls.students)) {
                    cls.students.forEach(studentId => studentIds.add(studentId.toString()));
                }
            });
            const students = allUsers.filter(u => u.roles && u.roles.includes('student') &&
                studentIds.has(u._id.toString())).map(user => {
                const userObj = user.toObject();
                return {
                    ...userObj,
                    name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.nisn || 'Unknown User'
                };
            });
            const enhancedAllUsers = allUsers.map(user => {
                const userObj = user.toObject();
                return {
                    ...userObj,
                    name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || userObj.nisn || 'Unknown User'
                };
            });
            console.log('Teacher Dashboard Service - Debug Info:');
            console.log('Current teacher:', currentTeacher.firstName, currentTeacher.lastName, 'ID:', currentTeacher._id.toString());
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
                students,
                users: enhancedAllUsers,
                classes: classesData.classes,
                teacherReports: teacherReportsData.data,
                points: pointLogsData.data,
                questParticipants: questParticipantsData.participants,
                quests: questsData.quests,
                appeals: appealsData.appeals,
            };
            this.logger.debug(`Completed timer for: ${timerId}`);
            return dashboardData;
        }
        catch (error) {
            this.logger.debug(`Completed timer for: ${timerId}`, { error: true });
            this.logger.error('Failed to fetch teacher dashboard data', error instanceof Error ? error.stack : String(error), {
                metadata: { userId: user.id || user.nisn, year },
            });
            throw error;
        }
    }
    async getStudentDashboard(user, year) {
        const timerId = this.startTimer('student_dashboard', { userId: user.nisn, year });
        try {
            const [pointLogsData, questsData, leaderboardUsers, appealsData, teacherReportsData, currentUser, questParticipantsData, allPointLogs] = await Promise.all([
                this.pointLogsService.findAll({ page: 1, limit: 100, studentId: user.id }),
                this.questsService.findAll({ page: 1, limit: 50 }),
                this.userModel.find({ roles: 'student' }).limit(100).exec(),
                this.appealsService.findAll({ page: 1, limit: 50 }),
                this.teacherReportsService.findAll({ page: 1, limit: 50 }),
                this.userModel.findById(user.id).populate('classId').exec(),
                this.questParticipantsService.findAll({ page: 1, limit: 100, studentId: user.id }),
                this.pointLogsService.findAll({ page: 1, limit: 1000 })
            ]);
            let userClass = null;
            if (currentUser?.classId) {
                const classId = typeof currentUser.classId === 'object' && currentUser.classId._id
                    ? currentUser.classId._id.toString()
                    : currentUser.classId.toString();
                const classData = await this.classesService.findOne(classId);
                userClass = classData;
            }
            const studentIds = leaderboardUsers.map(student => student._id.toString());
            const awardPointsMap = await this.awardsService.getAwardPointsForUsers(studentIds);
            const leaderboardData = leaderboardUsers.map(student => {
                const studentId = student._id.toString();
                const studentPoints = allPointLogs.data.filter(p => p.studentId === studentId);
                const totalPoints = studentPoints.reduce((acc, p) => acc + p.points, 0);
                const badgeCount = studentPoints.filter(p => p.badge).length;
                const awardPoints = awardPointsMap[studentId] || 0;
                let streak = 0;
                const violations = studentPoints
                    .filter(log => log.type === point_log_entity_1.PointType.VIOLATION)
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
                else {
                    const firstActivity = studentPoints
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
                    if (firstActivity) {
                        const firstActivityDate = new Date(firstActivity.timestamp);
                        const today = new Date();
                        today.setHours(23, 59, 59, 999);
                        firstActivityDate.setHours(0, 0, 0, 0);
                        const diffTime = today.getTime() - firstActivityDate.getTime();
                        streak = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
                    }
                    else {
                        streak = 0;
                    }
                }
                return {
                    ...student.toObject(),
                    totalPoints: Math.max(0, Math.min(100, totalPoints)),
                    badgeCount,
                    awardPoints,
                    streak
                };
            }).sort((a, b) => b.totalPoints - a.totalPoints);
            let classLeaderboardData = [];
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
                const currentUserInClassLeaderboard = classLeaderboardData.find(student => student._id.toString() === user.id);
                if (!currentUserInClassLeaderboard) {
                    const currentUserData = leaderboardData.find(student => student._id.toString() === user.id);
                    if (currentUserData) {
                        classLeaderboardData.push(currentUserData);
                        classLeaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
                    }
                }
            }
            const dashboardData = {
                points: pointLogsData.data,
                quests: questsData.quests,
                questParticipants: questParticipantsData.participants || [],
                leaderboardUsers: leaderboardData,
                classLeaderboardUsers: classLeaderboardData,
                appeals: appealsData.appeals,
                teacherReports: teacherReportsData.data,
                userClass,
            };
            this.logger.debug(`Completed timer for: ${timerId}`);
            return dashboardData;
        }
        catch (error) {
            this.logger.debug(`Completed timer for: ${timerId}`, { error: true });
            this.logger.error('Failed to fetch student dashboard data', error instanceof Error ? error.stack : String(error), {
                metadata: { userId: user.id || user.nisn, year },
            });
            throw error;
        }
    }
    async getParentDashboard(user, year) {
        const timerId = this.startTimer('parent_dashboard', { userId: user.nisn, year });
        try {
            const [pointLogsData, questsData, appealsData, teacherReportsData] = await Promise.all([
                this.pointLogsService.findAll({ page: 1, limit: 100 }),
                this.questsService.findAll({ page: 1, limit: 50 }),
                this.appealsService.findAll({ page: 1, limit: 50 }),
                this.teacherReportsService.findAll({ page: 1, limit: 50 })
            ]);
            const dashboardData = {
                children: [],
                points: pointLogsData.data,
                quests: questsData.quests,
                questParticipants: [],
                appeals: appealsData.appeals,
                teacherReports: teacherReportsData.data,
            };
            this.logger.debug(`Completed timer for: ${timerId}`);
            return dashboardData;
        }
        catch (error) {
            this.logger.debug(`Completed timer for: ${timerId}`, { error: true });
            this.logger.error('Failed to fetch parent dashboard data', error instanceof Error ? error.stack : String(error), {
                metadata: { userId: user.id || user.nisn, year },
            });
            throw error;
        }
    }
};
exports.DashboardsService = DashboardsService;
exports.DashboardsService = DashboardsService = DashboardsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        quests_service_1.QuestsService,
        quest_participants_service_1.QuestParticipantsService,
        appeals_service_1.AppealsService,
        point_logs_service_1.PointLogsService,
        teacher_reports_service_1.TeacherReportsService,
        action_presets_service_1.ActionPresetsService,
        classes_service_1.ClassesService,
        audit_logs_service_1.AuditLogsService,
        awards_service_1.AwardsService])
], DashboardsService);
//# sourceMappingURL=dashboards.service.js.map