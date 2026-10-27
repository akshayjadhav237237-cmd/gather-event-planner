import { describe, expect, it } from 'vitest';
import { ignoreExpectedError } from '../src/utils/errors';

describe('ignoreExpectedError', () => {
  it('safely handles error and justification without throwing', () => {
    expect(() => ignoreExpectedError(new Error('test'), 'expected in fallback')).not.toThrow();
    expect(() => ignoreExpectedError('string error', 'string error reason')).not.toThrow();
    expect(() => ignoreExpectedError(null, 'null error reason')).not.toThrow();
  });
});
