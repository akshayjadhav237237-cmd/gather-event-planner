import { describe, expect, it } from 'vitest';
import type { VendorQuote } from '../src/types/event';
import {
  draftFromQuote,
  emptyQuoteDraft,
  parseQuoteDraft,
  type QuoteDraft,
} from '../src/ui/quoteForm';

describe('quoteForm', () => {
  const validDraft: QuoteDraft = {
    categoryId: 'venue',
    vendorName: 'Starlight Ballroom',
    baseQuote: '50000',
    serviceAndTaxPct: '18',
    depositPaid: '10000',
    contractSigned: true,
    insuranceVerified: true,
    backupPlan: 'Indoor hall on standby',
  };

  it('initializes empty draft with empty strings and false flags', () => {
    const draft = emptyQuoteDraft('catering');
    expect(draft.categoryId).toBe('catering');
    expect(draft.vendorName).toBe('');
    expect(draft.baseQuote).toBe('');
    expect(draft.serviceAndTaxPct).toBe('');
    expect(draft.depositPaid).toBe('');
    expect(draft.contractSigned).toBe(false);
    expect(draft.insuranceVerified).toBe(false);
    expect(draft.backupPlan).toBe('');
  });

  it('parses a valid draft into a VendorQuote', () => {
    const result = parseQuoteDraft(validDraft, 'quote-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        id: 'quote-1',
        categoryId: 'venue',
        vendorName: 'Starlight Ballroom',
        baseQuote: 50000,
        serviceAndTaxPct: 18,
        depositPaid: 10000,
        contractSigned: true,
        insuranceVerified: true,
        backupPlan: 'Indoor hall on standby',
      });
    }
  });

  it('rejects missing or empty vendor name', () => {
    const missingName: QuoteDraft = { ...validDraft, vendorName: '   ' };
    const result = parseQuoteDraft(missingName, 'quote-2');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.vendorName).toBeDefined();
    }
  });

  it('rejects vendor name longer than 80 characters', () => {
    const longName: QuoteDraft = { ...validDraft, vendorName: 'A'.repeat(81) };
    const result = parseQuoteDraft(longName, 'quote-3');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.vendorName).toBeDefined();
    }
  });

  it('rejects negative base quote', () => {
    const negativeQuote: QuoteDraft = { ...validDraft, baseQuote: '-500' };
    const result = parseQuoteDraft(negativeQuote, 'quote-4');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.baseQuote).toBeDefined();
    }
  });

  it('rejects negative tax/service percentage', () => {
    const negativeTax: QuoteDraft = { ...validDraft, serviceAndTaxPct: '-5' };
    const result = parseQuoteDraft(negativeTax, 'quote-5');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.serviceAndTaxPct).toBeDefined();
    }
  });

  it('rejects tax/service percentage over 100', () => {
    const overTax: QuoteDraft = { ...validDraft, serviceAndTaxPct: '101' };
    const result = parseQuoteDraft(overTax, 'quote-6');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.serviceAndTaxPct).toBeDefined();
    }
  });

  it('rejects deposit that exceeds all-in total', () => {
    // base = 1000, tax = 10% => allIn = 1100. Deposit = 1200
    const overDeposit: QuoteDraft = {
      ...validDraft,
      baseQuote: '1000',
      serviceAndTaxPct: '10',
      depositPaid: '1200',
    };
    const result = parseQuoteDraft(overDeposit, 'quote-7');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.depositPaid).toBe('Deposit cannot exceed the all-in total.');
    }
  });

  it('performs clean round trip with draftFromQuote and parseQuoteDraft', () => {
    const quote: VendorQuote = {
      id: 'quote-8',
      categoryId: 'photography',
      vendorName: 'Apex Studio',
      baseQuote: 35000,
      serviceAndTaxPct: 12,
      depositPaid: 5000,
      contractSigned: true,
      insuranceVerified: false,
      backupPlan: 'Secondary shooter contracted',
    };

    const draft = draftFromQuote(quote);
    expect(draft.vendorName).toBe('Apex Studio');
    expect(draft.baseQuote).toBe('35000');
    expect(draft.serviceAndTaxPct).toBe('12');
    expect(draft.depositPaid).toBe('5000');

    const reparsed = parseQuoteDraft(draft, quote.id);
    expect(reparsed.ok).toBe(true);
    if (reparsed.ok) {
      expect(reparsed.value).toEqual(quote);
    }
  });
});
