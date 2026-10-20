import { describe, expect, it } from 'vitest';
import { CATEGORY_SETS } from '../src/data/categories';
import { WEDDING_VENDOR_GUIDES } from '../src/data/vendors/weddingVendors';
import { BIRTHDAY_VENDOR_GUIDES } from '../src/data/vendors/birthdayVendors';
import { COMMUNITY_VENDOR_GUIDES } from '../src/data/vendors/communityVendors';
import { buildVendorGuides } from '../src/domain/vendorEngine';
import type { DecisionResult } from '../src/types/engine';
import type { EventContext, EventType } from '../src/types/event';

function createDummyContext(eventType: EventType): EventContext {
  return {
    id: 'test-event',
    title: 'Test Event',
    eventType,
    subFormat:
      eventType === 'wedding'
        ? 'western'
        : eventType === 'birthday'
          ? 'adult_milestone'
          : 'festival',
    eventDate: '2026-12-01',
    currency: 'USD',
    totalBudget: 25000,
    guestCount: 100,
    setting: 'indoor',
    season: 'summer',
    priorities: [],
    flags: [],
    userNotes: '',
  };
}

const emptyDecision: DecisionResult = {
  adaptations: [],
  activeRuleIds: [],
  contingencyDelta: 0,
};

describe('Vendor Catalog Completeness', () => {
  it('covers all bookable categories in wedding', () => {
    const bookableWedding = CATEGORY_SETS.wedding.filter((c) => c.bookable).map((c) => c.id);
    const catalogIds = WEDDING_VENDOR_GUIDES.map((g) => g.id);
    expect(catalogIds).toEqual(bookableWedding);
    expect(catalogIds).toHaveLength(9);
  });

  it('covers all bookable categories in birthday', () => {
    const bookableBirthday = CATEGORY_SETS.birthday.filter((c) => c.bookable).map((c) => c.id);
    const catalogIds = BIRTHDAY_VENDOR_GUIDES.map((g) => g.id);
    expect(catalogIds).toEqual(bookableBirthday);
    expect(catalogIds).toHaveLength(5);
  });

  it('covers all bookable categories in community', () => {
    const bookableCommunity = CATEGORY_SETS.community.filter((c) => c.bookable).map((c) => c.id);
    const catalogIds = COMMUNITY_VENDOR_GUIDES.map((g) => g.id);
    expect(catalogIds).toEqual(bookableCommunity);
    expect(catalogIds).toHaveLength(7);
  });

  it('contains 5 to 7 base vetting questions in every guide', () => {
    const allGuides = [
      ...WEDDING_VENDOR_GUIDES,
      ...BIRTHDAY_VENDOR_GUIDES,
      ...COMMUNITY_VENDOR_GUIDES,
    ];
    for (const guide of allGuides) {
      expect(guide.questions.length).toBeGreaterThanOrEqual(5);
      expect(guide.questions.length).toBeLessThanOrEqual(7);
    }
  });
});

describe('buildVendorGuides Rule Conditionals', () => {
  it('merges conditional items when active and omits them when inactive', () => {
    const ctx = createDummyContext('wedding');
    const baseGuides = buildVendorGuides(ctx, emptyDecision);
    const baseVenue = baseGuides.find((g) => g.id === 'venue');
    const baseCount = baseVenue?.requiredChecks.length ?? 0;

    const activeDecision: DecisionResult = {
      ...emptyDecision,
      activeRuleIds: ['OUTDOOR', 'ACCESSIBILITY'],
    };
    const adaptedGuides = buildVendorGuides(ctx, activeDecision);
    const adaptedVenue = adaptedGuides.find((g) => g.id === 'venue');

    expect(adaptedVenue?.requiredChecks.length).toBeGreaterThan(baseCount);
    expect(adaptedVenue?.requiredChecks.some((c) => /step-free/i.test(c))).toBe(true);
    expect(adaptedVenue?.requiredChecks.some((c) => /weather backup/i.test(c))).toBe(true);
  });

  it('merges dietary and allergy protocols into catering when active', () => {
    const ctx = createDummyContext('wedding');
    const activeDecision: DecisionResult = {
      ...emptyDecision,
      activeRuleIds: ['DIETARY_CULTURAL', 'ALLERGY_ALERT', 'OPEN_BAR'],
    };
    const guides = buildVendorGuides(ctx, activeDecision);
    const catering = guides.find((g) => g.id === 'catering');

    expect(catering?.requiredChecks.some((c) => /separate-preparation/i.test(c))).toBe(true);
    expect(catering?.requiredChecks.some((c) => /allergen labeling/i.test(c))).toBe(true);
    expect(catering?.requiredChecks.some((c) => /liquor liability/i.test(c))).toBe(true);
  });
});

describe('Catalog Compliance & Zero Fabrication Verification', () => {
  const allGuides = [
    ...WEDDING_VENDOR_GUIDES,
    ...BIRTHDAY_VENDOR_GUIDES,
    ...COMMUNITY_VENDOR_GUIDES,
  ];

  it('contains zero URLs in any text fields', () => {
    const urlPattern = /https?:\/\/|www\.|\.com\b|\.org\b|\.io\b/i;
    for (const g of allGuides) {
      expect(g.name).not.toMatch(urlPattern);
      expect(g.scope).not.toMatch(urlPattern);
      g.questions.forEach((q) => expect(q).not.toMatch(urlPattern));
      g.requiredChecks.forEach((c) => expect(c).not.toMatch(urlPattern));
      g.contractWatchouts.forEach((w) => expect(w).not.toMatch(urlPattern));
      g.conditional?.forEach((cond) => {
        cond.questions?.forEach((q) => expect(q).not.toMatch(urlPattern));
        cond.requiredChecks?.forEach((c) => expect(c).not.toMatch(urlPattern));
        cond.contractWatchouts?.forEach((w) => expect(w).not.toMatch(urlPattern));
      });
    }
  });

  it('contains zero phone numbers', () => {
    const phonePattern = /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\+\d{1,3}\s?\d{6,}/;
    for (const g of allGuides) {
      expect(g.scope).not.toMatch(phonePattern);
      g.questions.forEach((q) => expect(q).not.toMatch(phonePattern));
      g.requiredChecks.forEach((c) => expect(c).not.toMatch(phonePattern));
      g.contractWatchouts.forEach((w) => expect(w).not.toMatch(phonePattern));
    }
  });

  it('contains zero forbidden statutory agency citations', () => {
    const forbidden = /\b(ADA|CPSC|AAP|FDA|OSHA|WWCC|Blue Card)\b/i;
    for (const g of allGuides) {
      expect(g.name).not.toMatch(forbidden);
      expect(g.scope).not.toMatch(forbidden);
      g.questions.forEach((q) => expect(q).not.toMatch(forbidden));
      g.requiredChecks.forEach((c) => expect(c).not.toMatch(forbidden));
      g.contractWatchouts.forEach((w) => expect(w).not.toMatch(forbidden));
    }
  });
});
