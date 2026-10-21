import { describe, expect, it } from 'vitest';
import type { PersonalizedIdeas, VendorQuote } from '../src/types/event';
import type { BudgetRowView } from '../src/ui/budgetView';
import {
  buildPrintBudgetRows,
  buildPrintIdeaGroups,
  buildPrintVendorRows,
  formatCheckStatus,
  formatContingencySplit,
  formatPrintHeaderDetails,
  formatPrintSubDetails,
  formatSlotPrintLine,
  formatTaskMarker,
  PRINT_DISCLAIMER,
  resolveCategoryName,
} from '../src/ui/printView';

describe('printView helpers', () => {
  it('formats slot print line with activity and owner', () => {
    const line = formatSlotPrintLine('09:00', 60, 'Welcome and check-in', 'Lead Host');
    expect(line).toBe('09:00 \u2013 10:00 \u2014 Welcome and check-in (Lead Host)');
  });

  it('formats slot print line without owner or with empty owner', () => {
    const line1 = formatSlotPrintLine('14:30', 45, 'Open Floor', '');
    const line2 = formatSlotPrintLine('14:30', 45, 'Open Floor', '   ');
    expect(line1).toBe('14:30 \u2013 15:15 \u2014 Open Floor');
    expect(line2).toBe('14:30 \u2013 15:15 \u2014 Open Floor');
  });

  it('formats print header details with multiple guests', () => {
    const details = formatPrintHeaderDetails('Wedding', 'Classic', 'October 20, 2026', 150, '$50,000');
    expect(details).toBe('Wedding \u00b7 Classic \u00b7 October 20, 2026 \u00b7 150 guests \u00b7 $50,000');
  });

  it('formats print header details with 1 guest singular', () => {
    const details = formatPrintHeaderDetails('Birthday', 'Solo', 'May 1, 2027', 1, '$1,000');
    expect(details).toBe('Birthday \u00b7 Solo \u00b7 May 1, 2027 \u00b7 1 guest \u00b7 $1,000');
  });

  it('formats sub details line with setting, season, and per-guest budget', () => {
    const sub = formatPrintSubDetails('Outdoor', 'Summer', '$125');
    expect(sub).toBe('Setting: Outdoor \u00b7 Season: Summer \u00b7 Per-guest budget: $125');
  });

  it('formats task marker correctly for completed and pending states', () => {
    expect(formatTaskMarker(true)).toBe('[x]');
    expect(formatTaskMarker(false)).toBe('[ ]');
  });

  it('formats check status as Yes or No', () => {
    expect(formatCheckStatus(true)).toBe('Yes');
    expect(formatCheckStatus(false)).toBe('No');
  });

  it('formats contingency split as integer percentage', () => {
    expect(formatContingencySplit(0.12)).toBe('12%');
    expect(formatContingencySplit(0.05)).toBe('5%');
    expect(formatContingencySplit(0)).toBe('0%');
  });

  it('resolves category names from list, catalog, or raw id fallback', () => {
    const list = [{ id: 'catering', name: 'Custom Catering' }];
    expect(resolveCategoryName('catering', list)).toBe('Custom Catering');
    expect(resolveCategoryName('venue', list, 'wedding')).toBe('Venue');
    expect(resolveCategoryName('unknown_cat', list, 'wedding')).toBe('unknown_cat');
  });

  it('builds formatted print budget rows and vendor comparison rows', () => {
    const mockBudgetRows: BudgetRowView[] = [
      {
        id: 'venue',
        name: 'Venue',
        allocatedAmount: 10000,
        allocatedPct: 20,
        baselinePct: 20,
        pctDelta: 0,
        isPriority: false,
        isFixedCost: true,
        swap: null,
        spent: 5000,
        remaining: 5000,
        usedPct: 50,
        status: 'ok',
      },
    ];
    const printBudgetRows = buildPrintBudgetRows(mockBudgetRows, 'USD');
    expect(printBudgetRows).toHaveLength(1);
    expect(printBudgetRows[0]?.allocatedAmount).toBe('$10,000');
    expect(printBudgetRows[0]?.spent).toBe('$5,000');

    const quotes: VendorQuote[] = [
      {
        id: 'q1',
        categoryId: 'venue',
        vendorName: 'Grand Hall',
        baseQuote: 8000,
        serviceAndTaxPct: 10,
        depositPaid: 2000,
        contractSigned: true,
        insuranceVerified: false,
        backupPlan: 'Secondary room',
      },
    ];
    const vendorRows = buildPrintVendorRows(quotes, mockBudgetRows, 'wedding', 'USD');
    expect(vendorRows).toHaveLength(1);
    expect(vendorRows[0]?.category).toBe('Venue');
    expect(vendorRows[0]?.allInFormatted).toBe('$8,800');
    expect(vendorRows[0]?.contractSigned).toBe('Yes');
    expect(vendorRows[0]?.insuranceVerified).toBe('No');
  });

  it('builds print idea groups and exports standard disclaimer', () => {
    const mockIdeas: PersonalizedIdeas = {
      source: 'local',
      themeConcepts: [
        { id: 't1', title: 'Garden Glow', summary: 'Fairy lights and botanicals', whyItFits: 'Outdoor setting', colorPalette: ['#1', '#2', '#3'] },
      ],
      cateringIdeas: [
        { id: 'c1', title: 'Farm Table', summary: 'Platters of local produce', whyItFits: 'Seasonal match', allergySafetyNote: 'Nut-free zone', budgetSwapIdea: 'Family-style' },
      ],
      activityIdeas: [
        { id: 'a1', title: 'Lawn Games', summary: 'Bocce and croquet', whyItFits: 'Relaxed afternoon', audienceFit: 'All ages', safetyNote: 'Flat terrain' },
      ],
      bespokeTasks: [],
      contradictionAdvisory: null,
    };
    const groups = buildPrintIdeaGroups(mockIdeas);
    expect(groups).toHaveLength(3);
    expect(groups[0]?.title).toBe('Theme Concepts');
    expect(groups[0]?.items[0]).toContain('Garden Glow: Fairy lights and botanicals (Outdoor setting)');
    expect(groups[1]?.items[0]).toContain('(Allergy note: Nut-free zone)');
    expect(PRINT_DISCLAIMER).toContain('illustrative planning heuristics');
  });
});
