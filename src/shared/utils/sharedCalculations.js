/**
 * Shared financial and tax calculation engine for Shepherd Enterprises
 */

export function roundToTwo(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

export function calculateLineAmount(quantity, rate) {
  const qty = parseFloat(quantity) || 0;
  const r = parseFloat(rate) || 0;
  return roundToTwo(qty * r);
}

export function calculateSubtotal(items = []) {
  const total = items.reduce((acc, item) => {
    const amount = item.amount !== undefined 
      ? parseFloat(item.amount) 
      : calculateLineAmount(item.quantity, item.rate);
    return acc + (isNaN(amount) ? 0 : amount);
  }, 0);
  return roundToTwo(total);
}

export function calculateTax(subtotal, sellerStateCode, customerStateCode, taxRatePercent = 18, customCgstRate = null, customSgstRate = null, customIgstRate = null) {
  const sub = parseFloat(subtotal) || 0;
  const sCode = String(sellerStateCode || '27').padStart(2, '0');
  const cCode = String(customerStateCode || '27').padStart(2, '0');

  const isIntraState = sCode === cCode;

  if (isIntraState) {
    const defaultHalf = (parseFloat(taxRatePercent) || 18) / 2;
    const cgstRate = customCgstRate !== null && customCgstRate !== undefined && customCgstRate !== '' 
      ? parseFloat(customCgstRate) 
      : defaultHalf;
    const sgstRate = customSgstRate !== null && customSgstRate !== undefined && customSgstRate !== '' 
      ? parseFloat(customSgstRate) 
      : defaultHalf;

    const cgstAmount = roundToTwo((sub * cgstRate) / 100);
    const sgstAmount = roundToTwo((sub * sgstRate) / 100);

    return {
      isIntraState: true,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate: 0,
      igstAmount: 0
    };
  } else {
    const defaultRate = parseFloat(taxRatePercent) || 18;
    const igstRate = customIgstRate !== null && customIgstRate !== undefined && customIgstRate !== '' 
      ? parseFloat(customIgstRate) 
      : defaultRate;

    const igstAmount = roundToTwo((sub * igstRate) / 100);

    return {
      isIntraState: false,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate,
      igstAmount
    };
  }
}

export function calculateGrandTotal(subtotal, cgstAmount, sgstAmount, igstAmount) {
  const sub = parseFloat(subtotal) || 0;
  const cgst = parseFloat(cgstAmount) || 0;
  const sgst = parseFloat(sgstAmount) || 0;
  const igst = parseFloat(igstAmount) || 0;

  const exactTotal = sub + cgst + sgst + igst;
  const roundedTotal = Math.round(exactTotal);
  const roundOff = roundToTwo(roundedTotal - exactTotal);

  return {
    exactTotal: roundToTwo(exactTotal),
    grandTotal: roundedTotal,
    roundOff
  };
}

const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertChunk(num) {
  let str = '';
  if (num >= 100) {
    str += singleDigits[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 10 && num < 20) {
    str += teens[num - 10] + ' ';
  } else {
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      str += singleDigits[num] + ' ';
    }
  }
  return str.trim();
}

export function numberToWordsIndian(amount) {
  const rounded = Math.round(parseFloat(amount) || 0);
  if (rounded === 0) return 'Zero Rupees Only';

  let num = Math.abs(rounded);
  let words = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore > 0) {
    words += convertChunk(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertChunk(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertChunk(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += convertChunk(hundred) + ' ';
  }

  return (words.trim() + ' Rupees Only').replace(/\s+/g, ' ');
}

export function computeCompleteInvoiceTotals(items, sellerStateCode, customerStateCode, taxRatePercent = 18, customCgstRate = null, customSgstRate = null, customIgstRate = null) {
  const calculatedItems = items.map((item, idx) => ({
    ...item,
    sort_order: item.sort_order ?? (idx + 1),
    amount: calculateLineAmount(item.quantity, item.rate)
  }));

  const subtotal = calculateSubtotal(calculatedItems);
  const taxInfo = calculateTax(subtotal, sellerStateCode, customerStateCode, taxRatePercent, customCgstRate, customSgstRate, customIgstRate);
  const totals = calculateGrandTotal(subtotal, taxInfo.cgstAmount, taxInfo.sgstAmount, taxInfo.igstAmount);
  const amountInWords = numberToWordsIndian(totals.grandTotal);

  return {
    items: calculatedItems,
    subtotal,
    ...taxInfo,
    ...totals,
    amountInWords
  };
}
