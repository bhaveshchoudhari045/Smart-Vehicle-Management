export const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Compact Indian price: 1749000 -> "₹17.49 L", 19900000 -> "₹1.99 Cr". */
export function inrShort(value) {
  const n = Number(value) || 0;
  if (n >= 10000000) return `₹${trim(n / 10000000)} Cr`;
  if (n >= 100000) return `₹${trim(n / 100000)} L`;
  return inr.format(n);
}

function trim(x) {
  return x.toFixed(2).replace(/\.?0+$/, '');
}

export function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export const ROLE_LABEL = {
  MANUFACTURER: 'Manufacturer',
  SHOWROOM: 'Showroom Owner',
  CUSTOMER: 'Customer',
};

export const ENQUIRY_STATUS_LABEL = {
  NEW: 'New',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const ENQUIRY_TYPE_LABEL = {
  PURCHASE: 'Purchase',
  TEST_DRIVE: 'Test drive',
};

export const STOCK_LABEL = {
  IN_STOCK: 'In stock',
  LOW_STOCK: 'Low stock',
  OUT_OF_STOCK: 'Out of stock',
};
