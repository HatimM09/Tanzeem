import prisma from '../lib/prisma';
import { AppError } from '../middleware/error';
import { ComplaintStatus } from '@prisma/client';

export class ComplaintService {
  static async list(filters: { status?: string; raisedBy?: string }) {
    const { status, raisedBy } = filters;
    
    const where: any = {};
    if (status) where.status = status.toUpperCase() as ComplaintStatus;
    if (raisedBy) where.raisedBy = raisedBy;

    return prisma.complaint.findMany({
      where,
      orderBy: { raisedAt: 'desc' },
    });
  }

  static async getById(id: string) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });
    if (!complaint) throw new AppError('Complaint not found', 404);
    return complaint;
  }

  static async raise(data: { itemId: string; description: string; raisedBy?: string; photoUrl?: string | null }) {
    const item = await prisma.item.findUnique({
      where: { id: data.itemId },
      select: { name: true, barcode: true, location: true },
    });
    
    if (!item) throw new AppError('Item not found', 404);

    // Auto-downgrade condition to Poor when a complaint is raised
    await prisma.item.update({
      where: { id: data.itemId },
      data: { condition: 'Poor' }
    });

    return prisma.complaint.create({
      data: {
        itemId: data.itemId,
        itemName: item.name,
        itemBarcode: item.barcode,
        location: item.location,
        description: data.description,
        raisedBy: data.raisedBy || 'Supervisor',
        status: ComplaintStatus.OPEN,
      },
    });
  }

  static async resolve(id: string, data: { resolvedNote: string; resolvedBy?: string; resolvedPhotoUrl?: string | null }) {
    const existing = await prisma.complaint.findUnique({
      where: { id },
      select: { status: true, itemId: true },
    });

    if (!existing) throw new AppError('Complaint not found', 404);
    if (existing.status === ComplaintStatus.RESOLVED) throw new AppError('Complaint already resolved', 400);

    // Auto-upgrade condition back to Good when a complaint is resolved
    await prisma.item.update({
      where: { id: existing.itemId },
      data: { condition: 'Good' }
    });

    return prisma.complaint.update({
      where: { id },
      data: {
        status: ComplaintStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy: data.resolvedBy || 'Admin',
        resolvedNote: data.resolvedNote,
        resolvedPhotoUrl: data.resolvedPhotoUrl,
      },
    });
  }

  static async delete(id: string) {
    try {
      await prisma.complaint.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppError('Complaint not found', 404);
    }
  }
}
