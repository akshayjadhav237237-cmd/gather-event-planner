import { describe, expect, it } from 'vitest';
import { getTaskTemplates } from '../src/data/tasks';
import { RULE_IDS, type RuleId } from '../src/domain/ruleIds';
import type { TaskTemplate } from '../src/types/engine';

describe('Task Catalog Quality and Invariant Checks', () => {
  const catalog = getTaskTemplates();
  const catalogMap = new Map<string, TaskTemplate>(catalog.map((t) => [t.id, t]));

  it('maintains globally unique task IDs across the entire catalog', () => {
    const ids = catalog.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('guarantees that every declared dependency exists in the catalog', () => {
    for (const task of catalog) {
      for (const depId of task.dependsOn) {
        expect(catalogMap.has(depId)).toBe(true);
      }
    }
  });

  it('contains zero dependency cycles and forms a strictly acyclic DAG', () => {
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    for (const task of catalog) {
      inDegree.set(task.id, task.dependsOn.length);
      for (const depId of task.dependsOn) {
        const list = dependents.get(depId) ?? [];
        list.push(task.id);
        dependents.set(depId, list);
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    let processedCount = 0;
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      processedCount++;
      const deps = dependents.get(current) ?? [];
      for (const dependentId of deps) {
        const currentDeg = inDegree.get(dependentId)! - 1;
        inDegree.set(dependentId, currentDeg);
        if (currentDeg === 0) {
          queue.push(dependentId);
        }
      }
    }

    expect(processedCount).toBe(catalog.length);
  });

  it('ensures non-optional tasks never depend on optional tasks', () => {
    for (const task of catalog) {
      if (!task.optional) {
        for (const depId of task.dependsOn) {
          const dep = catalogMap.get(depId);
          expect(dep).toBeDefined();
          expect(dep?.optional).toBe(false);
        }
      }
    }
  });

  it('ensures daysBefore never exceeds the maximum planning horizon of served event types', () => {
    const maxHorizons: Record<string, number> = {
      wedding: 450,
      birthday: 56,
      community: 540,
    };

    for (const task of catalog) {
      for (const eventType of task.eventTypes) {
        const maxHorizon = maxHorizons[eventType];
        expect(task.daysBefore).toBeLessThanOrEqual(maxHorizon);
      }
    }
  });

  it('satisfies minimum task catalog quantity thresholds across event formats', () => {
    const weddingUniversal = catalog.filter(
      (t) => t.eventTypes.includes('wedding') && !t.subFormats && !t.injectedBy
    );
    expect(weddingUniversal.length).toBeGreaterThanOrEqual(22);

    const weddingMultiday = catalog.filter(
      (t) => t.eventTypes.includes('wedding') && t.subFormats?.includes('indian_multiday')
    );
    expect(weddingMultiday.length).toBeGreaterThanOrEqual(6);

    const birthdayCore = catalog.filter((t) => t.eventTypes.includes('birthday') && !t.injectedBy);
    expect(birthdayCore.length).toBeGreaterThanOrEqual(12);

    const communityCore = catalog.filter(
      (t) => t.eventTypes.includes('community') && !t.injectedBy
    );
    expect(communityCore.length).toBeGreaterThanOrEqual(18);
  });

  it('validates all injectedBy values against rule IDs and covers all required rules', () => {
    const validRuleIds = new Set<string>(Object.values(RULE_IDS));
    const activeInjectedRules = new Set<string>();

    for (const task of catalog) {
      if (task.injectedBy) {
        expect(validRuleIds.has(task.injectedBy)).toBe(true);
        activeInjectedRules.add(task.injectedBy);
      }
    }

    const requiredRules: RuleId[] = [
      RULE_IDS.SHORT_NOTICE,
      RULE_IDS.YOUNG_KIDS,
      RULE_IDS.SCHOOL_KIDS,
      RULE_IDS.OUTDOOR,
      RULE_IDS.HOT_OR_WET_SEASON,
      RULE_IDS.ALLERGY_ALERT,
      RULE_IDS.DIETARY_CULTURAL,
      RULE_IDS.ACCESSIBILITY,
      RULE_IDS.MULTI_CEREMONY,
      RULE_IDS.SURPRISE_PARTY,
      RULE_IDS.COMMUNITY_PUBLIC_EVENT,
      RULE_IDS.LARGE_CROWD,
      RULE_IDS.SPONSORSHIP,
      RULE_IDS.OPEN_BAR,
      RULE_IDS.AMPLIFIED_MUSIC_RESIDENTIAL,
    ];

    for (const rule of requiredRules) {
      expect(activeInjectedRules.has(rule)).toBe(true);
    }
  });

  it('contains zero URLs, zero phone number digits, and zero forbidden regulatory terms', () => {
    const urlPattern = /https?:\/\/|www\.|\.com\b|\.org\b|\.net\b/i;
    const phonePattern = /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\b\d{10}\b/;
    const forbiddenStatutes = /\b(ADA|CPSC|AAP|FDA|OSHA|WWCC|Blue Card)\b/i;

    for (const task of catalog) {
      const textFields = [task.title, task.phase, task.rationale];
      for (const text of textFields) {
        expect(urlPattern.test(text)).toBe(false);
        expect(phonePattern.test(text)).toBe(false);
        expect(forbiddenStatutes.test(text)).toBe(false);
      }
    }
  });
});
