export function formatTimestamp(value) {
  if (value === null || value === undefined || value === '-') return '-';
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return String(value);
  const d = new Date(num);
  if (isNaN(d.getTime())) return '-';
  try {
    return d.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return d.toISOString();
  }
}
