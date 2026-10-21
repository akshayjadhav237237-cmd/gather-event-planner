import { CATEGORY_SETS } from '../data/categories';
import { quoteAllInTotal } from '../domain/vendorEngine';
import type { CurrencyCode, EventType, PersonalizedIdeas, VendorQuote } from '../types/event';
import { formatCurrency } from '../utils/currency';
import type { BudgetRowView } from './budgetView';
import { formatSlotRange } from './runOfShowView';

export const PRINT_DISCLAIMER =
  'This document contains illustrative planning heuristics and recommendations. Confirm all requirements, pricing, and contracts directly with local authorities and vendors.';

/** Formats a run-of-show slot into a printable summary line. */
export function formatSlotPrintLine(
  startTime: string,
  durationMin: number,
  activity: string,
  owner: string,
): string {
  const range = formatSlotRange(startTime, durationMin);
  const cleanOwner = owner.trim();
  const cleanActivity = activity.trim();
  if (cleanOwner.length > 0) {
    return `${range} \u2014 ${cleanActivity} (${cleanOwner})`;
  }
  return `${range} \u2014 ${cleanActivity}`;
}

/** Formats a compact event summary line for print headers. */
export function formatPrintHeaderDetails(
  typeLabel: string,
  formatLabel: string,
  date: string,
  guestCount: number,
  formattedBudget: string,
): string {
  const safeCount = Number.isFinite(guestCount) && guestCount > 0 ? Math.floor(guestCount) : 0;
  const guestText = safeCount === 1 ? '1 guest' : `${safeCount} guests`;
  return `${typeLabel} \u00b7 ${formatLabel} \u00b7 ${date} \u00b7 ${guestText} \u00b7 ${formattedBudget}`;
}

/** Formats secondary metadata line for print header. */
export function formatPrintSubDetails(
  setting: string,
  season: string,
  perGuestBudgetFormatted: string,
): string {
  return `Setting: ${setting} \u00b7 Season: ${season} \u00b7 Per-guest budget: ${perGuestBudgetFormatted}`;
}

/** Formats a checkbox marker for printed task lists. */
export function formatTaskMarker(done: boolean): string {
  return done ? '[x]' : '[ ]';
}

/** Formats verification or signature status into a human-readable table label. */
export function formatCheckStatus(verified: boolean): string {
  return verified ? 'Yes' : 'No';
}

/** Formats contingency fraction to an integer percentage string. */
export function formatContingencySplit(fraction: number): string {
  const safeFraction = Number.isFinite(fraction) && fraction >= 0 ? fraction : 0;
  return `${Math.round(safeFraction * 100)}%`;
}

/** Resolves category display name from breakdown or category set definitions. */
export function resolveCategoryName(
  categoryId: string,
  categories?: readonly { id: string; name: string }[],
  eventType?: EventType,
): string {
  if (categories) {
    const match = categories.find((c) => c.id === categoryId);
    if (match) return match.name;
  }
  if (eventType && CATEGORY_SETS[eventType]) {
    const match = CATEGORY_SETS[eventType].find((c) => c.id === categoryId);
    if (match) return match.name;
  }
  return categoryId;
}

export interface PrintBudgetDisplayRow {
  id: string;
  name: string;
  allocatedPct: string;
  allocatedAmount: string;
  spent: string;
  remaining: string;
}

/** Formats budget rows into printable currency and percentage strings. */
export function buildPrintBudgetRows(
  rows: readonly BudgetRowView[],
  currency: CurrencyCode,
): PrintBudgetDisplayRow[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    allocatedPct: `${r.allocatedPct}%`,
    allocatedAmount: formatCurrency(r.allocatedAmount, currency),
    spent: formatCurrency(r.spent, currency),
    remaining: formatCurrency(r.remaining, currency),
  }));
}

export interface PrintVendorRowView {
  id: string;
  category: string;
  vendorName: string;
  allInFormatted: string;
  contractSigned: string;
  insuranceVerified: string;
}

/** Builds printable vendor comparison rows. */
export function buildPrintVendorRows(
  quotes: readonly VendorQuote[],
  categories: readonly { id: string; name: string }[],
  eventType: EventType,
  currency: CurrencyCode,
): PrintVendorRowView[] {
  return quotes.map((q) => ({
    id: q.id,
    category: resolveCategoryName(q.categoryId, categories, eventType),
    vendorName: q.vendorName,
    allInFormatted: formatCurrency(quoteAllInTotal(q), currency),
    contractSigned: formatCheckStatus(q.contractSigned),
    insuranceVerified: formatCheckStatus(q.insuranceVerified),
  }));
}

export interface PrintIdeaGroup {
  title: string;
  items: string[];
}

/** Groups personalized ideas into printable sections. */
export function buildPrintIdeaGroups(ideas: PersonalizedIdeas): PrintIdeaGroup[] {
  return [
    {
      title: 'Theme Concepts',
      items: ideas.themeConcepts.map((t) => `${t.title}: ${t.summary} (${t.whyItFits})`),
    },
    {
      title: 'Catering Ideas',
      items: ideas.cateringIdeas.map(
        (c) => `${c.title}: ${c.summary}${c.allergySafetyNote ? ` (Allergy note: ${c.allergySafetyNote})` : ''}`,
      ),
    },
    {
      title: 'Activities & Entertainment',
      items: ideas.activityIdeas.map((a) => `${a.title}: ${a.summary}`),
    },
  ];
}
