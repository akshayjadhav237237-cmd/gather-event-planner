/**
 * Explicitly acknowledges and ignores an expected browser exception (such as
 * localStorage security blocks in private browsing mode, storage quota exceeded,
 * or crypto API unavailability) where an in-memory or graceful fallback is active.
 */
export function ignoreExpectedError(err: unknown, justification: string): void {
  void err;
  void justification;
}
