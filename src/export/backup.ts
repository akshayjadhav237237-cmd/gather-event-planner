import { z } from 'zod';
import {
  EventContextSchema,
  PersonalizedIdeasSchema,
  VendorQuoteSchema,
} from '../types/schemas';
import type { BackupPayload } from './backupTypes';

const MAX_BACKUP_CHARS = 1_000_000;

const BackupEnvelopeSchema = z
  .object({
    app: z.literal('gather'),
    schemaVersion: z.literal(1),
    exportedAt: z.string().min(1),
    data: z
      .object({
        context: EventContextSchema,
        taskCompletion: z
          .record(z.string(), z.boolean())
          .refine((r) => Object.keys(r).length <= 500, 'Too many task records'),
        actualSpend: z
          .record(z.string(), z.number().int().nonnegative())
          .refine((r) => Object.keys(r).length <= 100, 'Too many spending records'),
        vendorQuotes: z.array(VendorQuoteSchema).max(200),
        ideas: PersonalizedIdeasSchema.nullable(),
      })
      .strict(),
  })
  .strict();

/** Serializes app state into a formatted JSON backup document. */
export function buildBackupJson(payload: BackupPayload, exportedAt: string): string {
  return JSON.stringify(
    {
      app: 'gather',
      schemaVersion: 1,
      exportedAt,
      data: payload,
    },
    null,
    2
  );
}

/** Validates and restores app state from candidate backup text. */
export function parseBackup(
  text: string
): { ok: true; value: BackupPayload } | { ok: false; reason: string } {
  if (text.length > MAX_BACKUP_CHARS) {
    return { ok: false, reason: 'File exceeds maximum allowed backup size.' };
  }

  if (
    text.includes('"__proto__"') ||
    text.includes('"constructor"') ||
    text.includes('"prototype"')
  ) {
    return { ok: false, reason: 'Backup contains prohibited property keys.' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'Invalid JSON format.' };
  }

  const result = BackupEnvelopeSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    const message = issue ? issue.message : 'Validation failed';
    return { ok: false, reason: `Invalid backup document: ${message}` };
  }

  return { ok: true, value: result.data.data };
}
