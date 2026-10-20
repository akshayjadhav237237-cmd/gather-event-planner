import { describe, expect, it } from 'vitest';
import type {
  ActivityIdea,
  BespokeTask,
  CateringIdea,
  EventContext,
  PersonalizedIdeas,
  ThemeConcept,
  VendorQuote,
} from '../src/types/event';
import {
  EventContextSchema,
  PersonalizedIdeasSchema,
  VendorQuoteSchema,
} from '../src/types/schemas';

const validContext: EventContext = {
  id: 'ctx-1',
  title: 'Summer Solstice Wedding',
  eventType: 'wedding',
  subFormat: 'western',
  eventDate: '2026-06-21',
  currency: 'USD',
  totalBudget: 25000,
  guestCount: 120,
  setting: 'outdoor',
  season: 'summer',
  priorities: ['catering', 'venue', 'photo'],
  flags: ['open_bar', 'nut_allergy'],
  userNotes: 'Outdoor ceremony followed by tented dinner.',
};

const validQuote: VendorQuote = {
  id: 'quote-1',
  categoryId: 'catering',
  vendorName: 'Gourmet Feast Co.',
  baseQuote: 5000,
  serviceAndTaxPct: 18,
  depositPaid: 1500,
  contractSigned: true,
  insuranceVerified: true,
  backupPlan: 'Secondary kitchen van on standby.',
};

const makeTheme = (id: string, color: string): ThemeConcept => ({
  id,
  title: 'Concept',
  summary: 'Summary text',
  whyItFits: 'Fits well',
  colorPalette: [color, color, color],
});

const makeCatering = (id: string): CateringIdea => ({
  id,
  title: 'Catering',
  summary: 'Summary text',
  whyItFits: 'Fits well',
  allergySafetyNote: 'Nut safe',
  budgetSwapIdea: 'Swap item',
});

const makeActivity = (id: string): ActivityIdea => ({
  id,
  title: 'Activity',
  summary: 'Summary text',
  whyItFits: 'Fits well',
  audienceFit: 'All guests',
  safetyNote: 'Ground wires',
});

const makeTask = (title: string): BespokeTask => ({
  title,
  phase: 'Booking',
  rationale: 'Necessary preparation step',
});

const makeIdeas = (): PersonalizedIdeas => ({
  source: 'local',
  themeConcepts: [
    makeTheme('t1', '#112233'),
    makeTheme('t2', '#445566'),
    makeTheme('t3', '#778899'),
  ],
  cateringIdeas: [makeCatering('c1'), makeCatering('c2'), makeCatering('c3')],
  activityIdeas: [makeActivity('a1'), makeActivity('a2'), makeActivity('a3')],
  bespokeTasks: [makeTask('k1'), makeTask('k2'), makeTask('k3'), makeTask('k4')],
  contradictionAdvisory: null,
});

describe('EventContextSchema', () => {
  it('1. parses valid EventContext successfully', () => {
    expect(EventContextSchema.safeParse(validContext).success).toBe(true);
  });

  it('2. rejects invalid subFormat for eventType via refine', () => {
    const res = EventContextSchema.safeParse({ ...validContext, subFormat: 'kids_1_3' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.path.includes('subFormat'))).toBe(true);
    }
  });

  it('3. rejects bad calendar dates like 2026-02-30 or non-leap day', () => {
    expect(EventContextSchema.safeParse({ ...validContext, eventDate: '2026-02-30' }).success).toBe(
      false
    );
    expect(EventContextSchema.safeParse({ ...validContext, eventDate: '2025-02-29' }).success).toBe(
      false
    );
    expect(EventContextSchema.safeParse({ ...validContext, eventDate: '2024-02-29' }).success).toBe(
      true
    );
  });

  it('8. rejects zero or negative budget values', () => {
    expect(EventContextSchema.safeParse({ ...validContext, totalBudget: 0 }).success).toBe(false);
    expect(EventContextSchema.safeParse({ ...validContext, totalBudget: -500 }).success).toBe(
      false
    );
  });

  it('9. rejects duplicate or over-capacity priorities', () => {
    expect(
      EventContextSchema.safeParse({ ...validContext, priorities: ['venue', 'venue'] }).success
    ).toBe(false);
    expect(
      EventContextSchema.safeParse({ ...validContext, priorities: ['p1', 'p2', 'p3', 'p4'] })
        .success
    ).toBe(false);
  });

  it('7a. rejects over-length strings on EventContext', () => {
    expect(EventContextSchema.safeParse({ ...validContext, title: 'T'.repeat(81) }).success).toBe(
      false
    );
    expect(
      EventContextSchema.safeParse({ ...validContext, userNotes: 'N'.repeat(301) }).success
    ).toBe(false);
  });
});

describe('PersonalizedIdeasSchema', () => {
  it('4. rejects extra keys on PersonalizedIdeas via strict mode', () => {
    const withExtra = { ...makeIdeas(), extraProp: 'disallowed' };
    expect(PersonalizedIdeasSchema.safeParse(withExtra).success).toBe(false);
  });

  it('5. rejects incorrect array lengths on ideas and tasks', () => {
    const ideas = makeIdeas();
    const shortThemes = { ...ideas, themeConcepts: ideas.themeConcepts.slice(0, 2) };
    expect(PersonalizedIdeasSchema.safeParse(shortThemes).success).toBe(false);
    const shortTasks = { ...ideas, bespokeTasks: ideas.bespokeTasks.slice(0, 3) };
    expect(PersonalizedIdeasSchema.safeParse(shortTasks).success).toBe(false);
  });

  it('6. rejects non-hex and invalid hex format colors in colorPalette', () => {
    const ideas = makeIdeas();
    const badHex = {
      ...ideas,
      themeConcepts: [
        {
          ...ideas.themeConcepts[0]!,
          colorPalette: ['#ZZZZZZ', '#FFFFFF', '#000000'] as [string, string, string],
        },
        ideas.themeConcepts[1]!,
        ideas.themeConcepts[2]!,
      ],
    };
    expect(PersonalizedIdeasSchema.safeParse(badHex).success).toBe(false);
  });

  it('7b. rejects over-length strings on contradictionAdvisory', () => {
    const ideas = makeIdeas();
    expect(
      PersonalizedIdeasSchema.safeParse({ ...ideas, contradictionAdvisory: 'A'.repeat(221) })
        .success
    ).toBe(false);
    expect(
      PersonalizedIdeasSchema.safeParse({ ...ideas, contradictionAdvisory: 'A'.repeat(220) })
        .success
    ).toBe(true);
  });
});

describe('VendorQuoteSchema', () => {
  it('10. validates compliant quotes and rejects out-of-range quotes', () => {
    expect(VendorQuoteSchema.safeParse(validQuote).success).toBe(true);
    expect(VendorQuoteSchema.safeParse({ ...validQuote, serviceAndTaxPct: 101 }).success).toBe(
      false
    );
    expect(VendorQuoteSchema.safeParse({ ...validQuote, serviceAndTaxPct: -1 }).success).toBe(
      false
    );
    expect(VendorQuoteSchema.safeParse({ ...validQuote, baseQuote: -100 }).success).toBe(false);
    expect(VendorQuoteSchema.safeParse({ ...validQuote, vendorName: 'V'.repeat(81) }).success).toBe(
      false
    );
    expect(
      VendorQuoteSchema.safeParse({ ...validQuote, backupPlan: 'B'.repeat(201) }).success
    ).toBe(false);
  });
});
