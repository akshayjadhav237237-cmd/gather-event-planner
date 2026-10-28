import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTOSAVE_DEBOUNCE_MS } from '../config/constants';
import type { ContextFlag, EventContext, EventType } from '../types/event';
import {
  applyEventTypeChange,
  type FieldErrors,
  type FieldKey,
  type FormDraft,
  parseDraft,
  toggleFlag as toggleFlagModel,
  togglePriority as togglePriorityModel,
} from '../ui/formModel';
import { createId } from '../utils/id';

export interface UseContextDraftOptions {
  initialDraft: FormDraft;
  mode: 'create' | 'edit';
  existingId?: string;
  onApply?: (ctx: EventContext) => void;
}

export function useContextDraft({
  initialDraft,
  mode,
  existingId,
  onApply,
}: UseContextDraftOptions) {
  const [draft, setDraft] = useState<FormDraft>(initialDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});

  const idRef = useRef<string>(existingId ?? createId());
  const onApplyRef = useRef(onApply);
  onApplyRef.current = onApply;

  const updateField = useCallback(<K extends FieldKey>(key: K, value: FormDraft[K]) => {
    setDraft((prev) => {
      if (key === 'eventType') {
        return applyEventTypeChange(prev, value as EventType);
      }
      return { ...prev, [key]: value };
    });
    setTouched((prev) => ({ ...prev, [key]: true }));

    // Clear error for field once edited
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const togglePriority = useCallback((categoryId: string) => {
    setDraft((prev) => togglePriorityModel(prev, categoryId));
    setTouched((prev) => ({ ...prev, priorities: true }));
  }, []);

  const toggleFlag = useCallback((flag: ContextFlag) => {
    setDraft((prev) => toggleFlagModel(prev, flag));
    setTouched((prev) => ({ ...prev, flags: true }));
  }, []);

  const resetDraft = useCallback((nextDraft: FormDraft) => {
    setDraft(nextDraft);
    setErrors({});
    setTouched({});
  }, []);

  // Autosave for edit mode
  useEffect(() => {
    if (mode !== 'edit') return;

    const timer = setTimeout(() => {
      const result = parseDraft(draft, idRef.current);
      if (result.ok) {
        setErrors({});
        onApplyRef.current?.(result.value);
      } else {
        setErrors(result.errors);
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [draft, mode]);

  const submit = useCallback((): EventContext | null => {
    const result = parseDraft(draft, idRef.current);
    if (!result.ok) {
      setErrors(result.errors);

      // Mark all error fields as touched
      const allTouched: Partial<Record<FieldKey, boolean>> = {};
      (Object.keys(result.errors) as FieldKey[]).forEach((k) => {
        allTouched[k] = true;
      });
      setTouched((prev) => ({ ...prev, ...allTouched }));

      // Focus first invalid input element
      const firstErrorKey = Object.keys(result.errors)[0] as FieldKey | undefined;
      if (firstErrorKey && typeof document !== 'undefined') {
        const targetElement =
          document.getElementById(firstErrorKey) ??
          document.getElementById(`context-${firstErrorKey}`);
        targetElement?.focus();
      }

      return null;
    }

    setErrors({});
    onApplyRef.current?.(result.value);
    return result.value;
  }, [draft]);

  return {
    draft,
    errors,
    touched,
    updateField,
    togglePriority,
    toggleFlag,
    resetDraft,
    submit,
  };
}
