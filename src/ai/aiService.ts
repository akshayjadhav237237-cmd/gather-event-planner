import { AI_COOLDOWN_MS } from '../config/constants';
import type { PersonalizedIdeas } from '../types/event';
import type { AiPlanInput, AiResult, IdeaSection, LlmClient } from './aiTypes';
import { mergeSection, processNotes, requestLiveIdeas, resolveConfig } from './aiServiceHelpers';
import { generateLocalIdeas, regenerateLocalSection } from './localIdeaGenerator';
import type { ResponseCache } from './responseCache';
import { validateIdeas } from './securityGuard';
import { hashString } from './seededRandom';

export interface AiOptions {
  apiKey?: string | null;
  notes?: string | null;
  variant?: number;
  client?: LlmClient;
  fetchImpl?: typeof fetch;
  now?: () => number;
  cache?: ResponseCache;
  signal?: AbortSignal;
}

let lastLiveRequestTime = 0;

/** Generates personalized celebration ideas, using live LLM when available or offline heuristic generator as fallback. */
export async function generateIdeas(input: AiPlanInput, opts: AiOptions = {}): Promise<AiResult> {
  const { apiKey, variant, client, fetchImpl, now, cache } = resolveConfig(opts);
  const { sanitizedNotes, notesDropped } = processNotes(opts.notes);

  if (!apiKey || apiKey.trim() === '') {
    return {
      ideas: generateLocalIdeas(input, variant, sanitizedNotes),
      mode: 'local',
      reason: null,
      notesDropped,
      fromCache: false,
    };
  }

  const cacheKey = hashString(
    [
      input.context.id,
      input.context.eventDate,
      input.decision.activeRuleIds.join(','),
      variant,
      sanitizedNotes ?? '',
    ].join('|')
  ).toString();
  const cached = cache.get(cacheKey);
  if (cached) return { ideas: cached, mode: 'live', reason: null, notesDropped, fromCache: true };

  const currentTime = now();
  if (lastLiveRequestTime > 0 && currentTime - lastLiveRequestTime < AI_COOLDOWN_MS) {
    return {
      ideas: generateLocalIdeas(input, variant, sanitizedNotes),
      mode: 'fallback',
      reason: 'rate_limited',
      notesDropped,
      fromCache: false,
    };
  }

  lastLiveRequestTime = currentTime;
  const live = await requestLiveIdeas(
    input,
    sanitizedNotes,
    apiKey,
    client,
    fetchImpl,
    undefined,
    opts.signal
  );
  if (live.ok) {
    cache.set(cacheKey, live.ideas);
    return { ideas: live.ideas, mode: 'live', reason: null, notesDropped, fromCache: false };
  }
  return {
    ideas: generateLocalIdeas(input, variant, sanitizedNotes),
    mode: 'fallback',
    reason: live.reason,
    notesDropped,
    fromCache: false,
  };
}

/** Re-rolls and replaces a single section of ideas while preserving remaining sections. */
export async function regenerateIdeaSection(
  current: PersonalizedIdeas,
  section: IdeaSection,
  input: AiPlanInput,
  opts: AiOptions = {}
): Promise<AiResult> {
  const { apiKey, variant, client, fetchImpl, now } = resolveConfig(opts);
  const { sanitizedNotes, notesDropped } = processNotes(opts.notes);

  if (!apiKey || apiKey.trim() === '') {
    return {
      ideas: regenerateLocalSection(current, section, input, variant, sanitizedNotes),
      mode: 'local',
      reason: null,
      notesDropped,
      fromCache: false,
    };
  }

  const currentTime = now();
  if (lastLiveRequestTime > 0 && currentTime - lastLiveRequestTime < AI_COOLDOWN_MS) {
    return {
      ideas: regenerateLocalSection(current, section, input, variant, sanitizedNotes),
      mode: 'fallback',
      reason: 'rate_limited',
      notesDropped,
      fromCache: false,
    };
  }

  lastLiveRequestTime = currentTime;
  const live = await requestLiveIdeas(
    input,
    sanitizedNotes,
    apiKey,
    client,
    fetchImpl,
    section,
    opts.signal
  );
  if (live.ok) {
    const merged = mergeSection(current, section, live.ideas);
    const valid = validateIdeas(merged);
    if (valid.ok)
      return { ideas: valid.value, mode: 'live', reason: null, notesDropped, fromCache: false };
  }
  return {
    ideas: regenerateLocalSection(current, section, input, variant, sanitizedNotes),
    mode: 'fallback',
    reason: live.ok ? 'invalid_response' : live.reason,
    notesDropped,
    fromCache: false,
  };
}
