export const COPY_TYPES = {
  ORIGINAL: 'ORIGINAL',
  DUPLICATE: 'DUPLICATE',
  TRIPLICATE: 'TRIPLICATE'
};

export const COPY_TYPE_LABELS = {
  ORIGINAL: 'Original for Recipient',
  DUPLICATE: 'Duplicate for Transporter',
  TRIPLICATE: 'Triplicate for Supplier'
};

export function getCopyTypeLabel(copyType, isProforma = false) {
  if (isProforma) return 'Proforma Copy';
  if (!copyType) return COPY_TYPE_LABELS.ORIGINAL;
  if (COPY_TYPE_LABELS[copyType]) return COPY_TYPE_LABELS[copyType];
  const upper = String(copyType).toUpperCase();
  if (COPY_TYPE_LABELS[upper]) return COPY_TYPE_LABELS[upper];
  return String(copyType);
}

