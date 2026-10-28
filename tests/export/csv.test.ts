import { describe, expect, it } from 'vitest';
import { buildBudgetCsv, buildVendorCsv, escapeCsvCell, toCsv } from '../../src/export/csv';
import type { BudgetBreakdown, VendorQuote } from '../../src/types/event';

describe('escapeCsvCell', () => {
  it('returns plain string without modifications', () => {
    expect(escapeCsvCell('Catering')).toBe('Catering');
  });

  it('escapes commas, quotes, and newlines in strings', () => {
    expect(escapeCsvCell('Decor, Florals')).toBe('"Decor, Florals"');
    expect(escapeCsvCell('He said "Hello"')).toBe('"He said ""Hello"""');
    expect(escapeCsvCell('Line1\nLine2')).toBe('"Line1\nLine2"');
    expect(escapeCsvCell('Line1\r\nLine2')).toBe('"Line1\r\nLine2"');
  });

  it('defends against formula injection on special prefixes', () => {
    expect(escapeCsvCell('=1+1')).toBe("'=1+1");
    expect(escapeCsvCell('+447123456789')).toBe("'+447123456789");
    expect(escapeCsvCell('-SUM(A1:A10)')).toBe("'-SUM(A1:A10)");
    expect(escapeCsvCell('@SUM')).toBe("'@SUM");
    expect(escapeCsvCell('\tcmd')).toBe("'\tcmd");
    expect(escapeCsvCell('\rcmd')).toBe('"\'\rcmd"');
  });

  it('quotes cells that contain both injection prefix and comma', () => {
    expect(escapeCsvCell('=SUM(A1, B1)')).toBe('"\'=SUM(A1, B1)"');
  });

  it('formats finite numbers as strings without apostrophe', () => {
    expect(escapeCsvCell(42)).toBe('42');
    expect(escapeCsvCell(0)).toBe('0');
    expect(escapeCsvCell(-150)).toBe('-150');
  });

  it('converts non-finite numbers to empty cell', () => {
    expect(escapeCsvCell(Number.NaN)).toBe('""');
    expect(escapeCsvCell(Number.POSITIVE_INFINITY)).toBe('""');
    expect(escapeCsvCell(Number.NEGATIVE_INFINITY)).toBe('""');
  });
});

describe('toCsv', () => {
  it('returns empty string for empty rows', () => {
    expect(toCsv([])).toBe('');
  });

  it('serializes rows with CRLF endings and trailing CRLF', () => {
    const rows = [
      ['Category', 'Amount'],
      ['Venue', 5000],
    ];
    expect(toCsv(rows)).toBe('Category,Amount\r\nVenue,5000\r\n');
  });
});

describe('buildBudgetCsv', () => {
  const breakdown: BudgetBreakdown = {
    currency: 'USD',
    totalBudget: 10000,
    contingencyPct: 0.1,
    contingencyAmount: 1000,
    allocatableBudget: 9000,
    perGuestAllocatable: 90,
    allInExposureNote: 'Planning note',
    alerts: [],
    categories: [
      {
        id: 'venue',
        name: 'Venue & Space',
        baselinePct: 30,
        allocatedPct: 30,
        allocatedAmount: 3000,
        isPriority: false,
        isFixedCost: true,
        costSavingSwap: null,
      },
      {
        id: 'catering',
        name: 'Catering',
        baselinePct: 60,
        allocatedPct: 60,
        allocatedAmount: 6000,
        isPriority: true,
        isFixedCost: false,
        costSavingSwap: null,
      },
    ],
  };

  it('prefixes with UTF-8 BOM and contains currency, headers, and rows', () => {
    const csv = buildBudgetCsv(breakdown, { venue: 2500, catering: 6000 });
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Amounts in USD');
    expect(csv).toContain('Category,Planning split (%),Allocated,Spent,Remaining');
    expect(csv).toContain('Venue & Space,30,3000,2500,500');
    expect(csv).toContain('Catering,60,6000,6000,0');
    expect(csv).toContain('Contingency (held back),10,1000,0,1000');
    expect(csv).toContain('Total budget,100,10000,8500,1500');
    expect(csv.endsWith('\r\n')).toBe(true);
  });
});

describe('buildVendorCsv', () => {
  const quotes: VendorQuote[] = [
    {
      id: 'q1',
      categoryId: 'venue',
      vendorName: 'Grand Hall',
      baseQuote: 5000,
      serviceAndTaxPct: 20,
      depositPaid: 1500,
      contractSigned: true,
      insuranceVerified: true,
      backupPlan: 'Outdoor pavilion backup',
    },
    {
      id: 'q2',
      categoryId: 'catering',
      vendorName: 'Gourmet Kitchen',
      baseQuote: 3000,
      serviceAndTaxPct: 10,
      depositPaid: 3300,
      contractSigned: false,
      insuranceVerified: false,
      backupPlan: '',
    },
  ];

  it('serializes quotes with mapped category names and calculated totals', () => {
    const csv = buildVendorCsv(quotes, 'wedding');
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain(
      'Category,Vendor,Base quote,Service and tax (%),All-in total,Deposit paid,Deposit remaining,Contract signed,Insurance or licences verified,Backup plan'
    );
    expect(csv).toContain(
      'Venue,Grand Hall,5000,20,6000,1500,4500,Yes,Yes,Outdoor pavilion backup'
    );
    expect(csv).toContain('Catering,Gourmet Kitchen,3000,10,3300,3300,0,No,No,None');
    expect(csv.endsWith('\r\n')).toBe(true);
  });
});
