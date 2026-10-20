import { DECISION_RULES_CORE, type DecisionRule } from '../data/decisionRulesCore';
import { DECISION_RULES_CONTEXT } from '../data/decisionRulesContext';
import type { ContextSignals, DecisionResult } from '../types/engine';
import type { ContextAdaptation, EventContext, Severity } from '../types/event';

export const ALL_DECISION_RULES: readonly DecisionRule[] = [
  ...DECISION_RULES_CORE,
  ...DECISION_RULES_CONTEXT,
];

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/** Evaluates event context against contextual rules to generate adaptations and contingency deltas. */
export function evaluateContext(ctx: EventContext, signals: ContextSignals): DecisionResult {
  const activeRules: DecisionRule[] = [];
  const adaptations: ContextAdaptation[] = [];

  for (const rule of ALL_DECISION_RULES) {
    if (rule.trigger(ctx, signals)) {
      activeRules.push(rule);
      const severity =
        typeof rule.severity === 'function' ? rule.severity(ctx, signals) : rule.severity;
      adaptations.push({
        id: rule.id,
        ruleId: rule.id,
        triggerSignal: rule.signalLabel,
        severity,
        explanation: rule.explain(ctx, signals),
        targetModule: rule.targetModule,
      });
    }
  }

  const sortedAdaptations = adaptations
    .map((adaptation, originalIndex) => ({ adaptation, originalIndex }))
    .sort((a, b) => {
      const rankDiff = SEVERITY_RANK[a.adaptation.severity] - SEVERITY_RANK[b.adaptation.severity];
      return rankDiff !== 0 ? rankDiff : a.originalIndex - b.originalIndex;
    })
    .map((item) => item.adaptation);

  const activeRuleIds = sortedAdaptations.map((a) => a.ruleId);
  const totalDelta = activeRules.reduce((sum, r) => sum + (r.contingencyDelta ?? 0), 0);
  const contingencyDelta = Math.round(totalDelta * 10000) / 10000;

  return {
    adaptations: sortedAdaptations,
    activeRuleIds,
    contingencyDelta,
  };
}
