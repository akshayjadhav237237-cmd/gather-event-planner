import type { ContextSignals } from '../types/engine';
import type {
  ActivityIdea, BespokeTask, CateringIdea, EventContext, PersonalizedIdeas, ThemeConcept,
} from '../types/event';
import { getIdeaBank } from '../data/ideas';
import { formatCurrency } from '../utils/currency';
import type { AiPlanInput, IdeaSection } from './aiTypes';
import type { ActivitySeed, BespokeSeed, CateringSeed, SeedTags, ThemeSeed } from './ideaSeedTypes';
import { createSeededRandom, hashString } from './seededRandom';

function isUniversal(t?: SeedTags): boolean {
  if (!t) return true;
  return !t.subFormats?.length && !t.settings?.length && !t.seasons?.length &&
    !t.budgetTiers?.length && !t.requiresFlags?.length && !t.excludesFlags?.length;
}

function matchesTags(tags: SeedTags, ctx: EventContext, sig: ContextSignals): boolean {
  if (tags.subFormats?.length && !tags.subFormats.includes(ctx.subFormat)) return false;
  if (tags.settings?.length && !tags.settings.includes(ctx.setting)) return false;
  if (tags.seasons?.length && !tags.seasons.includes(ctx.season)) return false;
  if (tags.budgetTiers?.length && !tags.budgetTiers.includes(sig.budgetTier)) return false;
  if (tags.requiresFlags?.length && !tags.requiresFlags.every((f) => ctx.flags.includes(f))) return false;
  if (tags.excludesFlags?.length && tags.excludesFlags.some((f) => ctx.flags.includes(f))) return false;
  return true;
}

function countKeywordMatches(
  seed: { keywords?: string[]; title?: string; summary?: string },
  words: string[],
): number {
  if (words.length === 0) return 0;
  const targets = new Set<string>();
  const add = (text?: string) => {
    if (text) for (const w of text.toLowerCase().match(/\b\w+\b/g) || []) targets.add(w);
  };
  seed.keywords?.forEach(add);
  add(seed.title);
  add(seed.summary);
  return words.reduce((acc, w) => acc + (targets.has(w) ? 1 : 0), 0);
}

function resolveTokens(template: string, ctx: EventContext, sig: ContextSignals): string {
  return template
    .replace(/\{guests\}/g, String(ctx.guestCount))
    .replace(/\{setting\}/g, ctx.setting)
    .replace(/\{season\}/g, ctx.season)
    .replace(/\{tier\}/g, sig.budgetTier)
    .replace(/\{days\}/g, String(Math.max(0, sig.daysUntilEvent)))
    .replace(/\{event\}/g, ctx.eventType)
    .replace(/\{[a-zA-Z0-9_]+\}/g, '')
    .slice(0, 300);
}

function pickSeeds<T extends { id: string; keywords?: string[]; tags?: SeedTags }>(
  allSeeds: T[],
  input: AiPlanInput,
  variant: number,
  notes: string | null,
  sectionKey: string | undefined,
  quota: number,
): T[] {
  const { context, signals } = input;
  const b1: T[] = [];
  const b2: T[] = [];
  const b3: T[] = [];

  for (const s of allSeeds) {
    if (isUniversal(s.tags)) b2.push(s);
    else if (s.tags && matchesTags(s.tags, context, signals)) b1.push(s);
    else b3.push(s);
  }

  const seen = new Set<string>();
  const pool = [...b1, ...b2].filter((s) => !seen.has(s.id) && Boolean(seen.add(s.id)));
  if (pool.length < quota) {
    for (const s of b3) if (!seen.has(s.id) && seen.add(s.id)) pool.push(s);
  }

  const seedParts = [
    context.id, context.eventDate, context.subFormat,
    [...context.flags].sort().join(','), signals.budgetTier, variant, sectionKey ?? 'all',
  ];
  const rng = createSeededRandom(hashString(seedParts.join('|')));

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const itemI = pool[i];
    const itemJ = pool[j];
    if (itemI !== undefined && itemJ !== undefined) {
      pool[i] = itemJ;
      pool[j] = itemI;
    }
  }

  const noteWords = notes ? (notes.toLowerCase().match(/\b\w+\b/g) || []) : [];
  if (noteWords.length > 0) {
    pool.sort((a, b) => countKeywordMatches(b, noteWords) - countKeywordMatches(a, noteWords));
  }

  return pool.slice(0, quota);
}

const mapTheme = (s: ThemeSeed, c: EventContext, g: ContextSignals): ThemeConcept => ({
  id: s.id, title: s.title, summary: s.summary,
  whyItFits: resolveTokens(s.why, c, g), colorPalette: s.colorPalette,
});

const mapCatering = (s: CateringSeed, c: EventContext, g: ContextSignals): CateringIdea => ({
  id: s.id, title: s.title, summary: s.summary,
  whyItFits: resolveTokens(s.why, c, g),
  allergySafetyNote: s.allergySafetyNote, budgetSwapIdea: s.budgetSwapIdea,
});

const mapActivity = (s: ActivitySeed, c: EventContext, g: ContextSignals): ActivityIdea => ({
  id: s.id, title: s.title, summary: s.summary,
  whyItFits: resolveTokens(s.why, c, g), audienceFit: s.audienceFit, safetyNote: s.safetyNote,
});

const mapBespoke = (s: BespokeSeed, c: EventContext, g: ContextSignals): BespokeTask => ({
  title: s.title, phase: s.phase, rationale: resolveTokens(s.rationale, c, g),
});

function getContradictionAdvisory(
  sig: ContextSignals,
  ctx: EventContext,
  notes: string | null,
): string | null {
  if (sig.isPast) {
    return 'Event date is in the past. Update the date to see accurate planning timelines.';
  }
  const text = notes ?? ctx.userNotes;
  if (sig.budgetTier === 'tight' && /\b(luxury|lavish|five-star|5-star|plated|premium|grand)\b/i.test(text)) {
    const formatted = formatCurrency(sig.perGuestBudget, ctx.currency);
    const msg = `Per-guest budget (${formatted}) may be tight for premium elements; consider family-style dining or civic venues.`;
    return msg.slice(0, 220);
  }
  return null;
}

/** Generates a deterministic, contextually tailored bundle of personalized celebration ideas offline. */
export function generateLocalIdeas(
  input: AiPlanInput,
  variant: number = 0,
  notes: string | null = null,
): PersonalizedIdeas {
  const { context, signals } = input;
  const bank = getIdeaBank(context.eventType);
  const active = notes ?? (context.userNotes.trim().length > 0 ? context.userNotes : null);

  const themes = pickSeeds(bank.themes, input, variant, active, undefined, 3);
  const catering = pickSeeds(bank.catering, input, variant, active, undefined, 3);
  const activities = pickSeeds(bank.activities, input, variant, active, undefined, 3);
  const bespoke = pickSeeds(bank.bespoke, input, variant, active, undefined, 4);

  return {
    source: 'local',
    themeConcepts: themes.map((s) => mapTheme(s, context, signals)),
    cateringIdeas: catering.map((s) => mapCatering(s, context, signals)),
    activityIdeas: activities.map((s) => mapActivity(s, context, signals)),
    bespokeTasks: bespoke.map((s) => mapBespoke(s, context, signals)),
    contradictionAdvisory: getContradictionAdvisory(signals, context, active),
  };
}

/** Re-rolls and replaces a single section of personalized ideas with different matching concepts. */
export function regenerateLocalSection(
  current: PersonalizedIdeas,
  section: IdeaSection,
  input: AiPlanInput,
  variant: number,
  notes: string | null = null,
): PersonalizedIdeas {
  const { context: ctx, signals: sig } = input;
  const bank = getIdeaBank(ctx.eventType);
  const active = notes ?? (ctx.userNotes.trim().length > 0 ? ctx.userNotes : null);
  const clone: PersonalizedIdeas = {
    ...current,
    themeConcepts: [...current.themeConcepts],
    cateringIdeas: [...current.cateringIdeas],
    activityIdeas: [...current.activityIdeas],
    bespokeTasks: [...current.bespokeTasks],
  };

  if (section === 'themeConcepts') {
    clone.themeConcepts = pickSeeds(bank.themes, input, variant, active, section, 3).map((s) => mapTheme(s, ctx, sig));
  } else if (section === 'cateringIdeas') {
    clone.cateringIdeas = pickSeeds(bank.catering, input, variant, active, section, 3).map((s) => mapCatering(s, ctx, sig));
  } else if (section === 'activityIdeas') {
    clone.activityIdeas = pickSeeds(bank.activities, input, variant, active, section, 3).map((s) => mapActivity(s, ctx, sig));
  } else if (section === 'bespokeTasks') {
    clone.bespokeTasks = pickSeeds(bank.bespoke, input, variant, active, section, 4).map((s) => mapBespoke(s, ctx, sig));
  }
  return clone;
}
