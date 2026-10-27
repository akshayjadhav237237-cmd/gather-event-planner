import type { DecisionResult } from '../types/engine';
import type { EventContext, VendorCategoryGuide, VendorQuote } from '../types/event';
import { WEDDING_VENDOR_GUIDES, type VendorGuideTemplate } from '../data/vendors/weddingVendors';
import { BIRTHDAY_VENDOR_GUIDES } from '../data/vendors/birthdayVendors';
import { COMMUNITY_VENDOR_GUIDES } from '../data/vendors/communityVendors';
import { quoteAllInTotal } from './quoteMath';

export { quoteAllInTotal };

const CATALOG_BY_EVENT_TYPE: Record<string, readonly VendorGuideTemplate[]> = {
  wedding: WEDDING_VENDOR_GUIDES,
  birthday: BIRTHDAY_VENDOR_GUIDES,
  community: COMMUNITY_VENDOR_GUIDES,
};

/** Builds vendor category evaluation guides tailored to the event type and active contextual rules. */
export function buildVendorGuides(
  ctx: EventContext,
  decision: DecisionResult
): VendorCategoryGuide[] {
  const templates = CATALOG_BY_EVENT_TYPE[ctx.eventType] ?? [];
  const activeRuleSet = new Set(decision.activeRuleIds);

  return templates.map((tmpl) => {
    const questions = [...tmpl.questions];
    const requiredChecks = [...tmpl.requiredChecks];
    const contractWatchouts = [...tmpl.contractWatchouts];

    if (tmpl.conditional) {
      for (const cond of tmpl.conditional) {
        if (activeRuleSet.has(cond.ruleId)) {
          if (cond.questions) {
            questions.push(...cond.questions);
          }
          if (cond.requiredChecks) {
            requiredChecks.push(...cond.requiredChecks);
          }
          if (cond.contractWatchouts) {
            contractWatchouts.push(...cond.contractWatchouts);
          }
        }
      }
    }

    return {
      id: tmpl.id,
      name: tmpl.name,
      scope: tmpl.scope,
      questions,
      requiredChecks,
      contractWatchouts,
    };
  });
}

/** Compares vendor quotes for a category, ranking by all-in price and flagging missing compliance checks. */
export function compareQuotes(
  quotes: readonly VendorQuote[],
  categoryId: string
): Array<{
  quote: VendorQuote;
  allInTotal: number;
  depositRemaining: number;
  isLowest: boolean;
  missingChecks: string[];
}> {
  const matching = quotes
    .map((quote, originalIndex) => ({ quote, originalIndex }))
    .filter((item) => item.quote.categoryId === categoryId);

  const scored = matching.map(({ quote, originalIndex }) => {
    const allInTotal = quoteAllInTotal(quote);
    const depositPaid = Number.isFinite(quote.depositPaid) ? Math.max(0, quote.depositPaid) : 0;
    const depositRemaining = Math.max(0, allInTotal - depositPaid);
    const missingChecks: string[] = [];

    if (!quote.contractSigned) {
      missingChecks.push('Contract not signed');
    }
    if (!quote.insuranceVerified) {
      missingChecks.push('Insurance not verified');
    }

    return {
      quote,
      allInTotal,
      depositRemaining,
      missingChecks,
      originalIndex,
    };
  });

  scored.sort((a, b) => a.allInTotal - b.allInTotal || a.originalIndex - b.originalIndex);

  return scored.map((item, index) => ({
    quote: item.quote,
    allInTotal: item.allInTotal,
    depositRemaining: item.depositRemaining,
    isLowest: index === 0,
    missingChecks: item.missingChecks,
  }));
}

/** Summarizes user-entered vendor quotes across categories and computes outstanding balances. */
export function summarizeVendorSpend(quotes: readonly VendorQuote[]): {
  totalAllIn: number;
  totalDeposits: number;
  outstanding: number;
  byCategory: Record<string, number>;
} {
  let totalAllIn = 0;
  let totalDeposits = 0;
  const byCategory: Record<string, number> = {};

  for (const q of quotes) {
    const allIn = quoteAllInTotal(q);
    const depositPaid = Number.isFinite(q.depositPaid) ? Math.max(0, q.depositPaid) : 0;

    totalAllIn += allIn;
    totalDeposits += depositPaid;
    byCategory[q.categoryId] = (byCategory[q.categoryId] ?? 0) + allIn;
  }

  const outstanding = Math.max(0, totalAllIn - totalDeposits);

  return {
    totalAllIn,
    totalDeposits,
    outstanding,
    byCategory,
  };
}
