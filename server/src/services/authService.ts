import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../lib/localDb';
import { AppError } from '../middleware/error';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'procure-tracker-secret-2024';

export class AuthService {
  static async login(email: string, password: string, role: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== role) {
      throw new AppError('Invalid credentials or role', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return {
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
    };
  }

  static async me(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, role: true, email: true, phone: true },
      });
      if (!user) throw new AppError('User not found', 404);
      return user;
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}
