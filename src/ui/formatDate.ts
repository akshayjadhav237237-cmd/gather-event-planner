/**
 * Formats an ISO date string (YYYY-MM-DD) into a long, human-readable date.
 * Uses UTC timezone to guarantee deterministic rendering across environments.
 */
export function formatDateLong(iso: string, locale: string = 'en-US'): string {
  try {
    if (!iso) {
      return iso;
    }

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
        return iso;
      }
    } else {
      date = new Date(iso);
      if (Number.isNaN(date.getTime())) {
        return iso;
      }
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return formatter.format(date);
  } catch {
    return iso;
  }
}
