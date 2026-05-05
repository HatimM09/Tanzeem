import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import 'express-async-errors';

import itemsRouter      from './routes/items';
import scansRouter      from './routes/scans';
import complaintsRouter from './routes/complaints';
import authRouter       from './routes/auth';
import syncRouter       from './routes/sync';
import auditRouter      from './routes/audit';
import { BackupService } from './services/backupService';
import { globalErrorHandler } from './middleware/error';
import prisma from './lib/prisma';

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: true, // Allow all origins for local development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static file serving (uploaded images) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health check (with Database verification) ──────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'disconnected';
    console.error('Database connection failed:', e);
  }

  res.json({
    status:  dbStatus === 'connected' ? 'ok' : 'error',
    database: dbStatus,
    service: 'Procurement Tracker API',
    version: '1.0.0',
    time:    new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/items',      itemsRouter);
app.use('/api/scans',      scansRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/sync',       syncRouter);
app.use('/api/audit-logs', auditRouter);

// ─── API Docs (simple HTML) ───────────────────────────────────────────────────
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name:    'Procurement Tracker — Al Jamea tus Saifiyah API',
    version: '1.0.0',
    base:    `http://localhost:${PORT}`,
    endpoints: {
      health:     'GET  /health',
      items: [
        'GET    /api/items                   — list all items (filter: ?category=&search=&page=&limit=)',
        'GET    /api/items/stats             — dashboard statistics',
        'GET    /api/items/:id               — get item by ID',
        'GET    /api/items/barcode/:code     — lookup item by barcode',
        'POST   /api/items                   — create item (multipart: name,assignedTo,location,category,photo)',
        'PUT    /api/items/:id               — update item',
        'DELETE /api/items/:id               — delete item',
      ],
      scans: [
        'GET    /api/scans                   — list scan records (filter: ?scannedBy=&page=&limit=)',
        'POST   /api/scans                   — record a scan { barcode, scannedBy }',
        'DELETE /api/scans/:id               — delete scan record',
      ],
      complaints: [
        'GET    /api/complaints              — list complaints (filter: ?status=open|resolved&raisedBy=)',
        'GET    /api/complaints/:id          — get complaint by ID',
        'POST   /api/complaints              — raise complaint (multipart: itemId,description,raisedBy,photo)',
        'PATCH  /api/complaints/:id/resolve  — resolve complaint (multipart: resolvedNote,resolvedBy,photo)',
        'DELETE /api/complaints/:id          — delete complaint',
      ],
    },
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n📚 Procurement Tracker API Server`);
    console.log(`   ➜  http://localhost:${PORT}`);
    console.log(`   ➜  API docs: http://localhost:${PORT}/api`);
    console.log(`   ➜  Health:   http://localhost:${PORT}/health\n`);
  });
}

export default app;
