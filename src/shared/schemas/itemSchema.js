import { z } from 'zod';

export const itemSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  sort_order: z.number().int().optional(),
  description: z.string().min(1, 'Description is required').max(90, 'Description cannot exceed 90 characters'),
  hsn_sac: z.string().min(1, 'HSN/SAC code is required').max(8, 'HSN/SAC code cannot exceed 8 digits').regex(/^\d+$/, 'HSN/SAC code must contain digits only'),

  quantity: z.coerce.number().gt(0, 'Quantity must be greater than 0'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative'),
  amount: z.coerce.number().optional()
});
