import { useCallback, useEffect, useRef, useState } from 'react';
import {
  generateIdeas,
  regenerateIdeaSection,
  type IdeaSection,
} from '../ai';
import { usePlanStore } from '../store/planStore';
import type { PlanBundle } from '../types/engine';
import type { PersonalizedIdeas } from '../types/event';
import {
  decideIdeasAction,
  describeResult,
  ideasFingerprint,
  type IdeasResultDescription,
} from '../ui/ideasView';
import { getSession, setSession } from './ideasSession';

export interface UseIdeasReturn {
  ideas: PersonalizedIdeas | null;
  status: 'idle' | 'loading' | 'ready';
  info: IdeasResultDescription;
  notesDropped: boolean;
  isStale: boolean;
  refreshAll: () => Promise<void>;
  regenerate: (section: IdeaSection) => Promise<void>;
}

export function useIdeas(bundle: PlanBundle, hasLiveKey: boolean): UseIdeasReturn {
  const ideas = usePlanStore((s) => s.ideas);
  const setIdeas = usePlanStore((s) => s.setIdeas);

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>(
    ideas ? 'ready' : 'loading'
  );
  const [isStale, setIsStale] = useState(false);
  const [notesDropped, setNotesDropped] = useState(false);
  const [info, setInfo] = useState<IdeasResultDescription>(() =>
    describeResult(ideas?.source ?? 'local', null, null)
  );

  const requestIdRef = useRef(0);
  const currentFingerprint = ideasFingerprint(bundle.context, bundle.signals);

  useEffect(() => {
    let isMounted = true;
    const session = getSession(bundle.context.id);
    const knownFingerprint = session ? session.fingerprint : null;
    const action = decideIdeasAction({
      hasIdeas: ideas !== null,
      knownFingerprint,
      currentFingerprint,
      hasLiveKey,
    });

    if (action === 'none') {
      setIsStale(false);
      setStatus('ready');
      return;
    }

    if (action === 'record_baseline') {
      setSession(bundle.context.id, {
        fingerprint: currentFingerprint,
        variant: session?.variant ?? 0,
      });
      setIsStale(false);
      setStatus('ready');
      return;
    }

    if (action === 'mark_stale') {
      setIsStale(true);
      return;
    }

    if (action === 'generate' || action === 'regenerate_local') {
      const currentReq = ++requestIdRef.current;
      setStatus('loading');
      const variant = session?.variant ?? 0;

      void generateIdeas(bundle, {
        notes: bundle.context.userNotes,
        variant,
      })
        .then((result) => {
          if (!isMounted || currentReq !== requestIdRef.current) return;
          setIdeas(result.ideas);
          setSession(bundle.context.id, { fingerprint: currentFingerprint, variant });
          setInfo(describeResult(result.ideas.source, result.mode, result.reason));
          setNotesDropped(result.notesDropped);
          setIsStale(false);
          setStatus('ready');
        })
        .catch(() => {
          if (isMounted && currentReq === requestIdRef.current) {
            setStatus('ready');
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [
    bundle,
    bundle.context.id,
    bundle.context.userNotes,
    currentFingerprint,
    hasLiveKey,
    ideas,
    setIdeas,
  ]);

  const refreshAll = useCallback(async () => {
    const session = getSession(bundle.context.id);
    const nextVariant = (session?.variant ?? 0) + 1;
    const currentReq = ++requestIdRef.current;
    setStatus('loading');

    try {
      const result = await generateIdeas(bundle, {
        notes: bundle.context.userNotes,
        variant: nextVariant,
      });
      if (currentReq !== requestIdRef.current) return;
      setIdeas(result.ideas);
      setSession(bundle.context.id, {
        fingerprint: currentFingerprint,
        variant: nextVariant,
      });
      setInfo(describeResult(result.ideas.source, result.mode, result.reason));
      setNotesDropped(result.notesDropped);
      setIsStale(false);
      setStatus('ready');
    } catch {
      if (currentReq === requestIdRef.current) {
        setStatus('ready');
      }
    }
  }, [bundle, currentFingerprint, setIdeas]);

  const regenerate = useCallback(
    async (section: IdeaSection) => {
      if (!ideas) return;
      const session = getSession(bundle.context.id);
      const nextVariant = (session?.variant ?? 0) + 1;
      const currentReq = ++requestIdRef.current;
      setStatus('loading');

      try {
        const result = await regenerateIdeaSection(ideas, section, bundle, {
          notes: bundle.context.userNotes,
          variant: nextVariant,
        });
        if (currentReq !== requestIdRef.current) return;
        setIdeas(result.ideas);
        setSession(bundle.context.id, {
          fingerprint: currentFingerprint,
          variant: nextVariant,
        });
        setInfo(describeResult(result.ideas.source, result.mode, result.reason));
        setNotesDropped(result.notesDropped);
        setIsStale(false);
        setStatus('ready');
      } catch {
        if (currentReq === requestIdRef.current) {
          setStatus('ready');
        }
      }
    },
    [bundle, currentFingerprint, ideas, setIdeas]
  );

  return {
    ideas,
    status,
    info,
    notesDropped,
    isStale,
    refreshAll,
    regenerate,
  };
}
