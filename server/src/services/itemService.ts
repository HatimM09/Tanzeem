import prisma from '../lib/prisma';
import { generateBarcode } from '../utils/barcode';
import { AppError } from '../middleware/error';
import { v4 as uuidv4 } from 'uuid';

export class ItemService {
  static async list(filters: { category?: string; search?: string; page: number; limit: number }) {
    const { category, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.item.count({ where }),
    ]);

    return {
      items,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  static async getById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
    });
    if (!item) throw new AppError('Item not found', 404);
    return item;
  }

  static async getStats() {
    const [total, byCategory, recentItems, openComplaints, resolvedComplaints, totalScans] = await Promise.all([
      prisma.item.count(),
      prisma.item.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { _count: { category: 'desc' } },
      }),
      prisma.item.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complaint.count({ where: { status: 'OPEN' } }),
      prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      prisma.scanRecord.count(),
    ]);

    return {
      totalItems: total,
      byCategory: byCategory.map(c => ({ category: c.category, count: c._count._all })),
      recentItems,
      openComplaints,
      resolvedComplaints,
      totalScans,
    };
  }

  static async getByBarcode(barcode: string) {
    const item = await prisma.item.findUnique({
      where: { barcode },
    });
    if (!item) throw new AppError('No item found for this barcode', 404);
    return item;
  }

  static async create(data: { name: string; assignedTo: string; location: string; category: string; createdBy?: string; photoUrl?: string | null }) {
    const id = uuidv4();
    const barcode = generateBarcode(id, data.category);

    return prisma.item.create({
      data: {
        id,
        name: data.name,
        assignedTo: data.assignedTo,
        location: data.location,
        category: data.category,
        photoUrl: data.photoUrl,
        barcode,
        createdBy: data.createdBy || 'Admin',
      },
    });
  }

  static async update(id: string, data: Partial<{ name: string; assignedTo: string; location: string; category: string; photoUrl: string | null }>) {
    try {
      const oldItem = await prisma.item.findUnique({ where: { id } });
      if (!oldItem) throw new AppError('Item not found', 404);

      const newItem = await prisma.item.update({
        where: { id },
        data: {
          name: data.name,
          assignedTo: data.assignedTo,
          location: data.location,
          category: data.category,
          photoUrl: data.photoUrl,
        },
      });

      // Calculate Diff
      const diff: any = {};
      (Object.keys(data) as Array<keyof typeof data>).forEach(key => {
        if ((oldItem as any)[key] !== (newItem as any)[key]) {
          diff[key] = { from: (oldItem as any)[key], to: (newItem as any)[key] };
        }
      });

      // Log the change
      if (Object.keys(diff).length > 0) {
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            entityType: 'ITEM',
            entityId: id,
            details: `Updated item: ${newItem.name}`,
            diff: JSON.stringify(diff),
            performedBy: 'Admin',
          }
        });
      }

      return newItem;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Item update failed', 500);
    }
  }

  static async delete(id: string) {
    try {
      await prisma.item.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppError('Item not found', 404);
    }
  }

  static async bulkCreate(items: any[], performedBy: string) {
    const data = items.map(item => {
      const id = uuidv4();
      return {
        id,
        name: item.name,
        assignedTo: item.assignedTo || 'Unassigned',
        location: item.location || 'Central Store',
        category: item.category || 'Other',
        photoUrl: item.photoUrl || null,
        barcode: item.barcode || generateBarcode(id, item.category || 'Other'),
        createdBy: performedBy,
        stock: item.stock || 1,
        condition: item.condition || 'Good',
      };
    });

    const result = await prisma.item.createMany({ data });

    await prisma.auditLog.create({
      data: {
        action: 'BULK_CREATE',
        entityType: 'ITEM',
        entityId: 'multiple',
        details: `Bulk created ${items.length} items`,
        performedBy,
      }
    });

    return result;
  }
}
