export interface AuditLog {
    contentType: string;
    recordId: string;
    actionType: 'create' | 'update' | 'delete';
    timestamp: Date;
    user?: string;
    changedFields?: Record<string, any>;
}