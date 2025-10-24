import { Request, Response } from 'express';
import { AuditLog } from '../src/models/auditLog';
import { AuditLogService } from '../src/services/auditLogService';
import { auditLogger } from '../src/middleware/auditLogger';

describe('auditLogger Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;
    let auditLogService: AuditLogService;
    let mockDB: any;

    beforeEach(() => {
        mockDB = {
            models: {
                AuditLog: jest.fn()
            }
        };

        const config = {
            enabled: true,
            excludeContentTypes: ['excluded-type']
        };

        auditLogService = new AuditLogService(mockDB, config);

        req = {
            body: {},
            method: 'POST',
            originalUrl: '/content-api',
            user: { 
                id: 'user123',
                permissions: ['read_audit_logs']
            },
            headers: {
                authorization: 'Bearer mock-token'
            }
        };
        res = {};
        next = jest.fn();
    });

    it('should create audit log for allowed content type', async () => {
        req.body = { 
            contentType: 'allowed-type',
            recordId: 'record123',
            changedFields: { field1: 'value1' }
        };

        await auditLogger(req as Request, res as Response, next);

        expect(mockDB.models.AuditLog).toHaveBeenCalledWith({
            contentType: 'allowed-type',
            recordId: 'record123',
            action: 'create',
            userId: 'user123',
            timestamp: expect.any(Date),
            changes: { field1: 'value1' }
        });
    });

    it('should not create audit log for excluded content type', async () => {
        req.body = {
            contentType: 'excluded-type',
            recordId: 'record123'
        };

        await auditLogger(req as Request, res as Response, next);

        expect(mockDB.models.AuditLog).not.toHaveBeenCalled();
    });

    it('should handle unauthorized access', async () => {
        req.user.permissions = [];
        
        await expect(
            auditLogService.getAuditLogs(req.user, {})
        ).rejects.toThrow('Unauthorized: Requires read_audit_logs permission');
    });

    it('should sanitize sensitive data', async () => {
        req.body = {
            contentType: 'user',
            recordId: 'user123',
            password: 'secret',
            token: 'sensitive-token',
            email: 'test@example.com'
        };

        await auditLogger(req as Request, res as Response, next);

        expect(mockDB.models.AuditLog).toHaveBeenCalledWith(
            expect.not.objectContaining({
                password: 'secret',
                token: 'sensitive-token'
            })
        );
    });
});