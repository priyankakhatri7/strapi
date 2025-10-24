class AuditLogService {
    private config: {
        enabled: boolean;
        excludeContentTypes: string[];
    };

    constructor(database, config = { enabled: true, excludeContentTypes: [] }) {
        this.database = database;
        this.config = config;
    }

    private checkPermission(user) {
        if (!user || !user.permissions || !user.permissions.includes('read_audit_logs')) {
            throw new Error('Unauthorized: Requires read_audit_logs permission');
        }
    }

    private shouldLog(contentType: string): boolean {
        if (!this.config.enabled) return false;
        return !this.config.excludeContentTypes.some(
            pattern => contentType.match(new RegExp(pattern.replace('*', '.*')))
        );
    }

    async createAuditLog(auditLogData, contentType: string) {
        if (!this.shouldLog(contentType)) return null;
        
        const auditLog = new this.database.models.AuditLog(auditLogData);
        return await auditLog.save();
    }

    async getAuditLogs(user, filter = {}, pagination = { page: 1, limit: 10 }) {
        this.checkPermission(user);
        
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        return await this.database.models.AuditLog.find(filter)
            .skip(offset)
            .limit(limit)
            .sort({ timestamp: -1 });
    }

    async countAuditLogs(user, filter = {}) {
        this.checkPermission(user);
        return await this.database.models.AuditLog.countDocuments(filter);
    }
}

export default AuditLogService;