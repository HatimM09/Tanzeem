import { Router, Request, Response } from 'express';
import { GoogleSyncService } from '../services/googleSync';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// ─── POST /api/sync/google-sheets ───────────────────────────────────────────
router.post('/google-sheets', async (req: Request, res: Response) => {
  const { sheetUrl } = req.body;

  if (!sheetUrl) {
    return res.status(400).json({ success: false, error: 'Google Sheet URL is required' });
  }

  try {
    const result = await GoogleSyncService.syncFromSheet(sheetUrl);
    res.json({
      success: true,
      data: result,
      message: 'Sync completed successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync with Google Sheets'
    });
  }
});

// ─── GET /api/sync/backups ──────────────────────────────────────────────────
router.get('/backups', (req: Request, res: Response) => {
  const exportDir = path.join(__dirname, '../../data/exports');
  if (!fs.existsSync(exportDir)) {
    return res.json({ success: true, data: [] });
  }

  const files = fs.readdirSync(exportDir)
    .filter(f => f.endsWith('.csv'))
    .map(f => {
      const stats = fs.statSync(path.join(exportDir, f));
      return {
        name: f,
        size: stats.size,
        createdAt: stats.birthtime
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json({ success: true, data: files });
});

// ─── GET /api/sync/backups/:filename ────────────────────────────────────────
router.get('/backups/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../data/exports', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  res.download(filePath);
});

export default router;
