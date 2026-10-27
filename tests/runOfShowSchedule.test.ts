import { describe, expect, it } from 'vitest';
import { isRunOfShowRole, RUN_OF_SHOW_ROLES } from '../src/data/runOfShowRoles';
import { recalculateSchedule, type RunOfShowSlot } from '../src/domain/runOfShow';

describe('recalculateSchedule boundary and curfew cases', () => {
  it('truncates slot duration when slot exceeds midnight boundary', () => {
    const slots: RunOfShowSlot[] = [
      {
        startTime: '23:30',
        durationMin: 60,
        bufferMin: 15,
        activity: 'Late cleanup',
        owner: 'Coordinator',
      },
    ];

    const result = recalculateSchedule(slots);
    expect(result).toHaveLength(1);
    const slot = result[0]!;
    expect(slot.startTime).toBe('23:30');
    expect(slot.bufferMin).toBe(0);
    // 1435 - (23*60 + 30) = 1435 - 1410 = 25 minutes
    expect(slot.durationMin).toBe(25);
  });

  it('preserves slot when available time before day limit is less than 5 minutes', () => {
    const slots: RunOfShowSlot[] = [
      {
        startTime: '23:58',
        durationMin: 30,
        bufferMin: 10,
        activity: 'Midnight wrap',
        owner: 'Host',
      },
    ];

    const result = recalculateSchedule(slots);
    expect(result).toHaveLength(1);
    // 1435 - 1438 = -3 < 5, so durationMin is unchanged
    expect(result[0]!.durationMin).toBe(30);
  });

  it('validates sanctioned run-of-show roles via isRunOfShowRole', () => {
    for (const role of RUN_OF_SHOW_ROLES) {
      expect(isRunOfShowRole(role)).toBe(true);
    }
    expect(isRunOfShowRole('InvalidRole')).toBe(false);
    expect(isRunOfShowRole('')).toBe(false);
    expect(isRunOfShowRole('DJ')).toBe(false);
  });
});
