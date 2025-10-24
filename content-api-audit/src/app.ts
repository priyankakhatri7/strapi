import express from 'express';
import { setAuditLogRoutes } from './routes/auditLogs';
import { auditLogger } from './middleware/auditLogger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(auditLogger);

setAuditLogRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});