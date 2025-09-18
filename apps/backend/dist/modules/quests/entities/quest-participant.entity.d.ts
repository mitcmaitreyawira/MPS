export declare enum QuestCompletionStatus {
    IN_PROGRESS = "in_progress",
    SUBMITTED_FOR_REVIEW = "submitted_for_review",
    COMPLETED = "completed"
}
export declare class QuestParticipant {
    questId: string;
    studentId: string;
    joinedAt: Date;
    status: QuestCompletionStatus;
    submittedAt?: Date;
    completedAt?: Date;
    reviewNotes?: string;
    academicYear?: string;
}
//# sourceMappingURL=quest-participant.entity.d.ts.map