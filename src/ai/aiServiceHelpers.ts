import { AI_TIMEOUT_MS, RESPONSE_CACHE_MAX_ENTRIES } from '../config/constants';
import type { PersonalizedIdeas } from '../types/event';
import type { AiFallbackReason, AiPlanInput, IdeaSection, LlmClient } from './aiTypes';
import { getApiKey } from './apiKeyStorage';
import { createGeminiClient } from './geminiClient';
import { LlmError } from './llmError';
import { buildSystemPrompt, buildUserPrompt } from './promptBuilder';
import { createResponseCache } from './responseCache';
import {
  createNonce,
  detectInjection,
  parseJsonSafely,
  sanitizeUserText,
  validateIdeas,
} from './securityGuard';

export const defaultCache = createResponseCache(RESPONSE_CACHE_MAX_ENTRIES);

export interface ProcessedNotes {
  sanitizedNotes: string | null;
  notesDropped: boolean;
}

export function processNotes(notes: string | null | undefined): ProcessedNotes {
  if (!notes) return { sanitizedNotes: null, notesDropped: false };
  const sanitized = sanitizeUserText(notes);
  const injection = detectInjection(sanitized);
  if (injection.flagged) return { sanitizedNotes: null, notesDropped: true };
  return { sanitizedNotes: sanitized, notesDropped: false };
}

export function resolveReason(err: unknown, controller: AbortController): AiFallbackReason {
  if (err instanceof LlmError) return err.code;
  if (controller.signal.aborted || (err instanceof Error && err.name === 'AbortError'))
    return 'timeout';
  return 'network';
}

export function resolveConfig(opts: {
  apiKey?: string | null;
  variant?: number;
  client?: LlmClient;
  fetchImpl?: typeof fetch;
  now?: () => number;
  cache?: ReturnType<typeof createResponseCache>;
}) {
  return {
    apiKey: opts.apiKey !== undefined ? opts.apiKey : getApiKey(),
    variant: opts.variant ?? 0,
    client: opts.client ?? createGeminiClient(),
    fetchImpl: opts.fetchImpl ?? globalThis.fetch,
    now: opts.now ?? (() => Date.now()),
    cache: opts.cache ?? defaultCache,
  };
}

export function mergeSection(
  current: PersonalizedIdeas,
  section: IdeaSection,
  fresh: PersonalizedIdeas
): PersonalizedIdeas {
  return {
    ...current,
    source: 'live',
    [section]: fresh[section],
  };
}

export async function requestLiveIdeas(
  input: AiPlanInput,
  notes: string | null,
  apiKey: string,
  client: LlmClient,
  fetchImpl: typeof fetch,
  section?: IdeaSection,
  externalSignal?: AbortSignal
): Promise<{ ok: true; ideas: PersonalizedIdeas } | { ok: false; reason: AiFallbackReason }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onAbort, { once: true });
    }
  }
  try {
    const nonce = createNonce();
    const system = buildSystemPrompt();
    const user = buildUserPrompt(input, notes, nonce, section);
    const rawText = await client.generate(system, user, {
      apiKey,
      signal: controller.signal,
      fetchImpl,
    });
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
    const parsed = parseJsonSafely(rawText);
    if (typeof parsed !== 'object' || parsed === null) throw new LlmError('invalid_response');
    const withSource = { ...parsed, source: 'live' };
    const validation = validateIdeas(withSource);
    if (!validation.ok) throw new LlmError('invalid_response');
    return { ok: true, ideas: validation.value };
  } catch (err: unknown) {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
    return { ok: false, reason: resolveReason(err, controller) };
  }
}
