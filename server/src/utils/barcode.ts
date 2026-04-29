import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique barcode string for a procurement item.
 * Format: UNIV-{CAT4}-{SHORT_ID}
 * Example: UNIV-ITEQ-A3F2
 */
/**
 * Matches the frontend generateItemBarcode() format exactly.
 * Format: UNIV-{CAT4}-{SHORTID6}
 * Example: UNIV-ITEQ-A3F291
 * Must be kept in sync with src/utils/barcode.ts on the frontend.
 */
export function generateBarcode(id: string, category: string): string {
  const prefix = category
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'X');
  const shortId = id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `UNIV-${prefix}-${shortId}`;
}
