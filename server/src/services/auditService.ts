import prisma from '../lib/prisma';

export class AuditService {
  static async list(limit = 100) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { performedAt: 'desc' },
    });
  }

  static async create(data: { action: string; entityType: string; entityId: string; details: string; performedBy: string; diff?: string }) {
    return prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
        performedBy: data.performedBy,
        diff: data.diff,
      },
    });
  }
}
