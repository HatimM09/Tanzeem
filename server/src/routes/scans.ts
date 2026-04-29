import { Router, Request, Response } from 'express';
import { ScanService } from '../services/scanService';
import { validate } from '../middleware/validate';
import { recordScanSchema } from '../schemas/scanSchema';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// ─── GET /api/scans ───────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const { scannedBy } = req.query as Record<string, string>;
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '50');

  const result = await ScanService.list({ scannedBy, page, limit });

  res.json({
    success: true,
    data: result.scans,
    meta: {
      total: result.total,
      page,
      limit,
      pages: result.pages
    },
  });
});

// ─── POST /api/scans ──────────────────────────────────────────────────────────
router.post('/',
  validate(recordScanSchema),
  async (req: Request, res: Response) => {
    const { barcode, scannedBy } = req.body;
    const scan = await ScanService.record(barcode, scannedBy);

    res.status(201).json({
      success: true,
      data: scan,
      message: 'Scan recorded successfully'
    });
  }
);

// ─── DELETE /api/scans/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  await ScanService.delete(req.params.id);
  res.json({ success: true, message: 'Scan record deleted' });
});

export default router;
