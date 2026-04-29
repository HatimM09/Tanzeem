import { z } from 'zod';

export const raiseComplaintSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    raisedBy: z.string().optional(),
  }),
});

export const resolveComplaintSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    resolvedNote: z.string().min(5, 'Resolution note must be at least 5 characters'),
    resolvedBy: z.string().optional(),
  }),
});
