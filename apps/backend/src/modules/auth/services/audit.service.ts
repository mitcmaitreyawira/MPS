import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../../database/schemas/audit-log.schema';
import { AuditAction } from '../enums/audit-action.enum';

type AuditData = Record<string, any>;

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  async log(
    userId: string,
    action: AuditAction,
    resource: string,
    resourceId: string,
    data?: AuditData,
  ): Promise<AuditLog> {
    const audit = new this.auditModel({
      userId,
      action,
      resource,
      resourceId,
      data,
      timestamp: new Date(),
    });
    return audit.save();
  }

  async getLogs(
    userId?: string,
    resource?: string,
    resourceId?: string,
    action?: AuditAction,
    limit = 100,
    skip = 0,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const query: any = {};
    
    if (userId) query.userId = userId;
    if (resource) query.resource = resource;
    if (resourceId) query.resourceId = resourceId;
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      this.auditModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments(query),
    ]);

    return { logs, total };
  }
}
