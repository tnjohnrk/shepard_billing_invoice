import { z } from 'zod';
import { itemSchema } from './itemSchema.js';

export const proformaSchema = z.object({
  id: z.number().optional(),
  proforma_number: z.string().min(1, 'Proforma number is required'),
  proforma_date: z.string().min(1, 'Proforma date is required'),
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED_UNCHANGED', 'CONFIRMED_CHANGED']).default('PENDING'),

  // Transportation details
  transportation_mode: z.string().optional().nullable(),
  vehicle_number: z.string().optional().nullable(),
  date_of_supply: z.string().optional().nullable(),
  delivery_address: z.string().optional().nullable(),

  // Buyer Details
  buyer_name: z.string().min(1, 'Buyer name is required'),
  buyer_address: z.string().min(1, 'Buyer address is required'),
  customer_gstin: z.string().optional().nullable(),
  customer_state: z.string().min(1, 'Customer state is required'),
  customer_state_code: z.string().min(1, 'Customer state code is required'),

  // References
  so_po_number: z.string().optional().nullable(),
  so_po_date: z.string().optional().nullable(),
  gemc_number: z.string().optional().nullable(),
  additional_reference: z.string().optional().nullable(),

  // Items
  items: z.array(itemSchema).min(1, 'At least one item is required'),

  // Calculated Fields
  subtotal: z.number().min(0),
  cgst_rate: z.number().default(0),
  cgst_amount: z.number().default(0),
  sgst_rate: z.number().default(0),
  sgst_amount: z.number().default(0),
  igst_rate: z.number().default(0),
  igst_amount: z.number().default(0),
  grand_total: z.number().min(0),
  amount_in_words: z.string(),

  notes: z.string().optional().nullable()
});
