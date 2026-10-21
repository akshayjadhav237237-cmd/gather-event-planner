import { describe, expect, it } from 'vitest';
import { buildIcs } from '../../src/export/ics';
import type { EventContext, TimelinePlan } from '../../src/types/event';

function createMockContext(overrides?: Partial<EventContext>): EventContext {
  return {
    id: 'test-event-1',
    title: 'Grand Gala Celebration',
    eventType: 'wedding',
    subFormat: 'western',
    eventDate: '2027-06-15',
    currency: 'USD',
    totalBudget: 25000,
    guestCount: 150,
    setting: 'indoor',
    season: 'summer',
    priorities: ['venue', 'catering'],
    flags: [],
    userNotes: '',
    ...overrides,
  };
}

function createMockTimeline(): TimelinePlan {
  return {
    daysAvailable: 180,
    isCompressed: false,
    runOfShow: [],
    tasks: [
      {
        id: 'task-1',
        title: 'Book reception venue',
        phase: 'Foundations',
        dueDate: '2027-01-15',
        priority: 'critical',
        dependsOn: [],
        optional: false,
        skippedInCompression: false,
        rationale: 'Venues book out well in advance.',
      },
      {
        id: 'task-2',
        title: 'Finalize floral arrangements; order centerpieces',
        phase: 'Details',
        dueDate: '2027-05-10',
        priority: 'medium',
        dependsOn: ['task-1'],
        optional: false,
        skippedInCompression: false,
        rationale: 'Review samples, confirm choices, and order.',
      },
      {
        id: 'task-3',
        title: 'Completed task to ignore',
        phase: 'Details',
        dueDate: '2027-04-01',
        priority: 'low',
        dependsOn: [],
        optional: false,
        skippedInCompression: false,
        rationale: 'Should not appear in ics.',
      },
      {
        id: 'task-4',
        title: 'Skipped compressed task',
        phase: 'Details',
        dueDate: '2027-04-15',
        priority: 'low',
        dependsOn: [],
        optional: true,
        skippedInCompression: true,
        rationale: 'Skipped due to time.',
      },
    ],
  };
}

describe('buildIcs', () => {
  const stamp = '20270101T120000Z';
  const emptyTimeline = { daysAvailable: 1, isCompressed: false, tasks: [], runOfShow: [] };

  it('generates valid RFC 5545 envelope with Gregorian calscale', () => {
    const ics = buildIcs({
      context: createMockContext(),
      timeline: createMockTimeline(),
      taskCompletion: {},
      stamp,
    });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('VERSION:2.0\r\n');
    expect(ics).toContain('PRODID:-//Gather//Celebration Planner//EN\r\n');
    expect(ics).toContain('CALSCALE:GREGORIAN\r\n');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('uses CRLF line endings throughout', () => {
    const ics = buildIcs({
      context: createMockContext(),
      timeline: createMockTimeline(),
      taskCompletion: {},
      stamp,
    });
    const lines = ics.split('\r\n');
    expect(lines.length).toBeGreaterThan(5);
    for (const line of lines) {
      expect(line).not.toContain('\r');
      expect(line).not.toContain('\n');
    }
  });

  it('creates an all-day event for the celebration with next-day DTEND', () => {
    const ics = buildIcs({
      context: createMockContext({ eventDate: '2027-06-15' }),
      timeline: emptyTimeline,
      taskCompletion: {},
      stamp,
    });
    expect(ics).toContain('UID:test-event-1-event@gather.local');
    expect(ics).toContain('DTSTART;VALUE=DATE:20270615');
    expect(ics).toContain('DTEND;VALUE=DATE:20270616');
    expect(ics).toContain('SUMMARY:Grand Gala Celebration');
  });

  it('handles DTEND rollover across leap year and year-end', () => {
    const leapEve = buildIcs({
      context: createMockContext({ eventDate: '2028-02-28' }),
      timeline: emptyTimeline,
      taskCompletion: {},
      stamp,
    });
    expect(leapEve).toContain('DTSTART;VALUE=DATE:20280228');
    expect(leapEve).toContain('DTEND;VALUE=DATE:20280229');

    const leapDay = buildIcs({
      context: createMockContext({ eventDate: '2028-02-29' }),
      timeline: emptyTimeline,
      taskCompletion: {},
      stamp,
    });
    expect(leapDay).toContain('DTSTART;VALUE=DATE:20280229');
    expect(leapDay).toContain('DTEND;VALUE=DATE:20280301');

    const yearEnd = buildIcs({
      context: createMockContext({ eventDate: '2027-12-31' }),
      timeline: emptyTimeline,
      taskCompletion: {},
      stamp,
    });
    expect(yearEnd).toContain('DTSTART;VALUE=DATE:20271231');
    expect(yearEnd).toContain('DTEND;VALUE=DATE:20280101');
  });

  it('excludes completed and skipped tasks', () => {
    const ics = buildIcs({
      context: createMockContext(),
      timeline: createMockTimeline(),
      taskCompletion: { 'task-3': true },
      stamp,
    });
    expect(ics).toContain('UID:test-event-1-task-1@gather.local');
    expect(ics).toContain('UID:test-event-1-task-2@gather.local');
    expect(ics).not.toContain('test-event-1-task-3');
    expect(ics).not.toContain('test-event-1-task-4');
  });

  it('escapes special characters in text fields', () => {
    const context = createMockContext({
      title: 'Party with Alice, Bob; & Charlie\\Dave\nSpecial night',
    });
    const ics = buildIcs({ context, timeline: emptyTimeline, taskCompletion: {}, stamp });
    expect(ics).toContain('Party with Alice\\, Bob\\; & Charlie\\\\Dave\\nSpecial night');
  });

  it('folds lines to max 75 octets without splitting multibyte UTF-8 characters', () => {
    const longTitle =
      'Long Title With Emojis 🎉✨ And Accented Letters éàü To Test RFC 5545 Folding Length Limits';
    const ics = buildIcs({
      context: createMockContext({ title: longTitle }),
      timeline: emptyTimeline,
      taskCompletion: {},
      stamp,
    });
    const lines = ics.split('\r\n');
    for (const line of lines) {
      if (line.length === 0) continue;
      const bytes = new TextEncoder().encode(line).length;
      expect(bytes).toBeLessThanOrEqual(75);
    }
  });

  it('is deterministic for identical inputs', () => {
    const input = {
      context: createMockContext(),
      timeline: createMockTimeline(),
      taskCompletion: { 'task-3': true },
      stamp,
    };
    expect(buildIcs(input)).toBe(buildIcs(input));
  });
});
