import prisma from '../lib/prisma';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { generateBarcode } from '../utils/barcode';
import { v4 as uuidv4 } from 'uuid';

export class GoogleSyncService {
  /**
   * Fetches data from a Google Sheet (published as CSV) and syncs it to the database.
   * Format expected: Name, SKU, Category, UnitPrice, Unit, Vendor, Stock, ReorderLevel, Description, Weight, Origin, AssignedTo, Location
   */
  static async syncFromSheet(sheetUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Ensure the URL is for CSV export
      let csvUrl = sheetUrl;
      if (sheetUrl.includes('/edit')) {
        csvUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv');
      }

      const fetchCsv = (url: string) => {
        https.get(url, (res) => {
          // Handle Redirects
          if (res.statusCode === 301 || res.statusCode === 302) {
            if (res.headers.location) {
              fetchCsv(res.headers.location);
              return;
            }
          }

          if (res.statusCode !== 200) {
            reject(new Error(`Failed to fetch sheet: Status ${res.statusCode}`));
            return;
          }

          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', async () => {
            try {
              // Save a copy to local storage
              const exportDir = path.join(__dirname, '../../data/exports');
              if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
              
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const filename = `sync-backup-${timestamp}.csv`;
              fs.writeFileSync(path.join(exportDir, filename), data);

              const result = await this.processCsvData(data);
              resolve({ ...result, filename });
            } catch (err) {
              reject(err);
            }
          });
        }).on('error', (err) => {
          reject(err);
        });
      };

      fetchCsv(csvUrl);
    });
  }

  private static async processCsvData(csvData: string) {
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return { added: 0, updated: 0 };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
    const items = lines.slice(1);

    let added = 0;
    let updated = 0;

    for (const line of items) {
      // Robust CSV parsing
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: any = {};
      headers.forEach((h, i) => { 
        // Map common aliases
        let key = h;
        if (h.includes('name') || h === 'item') key = 'name';
        if (h.includes('price')) key = 'unitprice';
        if (h.includes('level') || h.includes('reorder')) key = 'reorderlevel';
        if (h.includes('assigned') || h.includes('owner')) key = 'assignedto';
        if (h.includes('sku') || h.includes('code')) key = 'sku';
        if (h.includes('count') || h.includes('qty')) key = 'stock';
        
        row[key] = values[i]; 
      });

      // Map row to database fields
      const barcode = row.barcode || row.sku || generateBarcode(uuidv4(), row.category || 'General');
      
      const itemData: any = {
        name: row.name || 'Unnamed Item',
        sku: row.sku || null,
        category: row.category || 'Other',
        unitPrice: parseFloat(String(row.unitprice).replace(/[^0-9.]/g, '')) || 0,
        unit: row.unit || 'unit',
        vendor: row.vendor || null,
        vendorLogo: row.vendorlogo || null,
        stock: parseInt(String(row.stock).replace(/[^0-9]/g, '')) || 0,
        reorderLevel: parseInt(String(row.reorderlevel).replace(/[^0-9]/g, '')) || 0,
        description: row.description || '',
        weight: row.weight || null,
        origin: row.origin || null,
        assignedTo: row.assignedto || 'Unassigned',
        location: row.location || 'Main Store',
        createdBy: 'Google Sheets Sync',
      };

      const existing = await prisma.item.findUnique({ where: { barcode } });

      if (existing) {
        await prisma.item.update({
          where: { barcode },
          data: itemData,
        });
        updated++;
      } else {
        await prisma.item.create({
          data: {
            ...itemData,
            barcode,
          },
        });
        added++;
      }
    }

    return { added, updated };
  }
}
