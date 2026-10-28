import type { AiFallbackReason } from './aiTypes';

const ERROR_MESSAGES: Record<AiFallbackReason, string> = {
  no_key: 'No API key provided.',
  timeout: 'The AI request timed out.',
  network: 'A network error occurred while contacting the AI service.',
  http_error: 'The AI service returned an error status.',
  rate_limited: 'The AI service rate limit has been exceeded.',
  invalid_response: 'The AI service returned an invalid or unparseable response.',
  crypto_unavailable:
    'Cryptographic random number generation is not available in this environment.',
};

/** Standardized error wrapper for AI provider and invocation failures. */
export class LlmError extends Error {
  readonly code: AiFallbackReason;

  constructor(code: AiFallbackReason) {
    super(ERROR_MESSAGES[code]);
    this.name = 'LlmError';
    this.code = code;
    Object.setPrototypeOf(this, LlmError.prototype);
  }
}
