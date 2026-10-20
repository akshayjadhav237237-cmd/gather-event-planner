import { LIVE_MODEL_CONFIG } from '../config/constants';
import type { LlmClient, LlmRequestOptions } from './aiTypes';
import { LlmError } from './llmError';

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

function isAbortError(err: unknown): boolean {
  if (err instanceof Error && err.name === 'AbortError') {
    return true;
  }
  if (typeof err === 'object' && err !== null && 'name' in err) {
    return (err as { name: unknown }).name === 'AbortError';
  }
  return false;
}

/** Creates a Gemini API client communicating via fetch and the x-goog-api-key header. */
export function createGeminiClient(): LlmClient {
  return {
    async generate(system: string, user: string, opts: LlmRequestOptions): Promise<string> {
      const endpoint = `${LIVE_MODEL_CONFIG.endpointBase}/models/${LIVE_MODEL_CONFIG.modelId}:generateContent`;
      const fetchFn = opts.fetchImpl ?? globalThis.fetch;

      const body = JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
        },
      });

      let response: Response;
      try {
        response = await fetchFn(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': opts.apiKey,
          },
          body,
          signal: opts.signal,
        });
      } catch (err: unknown) {
        if (err instanceof LlmError) {
          throw err;
        }
        if (isAbortError(err)) {
          throw new LlmError('timeout');
        }
        if (err instanceof TypeError) {
          throw new LlmError('network');
        }
        throw new LlmError('network');
      }

      if (response.status === 429) {
        throw new LlmError('rate_limited');
      }

      if (!response.ok) {
        throw new LlmError('http_error');
      }

      let jsonPayload: GeminiResponse;
      try {
        jsonPayload = (await response.json()) as GeminiResponse;
      } catch {
        throw new LlmError('invalid_response');
      }

      const candidate = jsonPayload.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      const text = part?.text;

      if (typeof text !== 'string' || text.trim().length === 0) {
        throw new LlmError('invalid_response');
      }

      return text;
    },
  };
}
