import type { ContextSignals } from '../types/engine';
import type {
  ActivityIdea,
  BespokeTask,
  CateringIdea,
  EventContext,
  PersonalizedIdeas,
  ThemeConcept,
} from '../types/event';
import { getIdeaBank } from '../data/ideas';
import { formatCurrency } from '../utils/currency';
import type { AiPlanInput, IdeaSection } from './aiTypes';
import type { ActivitySeed, BespokeSeed, CateringSeed, SeedTags, ThemeSeed } from './ideaSeedTypes';
import { createSeededRandom, hashString } from './seededRandom';

import { countKeywordMatches, isUniversal, matchesTags, resolveTokens } from './localIdeaHelpers';

function pickSeeds<T extends { id: string; keywords?: string[]; tags?: SeedTags }>(
  allSeeds: T[],
  input: AiPlanInput,
  variant: number,
  notes: string | null,
  sectionKey: string | undefined,
  quota: number
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
    context.id,
    context.eventDate,
    context.subFormat,
    [...context.flags].sort().join(','),
    signals.budgetTier,
    variant,
    sectionKey ?? 'all',
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

  const noteWords = notes ? notes.toLowerCase().match(/\b\w+\b/g) || [] : [];
  if (noteWords.length > 0) {
    pool.sort((a, b) => countKeywordMatches(b, noteWords) - countKeywordMatches(a, noteWords));
  }

  return pool.slice(0, quota);
}

const mapTheme = (s: ThemeSeed, c: EventContext, g: ContextSignals): ThemeConcept => ({
  id: s.id,
  title: s.title,
  summary: s.summary,
  whyItFits: resolveTokens(s.why, c, g),
  colorPalette: s.colorPalette,
});

const mapCatering = (s: CateringSeed, c: EventContext, g: ContextSignals): CateringIdea => ({
  id: s.id,
  title: s.title,
  summary: s.summary,
  whyItFits: resolveTokens(s.why, c, g),
  allergySafetyNote: s.allergySafetyNote,
  budgetSwapIdea: s.budgetSwapIdea,
});

const mapActivity = (s: ActivitySeed, c: EventContext, g: ContextSignals): ActivityIdea => ({
  id: s.id,
  title: s.title,
  summary: s.summary,
  whyItFits: resolveTokens(s.why, c, g),
  audienceFit: s.audienceFit,
  safetyNote: s.safetyNote,
});

const mapBespoke = (s: BespokeSeed, c: EventContext, g: ContextSignals): BespokeTask => ({
  title: s.title,
  phase: s.phase,
  rationale: resolveTokens(s.rationale, c, g),
});

function getContradictionAdvisory(
  sig: ContextSignals,
  ctx: EventContext,
  notes: string | null
): string | null {
  if (sig.isPast) {
    return 'Event date is in the past. Update the date to see accurate planning timelines.';
  }
  const text = notes ?? ctx.userNotes;
  if (
    sig.budgetTier === 'tight' &&
    /\b(luxury|lavish|five-star|5-star|plated|premium|grand)\b/i.test(text)
  ) {
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
  notes: string | null = null
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

const SECTION_UPDATERS: Record<
  IdeaSection,
  (
    bank: ReturnType<typeof getIdeaBank>,
    input: AiPlanInput,
    variant: number,
    active: string | null
  ) => Partial<PersonalizedIdeas>
> = {
  themeConcepts: (bank, input, variant, active) => ({
    themeConcepts: pickSeeds(bank.themes, input, variant, active, 'themeConcepts', 3).map((s) =>
      mapTheme(s, input.context, input.signals)
    ),
  }),
  cateringIdeas: (bank, input, variant, active) => ({
    cateringIdeas: pickSeeds(bank.catering, input, variant, active, 'cateringIdeas', 3).map((s) =>
      mapCatering(s, input.context, input.signals)
    ),
  }),
  activityIdeas: (bank, input, variant, active) => ({
    activityIdeas: pickSeeds(bank.activities, input, variant, active, 'activityIdeas', 3).map((s) =>
      mapActivity(s, input.context, input.signals)
    ),
  }),
  bespokeTasks: (bank, input, variant, active) => ({
    bespokeTasks: pickSeeds(bank.bespoke, input, variant, active, 'bespokeTasks', 4).map((s) =>
      mapBespoke(s, input.context, input.signals)
    ),
  }),
};

/** Re-rolls and replaces a single section of personalized ideas with different matching concepts. */
export function regenerateLocalSection(
  current: PersonalizedIdeas,
  section: IdeaSection,
  input: AiPlanInput,
  variant: number,
  notes: string | null = null
): PersonalizedIdeas {
  const bank = getIdeaBank(input.context.eventType);
  const active =
    notes ?? (input.context.userNotes.trim().length > 0 ? input.context.userNotes : null);
  const updater = SECTION_UPDATERS[section];
  if (!updater) return current;
  return { ...current, ...updater(bank, input, variant, active) };
}
