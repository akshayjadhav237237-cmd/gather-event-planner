import { describe, expect, it } from 'vitest';
import { SEVERITY_BADGE_TONES, SEVERITY_TO_ALERT_TONE, TONE_PREFIX } from '../src/ui/severityStyle';

describe('severityStyle mappings', () => {
  it('maps severity to badge tone correctly', () => {
    expect(SEVERITY_BADGE_TONES.critical).toBe('critical');
    expect(SEVERITY_BADGE_TONES.warning).toBe('warning');
    expect(SEVERITY_BADGE_TONES.info).toBe('neutral');
  });

  it('maps severity to alert tone correctly', () => {
    expect(SEVERITY_TO_ALERT_TONE.critical).toBe('critical');
    expect(SEVERITY_TO_ALERT_TONE.warning).toBe('warning');
    expect(SEVERITY_TO_ALERT_TONE.info).toBe('info');
  });

  it('provides accessible prefix for each tone', () => {
    expect(TONE_PREFIX.critical).toBe('Critical:');
    expect(TONE_PREFIX.warning).toBe('Warning:');
    expect(TONE_PREFIX.info).toBe('Information:');
    expect(TONE_PREFIX.success).toBe('Success:');
  });
});
