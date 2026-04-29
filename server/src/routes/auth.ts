import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { validate } from '../middleware/validate';
import { loginSchema } from '../schemas/authSchema';

const router = Router();

// ── POST /api/auth/login ──────────────────────────────────────────────
router.post('/login',
  validate(loginSchema),
  async (req: Request, res: Response) => {
    const { email, password, role } = req.body;
    const result = await AuthService.login(email, password, role);

    res.json({
      success: true,
      token: result.token,
      user: result.user,
      message: `Welcome back, ${result.user.name}!`,
    });
  }
);

// ── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const user = await AuthService.me(authHeader.slice(7));
  res.json({ success: true, user });
});

export default router;
