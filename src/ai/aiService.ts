import { AI_COOLDOWN_MS, AI_TIMEOUT_MS } from '../config/constants';
import type {
  ActivityIdea,
  BespokeTask,
  CateringIdea,
  PersonalizedIdeas,
  ThemeConcept,
} from '../types/event';
import type {
  AiFallbackReason,
  AiPlanInput,
  AiResult,
  IdeaSection,
  LlmClient,
} from './aiTypes';
import { getApiKey } from './apiKeyStorage';
import { createGeminiClient } from './geminiClient';
import { LlmError } from './llmError';
import { generateLocalIdeas, regenerateLocalSection } from './localIdeaGenerator';
import { buildSystemPrompt, buildUserPrompt } from './promptBuilder';
import { createResponseCache, type ResponseCache } from './responseCache';
import {
  createNonce,
  detectInjection,
  parseJsonSafely,
  sanitizeUserText,
  validateIdeas,
} from './securityGuard';
import { hashString } from './seededRandom';

export interface AiOptions {
  apiKey?: string | null;
  notes?: string | null;
  variant?: number;
  client?: LlmClient;
  fetchImpl?: typeof fetch;
  now?: () => number;
  cache?: ResponseCache;
}

let lastLiveRequestTime = 0;
const defaultCache = createResponseCache(20);

interface ProcessedNotes {
  sanitizedNotes: string | null;
  notesDropped: boolean;
}

function processNotes(notes: string | null | undefined): ProcessedNotes {
  if (!notes) return { sanitizedNotes: null, notesDropped: false };
  const sanitized = sanitizeUserText(notes);
  const injection = detectInjection(sanitized);
  if (injection.flagged) return { sanitizedNotes: null, notesDropped: true };
  return { sanitizedNotes: sanitized, notesDropped: false };
}

function resolveReason(err: unknown, controller: AbortController): AiFallbackReason {
  if (err instanceof LlmError) return err.code;
  if (controller.signal.aborted || (err instanceof Error && err.name === 'AbortError')) return 'timeout';
  return 'network';
}

function resolveConfig(opts: AiOptions) {
  return {
    apiKey: opts.apiKey !== undefined ? opts.apiKey : getApiKey(),
    variant: opts.variant ?? 0,
    client: opts.client ?? createGeminiClient(),
    fetchImpl: opts.fetchImpl ?? globalThis.fetch,
    now: opts.now ?? (() => Date.now()),
    cache: opts.cache ?? defaultCache,
  };
}

function mergeSection(current: PersonalizedIdeas, section: IdeaSection, fresh: PersonalizedIdeas): PersonalizedIdeas {
  const merged = { ...current, source: 'live' as const };
  if (section === 'themeConcepts') return { ...merged, themeConcepts: fresh.themeConcepts as ThemeConcept[] };
  if (section === 'cateringIdeas') return { ...merged, cateringIdeas: fresh.cateringIdeas as CateringIdea[] };
  if (section === 'activityIdeas') return { ...merged, activityIdeas: fresh.activityIdeas as ActivityIdea[] };
  return { ...merged, bespokeTasks: fresh.bespokeTasks as BespokeTask[] };
}

async function requestLiveIdeas(
  input: AiPlanInput,
  notes: string | null,
  apiKey: string,
  client: LlmClient,
  fetchImpl: typeof fetch,
  section?: IdeaSection,
): Promise<{ ok: true; ideas: PersonalizedIdeas } | { ok: false; reason: AiFallbackReason }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const nonce = createNonce();
    const system = buildSystemPrompt();
    const user = buildUserPrompt(input, notes, nonce, section);
    const rawText = await client.generate(system, user, { apiKey, signal: controller.signal, fetchImpl });
    clearTimeout(timer);
    const parsed = parseJsonSafely(rawText);
    if (typeof parsed !== 'object' || parsed === null) throw new LlmError('invalid_response');
    (parsed as Record<string, unknown>).source = 'live';
    const validation = validateIdeas(parsed);
    if (!validation.ok) throw new LlmError('invalid_response');
    return { ok: true, ideas: validation.value };
  } catch (err: unknown) {
    clearTimeout(timer);
    return { ok: false, reason: resolveReason(err, controller) };
  }
}

/** Generates personalized celebration ideas, using live LLM when available or offline heuristic generator as fallback. */
export async function generateIdeas(input: AiPlanInput, opts: AiOptions = {}): Promise<AiResult> {
  const { apiKey, variant, client, fetchImpl, now, cache } = resolveConfig(opts);
  const { sanitizedNotes, notesDropped } = processNotes(opts.notes);

  if (!apiKey || apiKey.trim() === '') {
    return { ideas: generateLocalIdeas(input, variant, sanitizedNotes), mode: 'local', reason: null, notesDropped, fromCache: false };
  }

  const cacheKey = hashString([input.context.id, input.context.eventDate, input.decision.activeRuleIds.join(','), variant, sanitizedNotes ?? ''].join('|')).toString();
  const cached = cache.get(cacheKey);
  if (cached) return { ideas: cached, mode: 'live', reason: null, notesDropped, fromCache: true };

  const currentTime = now();
  if (lastLiveRequestTime > 0 && currentTime - lastLiveRequestTime < AI_COOLDOWN_MS) {
    return { ideas: generateLocalIdeas(input, variant, sanitizedNotes), mode: 'fallback', reason: 'rate_limited', notesDropped, fromCache: false };
  }

  lastLiveRequestTime = currentTime;
  const live = await requestLiveIdeas(input, sanitizedNotes, apiKey, client, fetchImpl);
  if (live.ok) {
    cache.set(cacheKey, live.ideas);
    return { ideas: live.ideas, mode: 'live', reason: null, notesDropped, fromCache: false };
  }
  return { ideas: generateLocalIdeas(input, variant, sanitizedNotes), mode: 'fallback', reason: live.reason, notesDropped, fromCache: false };
}

/** Re-rolls and replaces a single section of ideas while preserving remaining sections. */
export async function regenerateIdeaSection(
  current: PersonalizedIdeas,
  section: IdeaSection,
  input: AiPlanInput,
  opts: AiOptions = {},
): Promise<AiResult> {
  const { apiKey, variant, client, fetchImpl, now } = resolveConfig(opts);
  const { sanitizedNotes, notesDropped } = processNotes(opts.notes);

  if (!apiKey || apiKey.trim() === '') {
    return { ideas: regenerateLocalSection(current, section, input, variant, sanitizedNotes), mode: 'local', reason: null, notesDropped, fromCache: false };
  }

  const currentTime = now();
  if (lastLiveRequestTime > 0 && currentTime - lastLiveRequestTime < AI_COOLDOWN_MS) {
    return { ideas: regenerateLocalSection(current, section, input, variant, sanitizedNotes), mode: 'fallback', reason: 'rate_limited', notesDropped, fromCache: false };
  }

  lastLiveRequestTime = currentTime;
  const live = await requestLiveIdeas(input, sanitizedNotes, apiKey, client, fetchImpl, section);
  if (live.ok) {
    const merged = mergeSection(current, section, live.ideas);
    const valid = validateIdeas(merged);
    if (valid.ok) return { ideas: valid.value, mode: 'live', reason: null, notesDropped, fromCache: false };
  }
  return {
    ideas: regenerateLocalSection(current, section, input, variant, sanitizedNotes),
    mode: 'fallback',
    reason: live.ok ? 'invalid_response' : live.reason,
    notesDropped,
    fromCache: false,
  };
}
