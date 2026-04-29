import prisma from '../lib/prisma';
import { AppError } from '../middleware/error';

export class ScanService {
  static async list(filters: { scannedBy?: string; page: number; limit: number }) {
    const { scannedBy, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (scannedBy) where.scannedBy = scannedBy;

    const [scans, total] = await Promise.all([
      prisma.scanRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scannedAt: 'desc' },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              assignedTo: true,
              location: true,
              category: true,
            },
          },
        },
      }),
      prisma.scanRecord.count({ where }),
    ]);

    return {
      scans,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  static async record(barcode: string, scannedBy: string = 'Supervisor') {
    const item = await prisma.item.findUnique({
      where: { barcode },
      select: { id: true },
    });

    return prisma.scanRecord.create({
      data: {
        barcode,
        scannedBy,
        itemId: item?.id,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            assignedTo: true,
            location: true,
            category: true,
          },
        },
      },
    });
  }

  static async delete(id: string) {
    try {
      await prisma.scanRecord.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppError('Scan record not found', 404);
    }
  }
}
