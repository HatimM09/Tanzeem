import { Router, Request, Response } from 'express';
import { ItemService } from '../services/itemService';
import { validate } from '../middleware/validate';
import { createItemSchema, updateItemSchema } from '../schemas/itemSchema';
import { upload } from '../middleware/upload';
import { requireAuth } from '../middleware/auth';
import { syncItemToSheets } from '../services/googleSheets';


const router = Router();

router.use(requireAuth);

// ─── GET /api/items ───────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query as Record<string, string>;
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '50');

  const result = await ItemService.list({ category, search, page, limit });

  res.json({
    success: true,
    data: result.items,
    meta: {
      total: result.total,
      page,
      limit,
      pages: result.pages
    },
  });
});

// ─── GET /api/items/stats ─────────────────────────────────────────────────────
router.get('/stats', async (_req: Request, res: Response) => {
  const stats = await ItemService.getStats();
  res.json({
    success: true,
    data: stats,
  });
});

// ─── GET /api/items/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const item = await ItemService.getById(req.params.id);
  res.json({ success: true, data: item });
});

// ─── GET /api/items/barcode/:code ─────────────────────────────────────────────
router.get('/barcode/:code', async (req: Request, res: Response) => {
  const item = await ItemService.getByBarcode(req.params.code);
  res.json({
    success: true,
    data: item
  });
});

// ─── POST /api/items ──────────────────────────────────────────────────────────
router.post('/',
  upload.single('photo'),
  validate(createItemSchema),
  async (req: Request, res: Response) => {
    const { name, assignedTo, location, category, createdBy } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await ItemService.create({
      name,
      assignedTo,
      location,
      category,
      createdBy,
      photoUrl,
    });

    // Fire and forget: Sync to Google Sheets
    syncItemToSheets(item).catch(err => console.error(err));

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item created and barcode generated'
    });
  }
);

// ─── PUT /api/items/:id ───────────────────────────────────────────────────────
router.put('/:id',
  upload.single('photo'),
  validate(updateItemSchema),
  async (req: Request, res: Response) => {
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const item = await ItemService.update(req.params.id, {
      ...req.body,
      photoUrl,
    });

    // Fire and forget: Sync to Google Sheets
    syncItemToSheets(item).catch(err => console.error(err));

    res.json({
      success: true,
      data: item,
      message: 'Item updated'
    });
  }
);

// ─── DELETE /api/items/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  await ItemService.delete(req.params.id);
  res.json({ success: true, message: 'Item deleted' });
});

// ─── POST /api/items/bulk-create ─────────────────────────────────────────────
router.post('/bulk-create', async (req: Request, res: Response) => {
  const { items, performedBy } = req.body;
  
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Items must be an array' });
  }

  const result = await ItemService.bulkCreate(items, performedBy || 'Admin');
  
  res.status(201).json({
    success: true,
    data: result,
    message: `Successfully imported ${items.length} items`
  });
});

export default router;
