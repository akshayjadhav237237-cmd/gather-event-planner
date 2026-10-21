import { describe, expect, it, vi } from 'vitest';
import { getDemoScenarios } from '../../src/data/demoScenarios';
import { buildBackupJson, parseBackup } from '../../src/export/backup';
import type { BackupPayload } from '../../src/export/backupTypes';

function createMockPayload(scenarioIndex = 0): BackupPayload {
  const scenario = getDemoScenarios('2027-01-01')[scenarioIndex]!;
  return {
    context: scenario.context,
    taskCompletion: { 'task-1': true, 'task-2': false },
    actualSpend: { venue: 5000, catering: 3000 },
    vendorQuotes: [
      {
        id: 'q1',
        categoryId: 'venue',
        vendorName: 'Grand Hall',
        baseQuote: 5000,
        serviceAndTaxPct: 15,
        depositPaid: 1000,
        contractSigned: true,
        insuranceVerified: true,
        backupPlan: 'None',
      },
    ],
    ideas: null,
  };
}

describe('backup serialization and parsing', () => {
  it('serializes to formatted JSON with gather metadata', () => {
    const payload = createMockPayload(0);
    const json = buildBackupJson(payload, '2027-01-01T12:00:00.000Z');

    expect(json).toContain('"app": "gather"');
    expect(json).toContain('"schemaVersion": 1');
    expect(json).toContain('"exportedAt": "2027-01-01T12:00:00.000Z"');
  });

  it('performs lossless round-trip parsing for all 4 demo scenarios', () => {
    for (let i = 0; i < 4; i++) {
      const payload = createMockPayload(i);
      const json = buildBackupJson(payload, '2027-01-01T12:00:00.000Z');
      const result = parseBackup(json);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(payload);
      }
    }
  });

  it('rejects payload exceeding maximum size limit', () => {
    const huge = 'a'.repeat(1_000_001);
    const result = parseBackup(huge);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('File exceeds maximum allowed backup size.');
    }
  });

  it('rejects invalid JSON syntax gracefully without throwing', () => {
    const result = parseBackup('{ invalid json }');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('Invalid JSON format.');
    }
  });

  it('blocks prototype pollution keys in JSON content', () => {
    const protoPayload = '{"app":"gather","schemaVersion":1,"__proto__":{}}';
    const result1 = parseBackup(protoPayload);
    expect(result1.ok).toBe(false);
    if (!result1.ok) {
      expect(result1.reason).toBe('Backup contains prohibited property keys.');
    }

    const constructorPayload = '{"app":"gather","schemaVersion":1,"constructor":{}}';
    const result2 = parseBackup(constructorPayload);
    expect(result2.ok).toBe(false);
    if (!result2.ok) {
      expect(result2.reason).toBe('Backup contains prohibited property keys.');
    }

    const prototypePayload = '{"app":"gather","schemaVersion":1,"prototype":{}}';
    const result3 = parseBackup(prototypePayload);
    expect(result3.ok).toBe(false);
    if (!result3.ok) {
      expect(result3.reason).toBe('Backup contains prohibited property keys.');
    }
  });

  it('rejects wrong application identifier or schema version', () => {
    const payload = createMockPayload(0);
    const raw = JSON.parse(buildBackupJson(payload, '2027-01-01'));
    raw.app = 'not-gather';
    const res1 = parseBackup(JSON.stringify(raw));
    expect(res1.ok).toBe(false);

    raw.app = 'gather';
    raw.schemaVersion = 2;
    const res2 = parseBackup(JSON.stringify(raw));
    expect(res2.ok).toBe(false);
  });

  it('rejects payloads with unauthorized extra properties', () => {
    const payload = createMockPayload(0);
    const raw = JSON.parse(buildBackupJson(payload, '2027-01-01'));
    raw.unauthorizedKey = 'attack';
    const res = parseBackup(JSON.stringify(raw));
    expect(res.ok).toBe(false);
  });

  it('rejects records exceeding maximum count constraints', () => {
    const payload = createMockPayload(0);
    for (let i = 0; i < 505; i++) {
      payload.taskCompletion[`task-${i}`] = true;
    }
    const json = buildBackupJson(payload, '2027-01-01');
    const result = parseBackup(json);
    expect(result.ok).toBe(false);
  });

  it('rejects negative spend amounts in actualSpend', () => {
    const payload = createMockPayload(0);
    payload.actualSpend['venue'] = -500;
    const json = buildBackupJson(payload, '2027-01-01');
    const result = parseBackup(json);
    expect(result.ok).toBe(false);
  });

  it('restores backup with forbidden words in vendor name and notes as plain text', () => {
    const payload = createMockPayload(0);
    payload.vendorQuotes[0]!.vendorName = 'Prototype Constructor Events';
    payload.context.userNotes = 'Check __proto__ and constructor in plain text.';
    const json = buildBackupJson(payload, '2027-01-01T12:00:00.000Z');
    const result = parseBackup(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(payload);
    }
  });

  it('rejects payload with an own key __proto__ inside taskCompletion', () => {
    const payload = createMockPayload(0);
    const json = buildBackupJson(payload, '2027-01-01');
    const tainted = json.replace(
      '"taskCompletion": {',
      '"taskCompletion": {\n      "__proto__": true,'
    );
    const result = parseBackup(tainted);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('Backup contains prohibited property keys.');
    }
  });

  it('rejects payload with an own key constructor inside actualSpend', () => {
    const payload = createMockPayload(0);
    const json = buildBackupJson(payload, '2027-01-01');
    const tainted = json.replace(
      '"actualSpend": {',
      '"actualSpend": {\n      "constructor": 500,'
    );
    const result = parseBackup(tainted);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('Backup contains prohibited property keys.');
    }
  });

  it('rejects oversize input without calling JSON.parse', () => {
    const parseSpy = vi.spyOn(JSON, 'parse');
    const huge = 'a'.repeat(1_000_001);
    const result = parseBackup(huge);
    expect(result.ok).toBe(false);
    expect(parseSpy).not.toHaveBeenCalled();
    parseSpy.mockRestore();
  });

  it('ensures failure reason never echoes content from an invalid file', () => {
    const payload = createMockPayload(0);
    const canary = 'UNIQUE_CANARY_INJECTION_STRING_12345';
    payload.context.title = canary;
    const raw = JSON.parse(buildBackupJson(payload, '2027-01-01'));
    raw.data.context.subFormat = 'invalid-subformat';
    const json = JSON.stringify(raw);
    const result = parseBackup(json);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason.includes(canary)).toBe(false);
      expect(result.reason.includes('invalid-subformat')).toBe(false);
    }
  });

  it('rejects a backup with more than 200 vendor quotes', () => {
    const payload = createMockPayload(0);
    const quote = payload.vendorQuotes[0]!;
    payload.vendorQuotes = Array.from({ length: 201 }, (_, i) => ({
      ...quote,
      id: `q-${i}`,
    }));
    const json = buildBackupJson(payload, '2027-01-01');
    const result = parseBackup(json);
    expect(result.ok).toBe(false);
  });
});
