import { describe, expect, it } from 'vitest';
import type { RunOfShowSlot } from '../src/types/event';
import { formatSlotRange, totalMinutes } from '../src/ui/runOfShowView';

describe('runOfShowView', () => {
  describe('formatSlotRange', () => {
    it('formats a standard morning slot range', () => {
      expect(formatSlotRange('09:00', 60)).toBe('09:00 \u2013 10:00');
    });

    it('formats a slot crossing hour boundaries with minutes', () => {
      expect(formatSlotRange('10:45', 45)).toBe('10:45 \u2013 11:30');
    });

    it('formats a short slot duration correctly', () => {
      expect(formatSlotRange('14:00', 15)).toBe('14:00 \u2013 14:15');
    });

    it('handles zero duration by returning equal start and end', () => {
      expect(formatSlotRange('15:30', 0)).toBe('15:30 \u2013 15:30');
    });

    it('clamps slot extending to exactly midnight (24:00)', () => {
      expect(formatSlotRange('23:00', 60)).toBe('23:00 \u2013 24:00');
    });

    it('clamps slot extending beyond midnight to 24:00 max', () => {
      expect(formatSlotRange('23:30', 90)).toBe('23:30 \u2013 24:00');
    });

    it('clamps massive duration to 24:00 max', () => {
      expect(formatSlotRange('12:00', 1000)).toBe('12:00 \u2013 24:00');
    });
  });

  describe('totalMinutes', () => {
    it('returns 0 for empty slots list', () => {
      expect(totalMinutes([])).toBe(0);
    });

    it('sums duration and buffer minutes across single slot', () => {
      const slots: RunOfShowSlot[] = [
        {
          startTime: '10:00',
          durationMin: 60,
          activity: 'Welcome',
          owner: 'Coordinator',
          bufferMin: 15,
        },
      ];
      expect(totalMinutes(slots)).toBe(75);
    });

    it('sums duration and buffer minutes across multiple slots', () => {
      const slots: RunOfShowSlot[] = [
        {
          startTime: '09:00',
          durationMin: 45,
          activity: 'Setup',
          owner: 'Logistics Lead',
          bufferMin: 15,
        },
        {
          startTime: '10:00',
          durationMin: 90,
          activity: 'Ceremony',
          owner: 'Officiant',
          bufferMin: 0,
        },
        {
          startTime: '11:30',
          durationMin: 120,
          activity: 'Reception',
          owner: 'Catering Lead',
          bufferMin: 30,
        },
      ];
      // 45+15 + 90+0 + 120+30 = 60 + 90 + 150 = 300
      expect(totalMinutes(slots)).toBe(300);
    });

    it('handles slots with zero buffer correctly', () => {
      const slots: RunOfShowSlot[] = [
        {
          startTime: '13:00',
          durationMin: 30,
          activity: 'Toast',
          owner: 'Host',
          bufferMin: 0,
        },
        {
          startTime: '13:30',
          durationMin: 45,
          activity: 'Dance',
          owner: 'DJ',
          bufferMin: 0,
        },
      ];
      expect(totalMinutes(slots)).toBe(75);
    });
  });
});
