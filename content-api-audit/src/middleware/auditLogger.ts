export interface AuditLogEntry {
    contentType: string;
    recordId: string;
    actionType: 'create' | 'update' | 'delete';
    timestamp: Date;
    user?: string;
    changedFields?: Record<string, any>;
}

import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/auditLog';

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl, body, user } = req;
    const actionType = method === 'POST' ? 'create' : method === 'PUT' ? 'update' : method === 'DELETE' ? 'delete' : null;

    if (actionType) {
        const auditLogEntry: AuditLogEntry = {
            contentType: originalUrl.split('/')[1], // Assuming the content type is the first segment of the URL
            recordId: body.id || '', // Assuming the record ID is sent in the body
            actionType,
            timestamp: new Date(),
            user: user ? user.id : undefined, // Assuming user is attached to the request
            changedFields: actionType === 'update' ? body : undefined, // Log changed fields only for updates
        };

        const auditLog = new AuditLog(auditLogEntry);
        auditLog.save(); // Save the audit log entry to the database
    }

    next();
};