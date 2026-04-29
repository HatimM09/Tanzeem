import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseCSV(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Basic CSV parser (handles quotes for commas inside descriptions)
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
    
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    return obj;
  });
}

async function main() {
  console.log('🚀 Starting CSV Import...');

  // 1. Import Inventory
  const inventoryPath = path.join(__dirname, '../../Backend_Inventory_Template.csv');
  if (fs.existsSync(inventoryPath)) {
    console.log('📦 Importing Inventory...');
    const items = parseCSV(inventoryPath);
    for (const item of items) {
      await prisma.item.upsert({
        where: { barcode: item.Barcode },
        update: {},
        create: {
          barcode: item.Barcode,
          name: item.Name,
          sku: item.SKU,
          category: item.Category,
          unitPrice: parseFloat(item.UnitPrice) || 0,
          unit: item.Unit,
          vendor: item.Vendor,
          vendorLogo: item.VendorLogo,
          stock: parseInt(item.Stock) || 0,
          reorderLevel: parseInt(item.ReorderLevel) || 0,
          description: item.Description,
          weight: item.Weight,
          origin: item.Origin,
          assignedTo: 'Unassigned',
          location: 'Main Warehouse',
        }
      });
    }
    console.log(`✅ ${items.length} items imported.`);
  }

  // 2. Import Users
  const usersPath = path.join(__dirname, '../../user_accounts.csv');
  if (fs.existsSync(usersPath)) {
    console.log('👤 Importing Users...');
    const users = parseCSV(usersPath);
    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.Email },
        update: {},
        create: {
          id: user.ID,
          name: user.Name,
          email: user.Email,
          phone: user.Phone,
          role: user.Role.toLowerCase() as any,
          password: '$2a$10$8.N/9H5S4Bf7Uv.R1P8C1.R/UoX5L.Q6O2S6G.S6G.S6G.S6G.S6G', // default hashed 'mahad123'
        }
      });
    }
    console.log(`✅ ${users.length} users imported.`);
  }

  console.log('\n🌟 Import process completed!');
}

main()
  .catch(e => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
