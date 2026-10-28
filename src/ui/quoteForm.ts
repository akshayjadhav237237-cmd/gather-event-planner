import type { VendorQuote } from '../types/event';
import { VendorQuoteSchema } from '../types/schemas';
import { parseWholeNumber } from './formModel';

export interface QuoteDraft {
  categoryId: string;
  vendorName: string;
  baseQuote: string;
  serviceAndTaxPct: string;
  depositPaid: string;
  contractSigned: boolean;
  insuranceVerified: boolean;
  backupPlan: string;
}

const QUOTE_DRAFT_KEYS = new Set<string>([
  'categoryId',
  'vendorName',
  'baseQuote',
  'serviceAndTaxPct',
  'depositPaid',
  'contractSigned',
  'insuranceVerified',
  'backupPlan',
]);

function isQuoteDraftKey(key: string): key is keyof QuoteDraft {
  return QUOTE_DRAFT_KEYS.has(key);
}

export function emptyQuoteDraft(categoryId: string = ''): QuoteDraft {
  return {
    categoryId,
    vendorName: '',
    baseQuote: '',
    serviceAndTaxPct: '',
    depositPaid: '',
    contractSigned: false,
    insuranceVerified: false,
    backupPlan: '',
  };
}

export function draftFromQuote(q: VendorQuote): QuoteDraft {
  return {
    categoryId: q.categoryId,
    vendorName: q.vendorName,
    baseQuote: String(q.baseQuote),
    serviceAndTaxPct: String(q.serviceAndTaxPct),
    depositPaid: String(q.depositPaid),
    contractSigned: q.contractSigned,
    insuranceVerified: q.insuranceVerified,
    backupPlan: q.backupPlan,
  };
}

export function parseQuoteDraft(
  draft: QuoteDraft,
  id: string
):
  | { ok: true; value: VendorQuote }
  | { ok: false; errors: Partial<Record<keyof QuoteDraft, string>> } {
  const errors: Partial<Record<keyof QuoteDraft, string>> = {};

  const categoryId = draft.categoryId.trim();
  if (categoryId.length === 0) {
    errors.categoryId = 'Select a category.';
  }

  const vendorName = draft.vendorName.trim();
  if (vendorName.length === 0) {
    errors.vendorName = 'Vendor name is required.';
  } else if (vendorName.length > 80) {
    errors.vendorName = 'Vendor name must be 80 characters or less.';
  }

  const baseQuote = parseWholeNumber(draft.baseQuote);
  if (!Number.isFinite(baseQuote) || baseQuote < 0) {
    errors.baseQuote = 'Base quote must be a whole number 0 or greater.';
  }

  const taxTrimmed = draft.serviceAndTaxPct.trim();
  let serviceAndTaxPct = 0;
  if (taxTrimmed.length > 0) {
    serviceAndTaxPct = parseWholeNumber(taxTrimmed);
    if (!Number.isFinite(serviceAndTaxPct) || serviceAndTaxPct < 0 || serviceAndTaxPct > 100) {
      errors.serviceAndTaxPct = 'Tax and service percentage must be between 0 and 100.';
    }
  }

  const depositTrimmed = draft.depositPaid.trim();
  let depositPaid = 0;
  if (depositTrimmed.length > 0) {
    depositPaid = parseWholeNumber(depositTrimmed);
    if (!Number.isFinite(depositPaid) || depositPaid < 0) {
      errors.depositPaid = 'Deposit must be a whole number 0 or greater.';
    }
  }

  if (
    Number.isFinite(baseQuote) &&
    baseQuote >= 0 &&
    Number.isFinite(serviceAndTaxPct) &&
    serviceAndTaxPct >= 0 &&
    serviceAndTaxPct <= 100 &&
    Number.isFinite(depositPaid) &&
    depositPaid >= 0
  ) {
    const allInTotal = Math.round(baseQuote * (1 + serviceAndTaxPct / 100));
    if (depositPaid > allInTotal) {
      errors.depositPaid = 'Deposit cannot exceed the all-in total.';
    }
  }

  const backupPlan = draft.backupPlan.trim();
  if (backupPlan.length > 200) {
    errors.backupPlan = 'Backup plan must be 200 characters or less.';
  }

  const candidate: VendorQuote = {
    id,
    categoryId,
    vendorName,
    baseQuote: Number.isFinite(baseQuote) ? baseQuote : 0,
    serviceAndTaxPct: Number.isFinite(serviceAndTaxPct) ? serviceAndTaxPct : 0,
    depositPaid: Number.isFinite(depositPaid) ? depositPaid : 0,
    contractSigned: Boolean(draft.contractSigned),
    insuranceVerified: Boolean(draft.insuranceVerified),
    backupPlan,
  };

  const schemaResult = VendorQuoteSchema.safeParse(candidate);
  if (!schemaResult.success) {
    for (const issue of schemaResult.error.issues) {
      const seg = issue.path[0];
      const field = typeof seg === 'string' && isQuoteDraftKey(seg) ? seg : undefined;
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    }
    return { ok: false, errors };
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: schemaResult.data };
}
