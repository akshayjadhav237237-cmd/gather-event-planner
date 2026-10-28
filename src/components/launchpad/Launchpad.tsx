import { useState } from 'react';
import { getDemoScenarios } from '../../data/demoScenarios';
import { useToday } from '../../hooks/useToday';
import { usePlanStore } from '../../store/planStore';
import type { EventType } from '../../types/event';
import { createDraft, type FormDraft } from '../../ui/formModel';
import { ContextForm } from '../context/ContextForm';
import { DemoScenarioButton } from './DemoScenarioButton';
import { VerticalChoiceButton } from './VerticalChoiceButton';

export function Launchpad() {
  const [step, setStep] = useState<'choose' | 'details'>('choose');
  const [selectedDraft, setSelectedDraft] = useState<FormDraft | null>(null);

  const today = useToday();
  const setContext = usePlanStore((s) => s.setContext);
  const loadScenario = usePlanStore((s) => s.loadScenario);

  const handleSelectVertical = (eventType: EventType) => {
    const draft = createDraft(eventType, today);
    setSelectedDraft(draft);
    setStep('details');
  };

  const handleBackToChoose = () => {
    setStep('choose');
    setSelectedDraft(null);
  };

  const demoScenarios = getDemoScenarios(today);

  if (step === 'details' && selectedDraft) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-ink mb-1">New celebration plan</h1>
          <p className="text-sm text-ink-soft">
            Adjust the baseline numbers or submit to start planning.
          </p>
        </div>

        <ContextForm
          initialDraft={selectedDraft}
          mode="create"
          onBack={handleBackToChoose}
          onSubmit={(ctx) => setContext(ctx)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-ink tracking-tight mb-4">
          Plan the celebration, not the spreadsheet.
        </h1>
        <p className="text-lg sm:text-xl text-ink-soft leading-relaxed mb-4">
          Turn complex budgets, multi-phase timelines, vendor checklists, and personalized ideas
          into an actionable plan.
        </p>
        <p className="text-sm text-muted">
          Designed first for cross-cultural and multi-day weddings, and built on the same engine for
          birthdays and community events.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="sr-only">Choose celebration type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <VerticalChoiceButton
            eventType="wedding"
            isFlagship
            onClick={() => handleSelectVertical('wedding')}
          />
          <VerticalChoiceButton
            eventType="birthday"
            onClick={() => handleSelectVertical('birthday')}
          />
          <VerticalChoiceButton
            eventType="community"
            onClick={() => handleSelectVertical('community')}
          />
        </div>
      </section>

      <section className="pt-8 border-t border-line">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-xl font-medium text-ink mb-1">Or explore a pre-built example</h2>
          <p className="text-xs text-muted">
            Jump straight into a complete plan with realistic budgets, timelines, and decision
            rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoScenarios.map((scenario) => (
            <DemoScenarioButton
              key={scenario.id}
              scenario={scenario}
              onClick={() => loadScenario(scenario.context)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
