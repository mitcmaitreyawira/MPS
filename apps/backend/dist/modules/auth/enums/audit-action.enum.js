"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = void 0;
var AuditAction;
(function (AuditAction) {
    AuditAction["USER_LOGIN"] = "USER_LOGIN";
    AuditAction["USER_LOGOUT"] = "USER_LOGOUT";
    AuditAction["USER_CREATED"] = "USER_CREATED";
    AuditAction["USER_UPDATED"] = "USER_UPDATED";
    AuditAction["USER_DELETED"] = "USER_DELETED";
    AuditAction["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    AuditAction["PASSWORD_RESET_REQUESTED"] = "PASSWORD_RESET_REQUESTED";
    AuditAction["PASSWORD_RESET_COMPLETED"] = "PASSWORD_RESET_COMPLETED";
    AuditAction["PASSWORD_EXPIRED"] = "PASSWORD_EXPIRED";
    AuditAction["ROLE_ASSIGNED"] = "ROLE_ASSIGNED";
    AuditAction["ROLE_REVOKED"] = "ROLE_REVOKED";
    AuditAction["PERMISSION_GRANTED"] = "PERMISSION_GRANTED";
    AuditAction["PERMISSION_REVOKED"] = "PERMISSION_REVOKED";
    AuditAction["SYSTEM_MAINTENANCE"] = "SYSTEM_MAINTENANCE";
    AuditAction["CONFIGURATION_CHANGED"] = "CONFIGURATION_CHANGED";
    AuditAction["BRUTE_FORCE_ATTEMPT"] = "BRUTE_FORCE_ATTEMPT";
    AuditAction["ACCOUNT_LOCKED"] = "ACCOUNT_LOCKED";
    AuditAction["ACCOUNT_UNLOCKED"] = "ACCOUNT_UNLOCKED";
    AuditAction["ADMIN_IMPERSONATION_START"] = "ADMIN_IMPERSONATION_START";
    AuditAction["ADMIN_IMPERSONATION_END"] = "ADMIN_IMPERSONATION_END";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=audit-action.enum.js.map