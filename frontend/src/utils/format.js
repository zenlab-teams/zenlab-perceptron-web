export function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('id-ID', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '-';
  return `${formatNumber(Number(value) * 100, 1)}%`;
}
