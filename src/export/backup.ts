import { z } from 'zod';
import {
  EventContextSchema,
  PersonalizedIdeasSchema,
  VendorQuoteSchema,
} from '../types/schemas';
import type { BackupPayload } from './backupTypes';

const MAX_BACKUP_CHARS = 1_000_000;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function hasForbiddenKeys(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  if (Array.isArray(obj)) {
    return obj.some(hasForbiddenKeys);
  }
  if (Object.prototype.hasOwnProperty.call(obj, '__proto__')) {
    return true;
  }
  if (isRecord(obj)) {
    for (const key of Object.keys(obj)) {
      if (FORBIDDEN_KEYS.has(key)) {
        return true;
      }
      if (hasForbiddenKeys(obj[key])) {
        return true;
      }
    }
  }
  return false;
}

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

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'Invalid JSON format.' };
  }

  if (hasForbiddenKeys(raw)) {
    return { ok: false, reason: 'Backup contains prohibited property keys.' };
  }

  const result = BackupEnvelopeSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, reason: 'Invalid backup document.' };
  }

  return { ok: true, value: result.data.data };
}
