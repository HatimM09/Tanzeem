import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'procure-tracker-secret-2024';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string; name: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { userId: payload.userId, role: payload.role, name: payload.name };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ success: false, error: `Access denied. ${role} role required.` });
    }
    next();
  };
}
