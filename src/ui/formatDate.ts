function parseUtcIso(iso: string): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  let date: Date;
  if (match && match[1] && match[2] && match[3]) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }
  } else {
    date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
  }
  return date;
}

/** Formats an ISO date string into a long, human-readable date. */
export function formatDateLong(iso: string, locale: string = 'en-US'): string {
  try {
    const date = parseUtcIso(iso);
    if (!date) return iso;
    return new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return iso;
  }
}

/** Formats an ISO date string into a short, human-readable date (e.g. "12 Mar 2027"). */
export function formatDateShort(iso: string, locale: string = 'en-US'): string {
  try {
    const date = parseUtcIso(iso);
    if (!date) return iso;
    return new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return iso;
  }
}
