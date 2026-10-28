import { describe, expect, it } from 'vitest';
import type { ContextAdaptation } from '../src/types/event';
import { MODULE_LABELS, SEVERITY_LABELS, summarizeAdaptations } from '../src/ui/adaptationView';

function createMockAdaptation(
  id: string,
  severity: ContextAdaptation['severity'],
  module: ContextAdaptation['targetModule'] = 'budget'
): ContextAdaptation {
  return {
    id,
    ruleId: `rule-${id}`,
    triggerSignal: 'test signal',
    severity,
    explanation: `Explanation for ${id}`,
    targetModule: module,
  };
}

describe('adaptationView labels', () => {
  it('defines human-friendly severity labels', () => {
    expect(SEVERITY_LABELS.critical).toBe('Critical');
    expect(SEVERITY_LABELS.warning).toBe('Warning');
    expect(SEVERITY_LABELS.info).toBe('Note');
  });

  it('defines human-friendly module labels', () => {
    expect(MODULE_LABELS.budget).toBe('Budget');
    expect(MODULE_LABELS.timeline).toBe('Timeline');
    expect(MODULE_LABELS.vendor).toBe('Vendors');
    expect(MODULE_LABELS.safety).toBe('Safety');
    expect(MODULE_LABELS.ideas).toBe('Ideas');
  });
});

describe('summarizeAdaptations', () => {
  it('handles empty adaptation list correctly', () => {
    const summary = summarizeAdaptations([]);
    expect(summary.counts).toEqual({ critical: 0, warning: 0, info: 0 });
    expect(summary.prominent).toEqual([]);
    expect(summary.notes).toEqual([]);
    expect(summary.headline).toBe('Standard celebration setup');
    expect(summary.announcement).toBe(
      'No special adaptations needed. Your plan uses the standard setup.'
    );
  });

  it('summarizes a single critical adaptation', () => {
    const list = [createMockAdaptation('1', 'critical', 'safety')];
    const summary = summarizeAdaptations(list);
    expect(summary.counts.critical).toBe(1);
    expect(summary.counts.warning).toBe(0);
    expect(summary.counts.info).toBe(0);
    expect(summary.prominent).toHaveLength(1);
    expect(summary.notes).toHaveLength(0);
    expect(summary.headline).toBe('1 plan adaptation active');
    expect(summary.announcement).toBe('1 plan adaptation active: 1 critical.');
  });

  it('summarizes a single warning with singular phrasing', () => {
    const list = [createMockAdaptation('1', 'warning', 'budget')];
    const summary = summarizeAdaptations(list);
    expect(summary.headline).toBe('1 plan adaptation active');
    expect(summary.announcement).toBe('1 plan adaptation active: 1 warning.');
  });

  it('summarizes a single note with singular phrasing', () => {
    const list = [createMockAdaptation('1', 'info', 'timeline')];
    const summary = summarizeAdaptations(list);
    expect(summary.headline).toBe('1 plan adaptation active');
    expect(summary.announcement).toBe('1 plan adaptation active: 1 note.');
  });

  it('handles multiple warnings and notes with correct plurals', () => {
    const list = [
      createMockAdaptation('1', 'critical', 'safety'),
      createMockAdaptation('2', 'warning', 'budget'),
      createMockAdaptation('3', 'warning', 'vendor'),
      createMockAdaptation('4', 'info', 'timeline'),
      createMockAdaptation('5', 'info', 'ideas'),
    ];
    const summary = summarizeAdaptations(list);
    expect(summary.counts).toEqual({ critical: 1, warning: 2, info: 2 });
    expect(summary.prominent).toHaveLength(3);
    expect(summary.notes).toHaveLength(2);
    expect(summary.headline).toBe('5 plan adaptations active');
    expect(summary.announcement).toBe(
      '5 plan adaptations active: 1 critical, 2 warnings, 2 notes.'
    );
  });

  it('matches exact specification phrasing for 1 critical, 1 warning, 1 note', () => {
    const list = [
      createMockAdaptation('1', 'critical', 'safety'),
      createMockAdaptation('2', 'warning', 'budget'),
      createMockAdaptation('3', 'info', 'timeline'),
    ];
    const summary = summarizeAdaptations(list);
    expect(summary.headline).toBe('3 plan adaptations active');
    expect(summary.announcement).toBe('3 plan adaptations active: 1 critical, 1 warning, 1 note.');
  });

  it('handles multiple critical items correctly', () => {
    const list = [
      createMockAdaptation('1', 'critical', 'safety'),
      createMockAdaptation('2', 'critical', 'budget'),
    ];
    const summary = summarizeAdaptations(list);
    expect(summary.counts.critical).toBe(2);
    expect(summary.headline).toBe('2 plan adaptations active');
    expect(summary.announcement).toBe('2 plan adaptations active: 2 critical.');
    expect(summary.prominent).toHaveLength(2);
    expect(summary.notes).toHaveLength(0);
  });

  it('preserves list order in prominent and notes collections', () => {
    const item1 = createMockAdaptation('item1', 'critical');
    const item2 = createMockAdaptation('item2', 'info');
    const item3 = createMockAdaptation('item3', 'warning');
    const item4 = createMockAdaptation('item4', 'info');
    const item5 = createMockAdaptation('item5', 'critical');

    const summary = summarizeAdaptations([item1, item2, item3, item4, item5]);
    expect(summary.prominent).toEqual([item1, item3, item5]);
    expect(summary.notes).toEqual([item2, item4]);
  });
});
