function formatUtc(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoParts(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

/** Validates whether a string is a strict YYYY-MM-DD calendar date. */
export function isValidIsoDate(iso: string): boolean {
  const parts = parseIsoParts(iso);
  if (!parts) {
    return false;
  }
  const { year, month, day } = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Calculates the signed number of calendar days between two ISO dates. */
export function daysBetween(fromIso: string, toIso: string): number {
  if (!isValidIsoDate(fromIso)) {
    throw new Error(`Invalid fromIso date string: ${fromIso}`);
  }
  if (!isValidIsoDate(toIso)) {
    throw new Error(`Invalid toIso date string: ${toIso}`);
  }
  const fromParts = parseIsoParts(fromIso);
  const toParts = parseIsoParts(toIso);
  if (!fromParts || !toParts) {
    throw new Error('Failed to parse ISO date parts');
  }
  const d1 = Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day);
  const d2 = Date.UTC(toParts.year, toParts.month - 1, toParts.day);
  const msPerDay = 86_400_000;
  return Math.round((d2 - d1) / msPerDay);
}

/** Returns a new ISO date string by adding n days to an input ISO date. */
export function addDays(iso: string, n: number): string {
  if (!isValidIsoDate(iso)) {
    throw new Error(`Invalid iso date string: ${iso}`);
  }
  const parts = parseIsoParts(iso);
  if (!parts) {
    throw new Error('Failed to parse ISO date parts');
  }
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  date.setUTCDate(date.getUTCDate() + Math.trunc(n));
  return formatUtc(date);
}

/** Returns a new ISO date string by adding n months with month-end day clamping. */
export function addMonths(iso: string, n: number): string {
  if (!isValidIsoDate(iso)) {
    throw new Error(`Invalid iso date string: ${iso}`);
  }
  const parts = parseIsoParts(iso);
  if (!parts) {
    throw new Error('Failed to parse ISO date parts');
  }
  const totalMonths = parts.year * 12 + (parts.month - 1) + Math.trunc(n);
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(parts.day, daysInTargetMonth);
  const resultDate = new Date(Date.UTC(targetYear, targetMonth, clampedDay));
  return formatUtc(resultDate);
}

/** Returns today's UTC calendar date as YYYY-MM-DD. */
export function todayIso(): string {
  return formatUtc(new Date());
}
