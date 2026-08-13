export const formatPrice = (value: number) =>
  `৳${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
