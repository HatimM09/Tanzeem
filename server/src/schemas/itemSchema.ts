import { z } from 'zod';

export const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    assignedTo: z.string().min(1, 'assignedTo is required'),
    location: z.string().min(1, 'Location is required'),
    category: z.string().min(1, 'Category is required'),
    createdBy: z.string().optional(),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    assignedTo: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
  }),
});
