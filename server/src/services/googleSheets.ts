import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

// Initialize auth - this requires google-credentials.json to be in the server/ folder
const credsFilePath = path.join(process.cwd(), 'google-credentials.json');

export async function syncItemToSheets(item: any) {
  try {
    if (!fs.existsSync(credsFilePath)) {
      console.warn('Google Sheets Sync Skipped: google-credentials.json not found in server directory.');
      return;
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      console.warn('Google Sheets Sync Skipped: GOOGLE_SHEET_ID not defined in .env');
      return;
    }

    const creds = JSON.parse(fs.readFileSync(credsFilePath, 'utf-8'));
    
    // Authenticate
    const serviceAccountAuth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo(); 
    const sheet = doc.sheetsByIndex[0]; // Gets the first tab of the spreadsheet

    // Define standard headers if they don't exist
    await sheet.setHeaderRow(['ID', 'Name', 'Category', 'Location', 'Assigned To', 'Barcode', 'Processor', 'RAM', 'Added At']);

    const rows = await sheet.getRows();
    const existingRow = rows.find(r => r.get('ID') === item.id);

    if (existingRow) {
      // Upsert: Row exists, UPDATE it
      existingRow.set('Name', item.name);
      existingRow.set('Category', item.category);
      existingRow.set('Location', item.location || '');
      existingRow.set('Assigned To', item.assignedTo || '');
      existingRow.set('Barcode', item.barcode || '');
      existingRow.set('Processor', item.processor || '');
      existingRow.set('RAM', item.ram || '');
      await existingRow.save();
      console.log(`[Google Sheets] UPDATED row for item ${item.id}`);
    } else {
      // Upsert: Row does not exist, ADD it
      await sheet.addRow({
        'ID': item.id,
        'Name': item.name,
        'Category': item.category,
        'Location': item.location || '',
        'Assigned To': item.assignedTo || '',
        'Barcode': item.barcode || '',
        'Processor': item.processor || '',
        'RAM': item.ram || '',
        'Added At': new Date().toISOString()
      });
      console.log(`[Google Sheets] ADDED new row for item ${item.id}`);
    }

  } catch (error) {
    console.error('[Google Sheets] Sync Error:', error);
  }
}
