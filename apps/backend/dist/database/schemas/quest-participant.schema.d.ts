import { Document, Types } from 'mongoose';
export type QuestParticipantDocument = QuestParticipant & Document;
export declare enum QuestCompletionStatus {
    IN_PROGRESS = "in_progress",
    SUBMITTED_FOR_REVIEW = "submitted_for_review",
    COMPLETED = "completed"
}
export declare class QuestParticipant {
    questId: Types.ObjectId;
    studentId: Types.ObjectId;
    status: QuestCompletionStatus;
    submittedAt?: Date;
    completedAt?: Date;
    reviewNotes?: string;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    submissionNotes?: string;
    attachments?: string[];
    academicYear?: string;
    pointLogId?: Types.ObjectId;
}
export declare const QuestParticipantSchema: import("mongoose").Schema<QuestParticipant, import("mongoose").Model<QuestParticipant, any, any, any, Document<unknown, any, QuestParticipant, any, {}> & QuestParticipant & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QuestParticipant, Document<unknown, {}, import("mongoose").FlatRecord<QuestParticipant>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<QuestParticipant> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=quest-participant.schema.d.ts.map