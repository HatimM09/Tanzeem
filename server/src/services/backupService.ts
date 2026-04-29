import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

export class BackupService {
  static async performDailyBackup() {
    const backupDate = new Date().toISOString().split('T')[0];
    const backupDir = path.join(__dirname, '../../data/backups', backupDate);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      // 1. Export Inventory
      const items = await prisma.item.findMany();
      this.saveToCsv(path.join(backupDir, 'inventory.csv'), items);

      // 2. Export Complaints
      const complaints = await prisma.complaint.findMany();
      this.saveToCsv(path.join(backupDir, 'complaints.csv'), complaints);

      // 3. Export Proofs (Resolved Complaints with Photos)
      const proofs = await prisma.complaint.findMany({
        where: { status: 'OPEN', NOT: { resolvedPhotoUrl: null } }
      });
      this.saveToCsv(path.join(backupDir, 'proofs.csv'), proofs);

      // 4. Export Logs
      const logs = await prisma.auditLog.findMany();
      this.saveToCsv(path.join(backupDir, 'logs.csv'), logs);

      console.log(`[Backup] Daily backup completed for ${backupDate}`);
      return { success: true, date: backupDate, path: backupDir };
    } catch (error) {
      console.error('[Backup] Failed to perform daily backup', error);
      throw error;
    }
  }

  private static saveToCsv(filePath: string, data: any[]) {
    if (data.length === 0) {
      fs.writeFileSync(filePath, 'No data found');
      return;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const val = row[header];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(filePath, csvContent);
  }
}
