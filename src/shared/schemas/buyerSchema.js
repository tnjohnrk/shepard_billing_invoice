import { z } from 'zod';

export const buyerSchema = z.object({
  buyer_name: z.string().min(1, 'Buyer name is required'),
  buyer_address: z.string().min(1, 'Buyer address is required'),
  customer_gstin: z.string().regex(/^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format (15 characters)').optional().or(z.literal('')),
  customer_state: z.string().min(1, 'Customer state is required'),
  customer_state_code: z.string().min(1, 'Customer state code is required')
});
