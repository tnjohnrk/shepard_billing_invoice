import { z } from 'zod';

export const itemSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  sort_order: z.number().int().optional(),
  description: z.string().min(1, 'Description is required'),
  hsn_sac: z.string().min(1, 'HSN/SAC code is required'),
  quantity: z.number().gt(0, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate cannot be negative'),
  amount: z.number().optional()
});
