import { Router, Request, Response } from 'express';
import { AuditService } from '../services/auditService';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '100');
  const logs = await AuditService.list(limit);
  res.json({ success: true, data: logs });
});

export default router;
