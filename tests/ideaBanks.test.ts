import { describe, expect, it } from 'vitest';
import type { IdeaBank } from '../src/ai/ideaSeedTypes';
import { CONTEXT_FLAGS, SEASONS, SUB_FORMATS, VENUE_SETTINGS } from '../src/config/constants';
import { BIRTHDAY_BANK, COMMUNITY_BANK, WEDDING_BANK, getIdeaBank } from '../src/data/ideas';
import type { BudgetTier } from '../src/types/engine';
import type { ContextFlag, EventType, Season, SubFormat, VenueSetting } from '../src/types/event';

const BANKS: Array<{ name: EventType; bank: IdeaBank }> = [
  { name: 'wedding', bank: WEDDING_BANK },
  { name: 'birthday', bank: BIRTHDAY_BANK },
  { name: 'community', bank: COMMUNITY_BANK },
];

const ALLOWED_TOKENS = new Set([
  '{guests}',
  '{setting}',
  '{season}',
  '{tier}',
  '{days}',
  '{event}',
]);
const VALID_PHASES = new Set(['Foundations', 'Booking', 'Details', 'Final Week', 'Event Day']);
const VALID_SUB_FORMATS = new Set<SubFormat>(SUB_FORMATS);
const VALID_SETTINGS = new Set<VenueSetting>(VENUE_SETTINGS);
const VALID_SEASONS = new Set<Season>(SEASONS);
const VALID_FLAGS = new Set<ContextFlag>(CONTEXT_FLAGS);
const VALID_BUDGET_TIERS = new Set<BudgetTier>(['tight', 'moderate', 'generous']);

const SUB_MAP: Record<string, string> = {
  '{guests}': '10,000',
  '{setting}': 'outdoor',
  '{season}': 'monsoon',
  '{tier}': 'moderate',
  '{days}': '365',
  '{event}': 'community',
};

function substitute(template: string): string {
  let res = template;
  for (const [token, val] of Object.entries(SUB_MAP)) res = res.split(token).join(val);
  return res;
}

function extractStrings(val: unknown): string[] {
  if (typeof val === 'string') return [val];
  if (Array.isArray(val)) return val.flatMap(extractStrings);
  if (val && typeof val === 'object') return Object.values(val).flatMap(extractStrings);
  return [];
}

describe('Idea Banks Validation', () => {
  it('provides the correct bank for each event type', () => {
    expect(getIdeaBank('wedding')).toBe(WEDDING_BANK);
    expect(getIdeaBank('birthday')).toBe(BIRTHDAY_BANK);
    expect(getIdeaBank('community')).toBe(COMMUNITY_BANK);
  });

  it('verifies birthday bank coverage of specialized tags', () => {
    const all = [
      ...BIRTHDAY_BANK.themes,
      ...BIRTHDAY_BANK.catering,
      ...BIRTHDAY_BANK.activities,
      ...BIRTHDAY_BANK.bespoke,
    ];
    const hasSf = (sf: SubFormat) => all.some((s) => s.tags?.subFormats?.includes(sf));
    expect(hasSf('kids_1_3')).toBe(true);
    expect(hasSf('kids_4_12')).toBe(true);
    expect(hasSf('teen')).toBe(true);
    expect(hasSf('adult_milestone')).toBe(true);
    expect(hasSf('surprise')).toBe(true);
    expect(all.some((s) => s.tags?.budgetTiers?.includes('tight'))).toBe(true);
    expect(all.some((s) => s.tags?.settings?.includes('outdoor'))).toBe(true);
    expect(all.some((s) => s.tags?.requiresFlags?.includes('nut_allergy'))).toBe(true);
  });

  it('verifies community bank coverage of specialized tags', () => {
    const all = [
      ...COMMUNITY_BANK.themes,
      ...COMMUNITY_BANK.catering,
      ...COMMUNITY_BANK.activities,
      ...COMMUNITY_BANK.bespoke,
    ];
    const hasSf = (sf: SubFormat) => all.some((s) => s.tags?.subFormats?.includes(sf));
    expect(hasSf('festival')).toBe(true);
    expect(hasSf('fundraiser')).toBe(true);
    expect(hasSf('neighborhood')).toBe(true);
    expect(hasSf('school_cultural')).toBe(true);
    expect(all.some((s) => s.tags?.requiresFlags?.includes('wheelchair_access'))).toBe(true);
    expect(all.some((s) => s.tags?.requiresFlags?.includes('sponsorship_needed'))).toBe(true);
    expect(all.some((s) => s.tags?.settings?.includes('outdoor'))).toBe(true);
  });

  describe.each(BANKS)('$name bank structure and quotas', ({ bank }) => {
    it('satisfies minimum category counts of at least 9 seeds', () => {
      expect(bank.themes.length).toBeGreaterThanOrEqual(9);
      expect(bank.catering.length).toBeGreaterThanOrEqual(9);
      expect(bank.activities.length).toBeGreaterThanOrEqual(9);
      expect(bank.bespoke.length).toBeGreaterThanOrEqual(9);
    });

    it('contains at least 3 untagged universal seeds in each category', () => {
      const isUntagged = (tags?: object) => !tags || Object.keys(tags).length === 0;
      expect(bank.themes.filter((t) => isUntagged(t.tags)).length).toBeGreaterThanOrEqual(3);
      expect(bank.catering.filter((c) => isUntagged(c.tags)).length).toBeGreaterThanOrEqual(3);
      expect(bank.activities.filter((a) => isUntagged(a.tags)).length).toBeGreaterThanOrEqual(3);
      expect(bank.bespoke.filter((b) => isUntagged(b.tags)).length).toBeGreaterThanOrEqual(3);
    });

    it('ensures all seed IDs are non-empty and unique across the bank', () => {
      const allIds = [
        ...bank.themes.map((t) => t.id),
        ...bank.catering.map((c) => c.id),
        ...bank.activities.map((a) => a.id),
        ...bank.bespoke.map((b) => b.id),
      ];
      expect(allIds.every((id) => id.length > 0)).toBe(true);
      expect(new Set(allIds).size).toBe(allIds.length);
    });

    it('validates 6-digit hex color format for theme palettes', () => {
      const hexPattern = /^#[0-9a-fA-F]{6}$/;
      for (const theme of bank.themes) {
        expect(theme.colorPalette.length).toBe(3);
        for (const hex of theme.colorPalette) expect(hex).toMatch(hexPattern);
      }
    });

    it('verifies why templates contain strictly allowed substitution tokens', () => {
      const allSeedsWithWhy = [...bank.themes, ...bank.catering, ...bank.activities];
      for (const seed of allSeedsWithWhy) {
        const tokens = seed.why.match(/\{[^}]+\}/g) ?? [];
        for (const token of tokens) expect(ALLOWED_TOKENS.has(token)).toBe(true);
      }
    });

    it('ensures bespoke task phases belong to valid canonical timeline phases', () => {
      for (const task of bank.bespoke) {
        expect(VALID_PHASES.has(task.phase)).toBe(true);
      }
    });

    it('satisfies schema length constraints after worst-case substitution', () => {
      for (const t of bank.themes) {
        expect(t.title.length).toBeGreaterThan(0);
        expect(t.title.length).toBeLessThanOrEqual(80);
        expect(t.summary.length).toBeGreaterThan(0);
        expect(t.summary.length).toBeLessThanOrEqual(300);
        expect(substitute(t.why).length).toBeLessThanOrEqual(300);
      }
      for (const c of bank.catering) {
        expect(c.title.length).toBeGreaterThan(0);
        expect(c.title.length).toBeLessThanOrEqual(80);
        expect(c.summary.length).toBeGreaterThan(0);
        expect(c.summary.length).toBeLessThanOrEqual(300);
        expect(substitute(c.why).length).toBeLessThanOrEqual(300);
        expect(c.allergySafetyNote.length).toBeLessThanOrEqual(300);
        expect(c.budgetSwapIdea.length).toBeLessThanOrEqual(300);
      }
      for (const a of bank.activities) {
        expect(a.title.length).toBeGreaterThan(0);
        expect(a.title.length).toBeLessThanOrEqual(80);
        expect(a.summary.length).toBeGreaterThan(0);
        expect(a.summary.length).toBeLessThanOrEqual(300);
        expect(substitute(a.why).length).toBeLessThanOrEqual(300);
        expect(a.audienceFit.length).toBeLessThanOrEqual(300);
        expect(a.safetyNote.length).toBeLessThanOrEqual(300);
      }
      for (const b of bank.bespoke) {
        expect(b.title.length).toBeGreaterThan(0);
        expect(b.title.length).toBeLessThanOrEqual(80);
        expect(b.phase.length).toBeGreaterThan(0);
        expect(b.phase.length).toBeLessThanOrEqual(80);
        expect(b.rationale.length).toBeGreaterThan(0);
        expect(b.rationale.length).toBeLessThanOrEqual(300);
      }
    });

    it('passes purity scan against URLs, phone numbers, statutory terms, and brands', () => {
      const urlRegex = /(https?:\/\/|www\.)/i;
      const phoneRegex = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
      const statutoryRegex = /\b(ADA|CPSC|AAP|FDA|OSHA|WWCC|Blue Card)\b/;
      const brandRegex =
        /\b(Lego|Disney|Marvel|Coca-Cola|Starbucks|Instagram|Pinterest|TikTok|YouTube|Zoom)\b/i;

      const allSeeds = [...bank.themes, ...bank.catering, ...bank.activities, ...bank.bespoke];
      for (const seed of allSeeds) {
        const textValues = extractStrings(seed);
        for (const str of textValues) {
          expect(str).not.toMatch(urlRegex);
          expect(str).not.toMatch(phoneRegex);
          expect(str).not.toMatch(statutoryRegex);
          expect(str).not.toMatch(brandRegex);
        }
      }
    });

    it('ensures all tag properties contain only valid registered enums', () => {
      const allSeeds = [...bank.themes, ...bank.catering, ...bank.activities, ...bank.bespoke];
      for (const seed of allSeeds) {
        if (!seed.tags) continue;
        const { subFormats, settings, seasons, budgetTiers, requiresFlags, excludesFlags } =
          seed.tags;
        if (subFormats) for (const f of subFormats) expect(VALID_SUB_FORMATS.has(f)).toBe(true);
        if (settings) for (const s of settings) expect(VALID_SETTINGS.has(s)).toBe(true);
        if (seasons) for (const s of seasons) expect(VALID_SEASONS.has(s)).toBe(true);
        if (budgetTiers) for (const b of budgetTiers) expect(VALID_BUDGET_TIERS.has(b)).toBe(true);
        if (requiresFlags) for (const r of requiresFlags) expect(VALID_FLAGS.has(r)).toBe(true);
        if (excludesFlags) for (const e of excludesFlags) expect(VALID_FLAGS.has(e)).toBe(true);
      }
    });
  });
});
