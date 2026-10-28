import type { ContextSignals } from '../types/engine';
import type { EventContext } from '../types/event';
import type { SeedTags } from './ideaSeedTypes';

export function isUniversal(t?: SeedTags): boolean {
  if (!t) return true;
  return (
    !t.subFormats?.length &&
    !t.settings?.length &&
    !t.seasons?.length &&
    !t.budgetTiers?.length &&
    !t.requiresFlags?.length &&
    !t.excludesFlags?.length
  );
}

export function matchesTags(tags: SeedTags, ctx: EventContext, sig: ContextSignals): boolean {
  if (tags.subFormats?.length && !tags.subFormats.includes(ctx.subFormat)) return false;
  if (tags.settings?.length && !tags.settings.includes(ctx.setting)) return false;
  if (tags.seasons?.length && !tags.seasons.includes(ctx.season)) return false;
  if (tags.budgetTiers?.length && !tags.budgetTiers.includes(sig.budgetTier)) return false;
  if (tags.requiresFlags?.length && !tags.requiresFlags.every((f) => ctx.flags.includes(f)))
    return false;
  if (tags.excludesFlags?.length && tags.excludesFlags.some((f) => ctx.flags.includes(f)))
    return false;
  return true;
}

export function countKeywordMatches(
  seed: { keywords?: string[]; title?: string; summary?: string },
  words: string[]
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

export function resolveTokens(template: string, ctx: EventContext, sig: ContextSignals): string {
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
