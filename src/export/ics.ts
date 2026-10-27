import type { EventContext, TimelinePlan } from '../types/event';
import { addDays } from '../utils/dateMath';

function getUtf8ByteLength(ch: string): number {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp <= 0x7f) return 1;
  if (cp <= 0x7ff) return 2;
  if (cp <= 0xffff) return 3;
  return 4;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

function foldIcsLine(line: string): string {
  const maxFirstLineBytes = 75;
  const maxContinuationBytes = 74;

  let currentLine = '';
  let currentBytes = 0;
  const segments: string[] = [];

  for (const ch of line) {
    const chBytes = getUtf8ByteLength(ch);
    const limit = segments.length === 0 ? maxFirstLineBytes : maxContinuationBytes;

    if (currentBytes + chBytes > limit && currentLine.length > 0) {
      segments.push(currentLine);
      currentLine = ch;
      currentBytes = chBytes;
    } else {
      currentLine += ch;
      currentBytes += chBytes;
    }
  }

  if (currentLine.length > 0) {
    segments.push(currentLine);
  }

  if (segments.length <= 1) {
    return segments[0] ?? '';
  }

  return [segments[0], ...segments.slice(1).map((s) => ' ' + s)].join('\r\n');
}

/** Generates an RFC 5545 iCalendar (.ics) string containing the celebration date and uncompleted task milestones. */
export function buildIcs(input: {
  context: EventContext;
  timeline: TimelinePlan;
  taskCompletion: Record<string, boolean>;
  stamp: string;
}): string {
  const { context, timeline, taskCompletion, stamp } = input;
  const safeContextId = context.id.replace(/[^a-zA-Z0-9_-]/g, '');

  const rawLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gather//Celebration Planner//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${safeContextId}-event@gather.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${context.eventDate.replace(/-/g, '')}`,
    `DTEND;VALUE=DATE:${addDays(context.eventDate, 1).replace(/-/g, '')}`,
    `SUMMARY:${escapeIcsText(context.title)}`,
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
  ];

  for (const task of timeline.tasks) {
    if (taskCompletion[task.id] || task.skippedInCompression) {
      continue;
    }

    const safeTaskId = task.id.replace(/[^a-zA-Z0-9_-]/g, '');
    rawLines.push(
      'BEGIN:VEVENT',
      `UID:${safeContextId}-${safeTaskId}@gather.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${task.dueDate.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${addDays(task.dueDate, 1).replace(/-/g, '')}`,
      `SUMMARY:${escapeIcsText('Task: ' + task.title)}`,
      `DESCRIPTION:${escapeIcsText(task.rationale)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }

  rawLines.push('END:VCALENDAR');

  return rawLines.map(foldIcsLine).join('\r\n') + '\r\n';
}
