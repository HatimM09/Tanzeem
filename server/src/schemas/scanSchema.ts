import { z } from 'zod';

export const recordScanSchema = z.object({
  body: z.object({
    barcode: z.string().min(1, 'Barcode is required'),
    scannedBy: z.string().optional(),
  }),
});
