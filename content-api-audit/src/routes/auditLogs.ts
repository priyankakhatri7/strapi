import { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLogService';

export const setAuditLogRoutes = (app, auditLogService: AuditLogService) => {
    app.get('/audit-logs', async (req: Request, res: Response) => {
        try {
            const {
                contentType,
                userId,
                actionType,
                startDate,
                endDate,
                page = 1,
                limit = 10,
                sort = 'timestamp',
                order = 'desc'
            } = req.query;

            // Build filter object
            const filter: any = {};
            
            if (contentType) {
                filter.contentType = contentType;
            }
            if (userId) {
                filter.userId = userId;
            }
            if (actionType) {
                filter.action = actionType;
            }
            if (startDate || endDate) {
                filter.timestamp = {};
                if (startDate) {
                    filter.timestamp.$gte = new Date(startDate as string);
                }
                if (endDate) {
                    filter.timestamp.$lte = new Date(endDate as string);
                }
            }

            // Get paginated results
            const logs = await auditLogService.getAuditLogs(
                req.user,
                req.headers.authorization,
                filter,
                {
                    page: Number(page),
                    limit: Math.min(Number(limit), 100),
                    sort: {
                        [sort as string]: order === 'desc' ? -1 : 1
                    }
                }
            );

            // Get total count for pagination
            const total = await auditLogService.countAuditLogs(
                req.user,
                filter
            );

            res.json({
                data: logs,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                },
                meta: {
                    filters: filter,
                    sort: {
                        field: sort,
                        order
                    }
                }
            });

        } catch (error) {
            res.status(error.message.includes('Unauthorized') ? 403 : 500).json({
                error: error.message
            });
        }
    });
};