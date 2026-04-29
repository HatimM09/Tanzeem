import { Router, Request, Response } from 'express';
import { ComplaintService } from '../services/complaintService';
import { validate } from '../middleware/validate';
import { raiseComplaintSchema, resolveComplaintSchema } from '../schemas/complaintSchema';
import { upload } from '../middleware/upload';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// ─── GET /api/complaints ──────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const { status, raisedBy } = req.query as Record<string, string>;
  const complaints = await ComplaintService.list({ status, raisedBy });
  res.json({ success: true, data: complaints });
});

// ─── GET /api/complaints/:id ──────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const complaint = await ComplaintService.getById(req.params.id);
  res.json({ success: true, data: complaint });
});

// ─── POST /api/complaints ─────────────────────────────────────────────────────
router.post('/',
  upload.single('photo'),
  validate(raiseComplaintSchema),
  async (req: Request, res: Response) => {
    const { itemId, description, raisedBy } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await ComplaintService.raise({
      itemId,
      description,
      raisedBy,
      photoUrl
    });

    res.status(201).json({
      success: true,
      data: complaint,
      message: 'Complaint raised'
    });
  }
);

// ─── PATCH /api/complaints/:id/resolve ────────────────────────────────────────
router.patch('/:id/resolve',
  upload.single('photo'),
  validate(resolveComplaintSchema),
  async (req: Request, res: Response) => {
    const { resolvedNote, resolvedBy } = req.body;
    const resolvedPhotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await ComplaintService.resolve(req.params.id, {
      resolvedNote,
      resolvedBy,
      resolvedPhotoUrl
    });

    res.json({
      success: true,
      data: complaint,
      message: 'Complaint resolved'
    });
  }
);

// ─── DELETE /api/complaints/:id ───────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  await ComplaintService.delete(req.params.id);
  res.json({ success: true, message: 'Complaint deleted' });
});

export default router;
