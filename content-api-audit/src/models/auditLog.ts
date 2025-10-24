class AuditLog {
    contentType: string;
    recordId: string;
    actionType: 'create' | 'update' | 'delete';
    timestamp: Date;
    user?: string;
    changedFields?: Record<string, any>;

    constructor(contentType: string, recordId: string, actionType: 'create' | 'update' | 'delete', user?: string, changedFields?: Record<string, any>) {
        this.contentType = contentType;
        this.recordId = recordId;
        this.actionType = actionType;
        this.timestamp = new Date();
        this.user = user;
        this.changedFields = changedFields;
    }
}

export default AuditLog;