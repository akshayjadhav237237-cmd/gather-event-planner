/** Converts a celebration title into a URL- and filename-safe slug. */
export function toFileSlug(title: string, fallback = 'event-plan'): string {
  const normalized = (title || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const truncated = normalized.slice(0, 50).replace(/-+$/, '');
  if (truncated.length > 0) {
    return truncated;
  }
  return fallback.length > 0 ? fallback : 'event-plan';
}
