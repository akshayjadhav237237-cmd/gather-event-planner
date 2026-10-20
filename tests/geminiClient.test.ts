import { describe, expect, it } from 'vitest';
import { createGeminiClient } from '../src/ai/geminiClient';
import { LlmError } from '../src/ai/llmError';

const TEST_KEY = 'TESTKSyA_SECRET_KEY_1234567890';
const SENSITIVE_BODY = 'Detailed provider trace with secret credentials';

function makeResponse(body: string, init?: ResponseInit): Response {
  return new Response(body, init);
}

describe('geminiClient', () => {
  const client = createGeminiClient();

  it('sends API key via x-goog-api-key header and keeps URL clean of query params', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = '';

    const mockFetch: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedHeaders = (init?.headers ?? {}) as Record<string, string>;
      capturedBody = String(init?.body ?? '');

      const payload = {
        candidates: [{ content: { parts: [{ text: '{"themeConcepts":[]}' }] } }],
      };
      return makeResponse(JSON.stringify(payload), { status: 200 });
    };

    const result = await client.generate('System prompt', 'User prompt', {
      apiKey: TEST_KEY,
      signal: new AbortController().signal,
      fetchImpl: mockFetch,
    });

    expect(result).toBe('{"themeConcepts":[]}');
    expect(capturedUrl).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    );
    expect(capturedUrl).not.toContain(TEST_KEY);
    expect(new URL(capturedUrl).search).toBe('');
    expect(capturedHeaders['x-goog-api-key']).toBe(TEST_KEY);
    expect(capturedHeaders['Content-Type']).toBe('application/json');

    const parsedBody = JSON.parse(capturedBody) as {
      systemInstruction: { parts: [{ text: string }] };
      contents: [{ parts: [{ text: string }] }];
    };
    expect(parsedBody.systemInstruction.parts[0]?.text).toBe('System prompt');
    expect(parsedBody.contents[0]?.parts[0]?.text).toBe('User prompt');
  });

  it('maps AbortError to LlmError timeout', async () => {
    const mockFetch: typeof fetch = async () => {
      throw new DOMException('The operation was aborted', 'AbortError');
    };

    await expect(
      client.generate('sys', 'user', {
        apiKey: TEST_KEY,
        signal: new AbortController().signal,
        fetchImpl: mockFetch,
      }),
    ).rejects.toMatchObject({ code: 'timeout' });
  });

  it('maps TypeError to LlmError network', async () => {
    const mockFetch: typeof fetch = async () => {
      throw new TypeError('Failed to fetch');
    };

    await expect(
      client.generate('sys', 'user', {
        apiKey: TEST_KEY,
        signal: new AbortController().signal,
        fetchImpl: mockFetch,
      }),
    ).rejects.toMatchObject({ code: 'network' });
  });

  it('maps HTTP 429 to LlmError rate_limited', async () => {
    const mockFetch: typeof fetch = async () => {
      return makeResponse(SENSITIVE_BODY, { status: 429 });
    };

    await expect(
      client.generate('sys', 'user', {
        apiKey: TEST_KEY,
        signal: new AbortController().signal,
        fetchImpl: mockFetch,
      }),
    ).rejects.toMatchObject({ code: 'rate_limited' });
  });

  it('maps HTTP 400 and 500 to LlmError http_error without leaking response body', async () => {
    const mockFetch400: typeof fetch = async () => makeResponse(SENSITIVE_BODY, { status: 400 });
    const mockFetch500: typeof fetch = async () => makeResponse(SENSITIVE_BODY, { status: 500 });

    for (const fetchImpl of [mockFetch400, mockFetch500]) {
      try {
        await client.generate('sys', 'user', {
          apiKey: TEST_KEY,
          signal: new AbortController().signal,
          fetchImpl,
        });
        expect.unreachable();
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(LlmError);
        const llmErr = err as LlmError;
        expect(llmErr.code).toBe('http_error');
        expect(llmErr.message).not.toContain(SENSITIVE_BODY);
        expect(llmErr.message).not.toContain(TEST_KEY);
      }
    }
  });

  it('maps malformed JSON and empty candidate responses to invalid_response', async () => {
    const scenarios: Array<{ body: string; status: number }> = [
      { body: '<html>Bad Gateway</html>', status: 200 },
      { body: JSON.stringify({}), status: 200 },
      { body: JSON.stringify({ candidates: [] }), status: 200 },
      { body: JSON.stringify({ candidates: [{ content: { parts: [] } }] }), status: 200 },
      { body: JSON.stringify({ candidates: [{ content: { parts: [{ text: '   ' }] } }] }), status: 200 },
    ];

    for (const scenario of scenarios) {
      const mockFetch: typeof fetch = async () => makeResponse(scenario.body, { status: scenario.status });
      await expect(
        client.generate('sys', 'user', {
          apiKey: TEST_KEY,
          signal: new AbortController().signal,
          fetchImpl: mockFetch,
        }),
      ).rejects.toMatchObject({ code: 'invalid_response' });
    }
  });

  it('never leaks API key, payload, or provider body under error conditions', async () => {
    const errorFails: Array<() => Promise<Response>> = [
      async () => { throw new TypeError('Network connection refused'); },
      async () => makeResponse(SENSITIVE_BODY, { status: 502 }),
      async () => makeResponse(SENSITIVE_BODY, { status: 429 }),
      async () => makeResponse('{not-json}', { status: 200 }),
    ];

    for (const fail of errorFails) {
      try {
        await client.generate('sys', 'user', {
          apiKey: TEST_KEY,
          signal: new AbortController().signal,
          fetchImpl: fail as typeof fetch,
        });
        expect.unreachable();
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(LlmError);
        const serialized = JSON.stringify(err);
        const message = err instanceof Error ? err.message : '';
        expect(serialized).not.toContain(TEST_KEY);
        expect(message).not.toContain(TEST_KEY);
        expect(serialized).not.toContain(SENSITIVE_BODY);
        expect(message).not.toContain(SENSITIVE_BODY);
      }
    }
  });
});
