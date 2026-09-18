import { computeCompleteInvoiceTotals, calculateTax, calculateGrandTotal, numberToWordsIndian } from '../../shared/utils/sharedCalculations.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';

export function calculateInvoiceTotals(items, customerStateCode, taxRate = 18, customCgstRate = null, customSgstRate = null, customIgstRate = null) {
  const sellerStateCode = COMPANY_CONFIG.state_code;
  return computeCompleteInvoiceTotals(items, sellerStateCode, customerStateCode, taxRate, customCgstRate, customSgstRate, customIgstRate);
}

export { calculateTax, calculateGrandTotal, numberToWordsIndian };
