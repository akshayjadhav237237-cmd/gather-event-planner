import { useEffect, useState } from 'react';
import { clearApiKey, hasApiKey } from './ai';
import { Launchpad } from './components/launchpad/Launchpad';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { SkipLink } from './components/layout/SkipLink';
import { Workspace } from './components/layout/Workspace';
import { ApiKeyDialog } from './components/settings/ApiKeyDialog';
import { ResetDialog } from './components/settings/ResetDialog';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useFocusOnMount } from './hooks/useFocusOnMount';
import { usePlan } from './hooks/usePlan';
import { usePlanStore } from './store/planStore';

export function App() {
  const { context } = usePlan();
  const clearAll = usePlanStore((s) => s.clearAll);

  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [apiKeyVersion, setApiKeyVersion] = useState(0);
  const [hasLiveKey, setHasLiveKey] = useState(() => hasApiKey());

  useEffect(() => {
    setHasLiveKey(hasApiKey());
  }, [apiKeyVersion]);

  const isWorkspace = Boolean(context);

  useDocumentTitle(context?.title ?? null);
  useFocusOnMount(context ? context.id : 'launchpad');

  const handleOpenApiKey = () => setIsApiKeyOpen(true);
  const handleCloseApiKey = () => setIsApiKeyOpen(false);

  const handleOpenReset = () => setIsResetOpen(true);
  const handleCloseReset = () => setIsResetOpen(false);

  const handleKeyChange = () => {
    setApiKeyVersion((v) => v + 1);
  };

  const handleConfirmReset = () => {
    clearAll();
    clearApiKey();
    setApiKeyVersion((v) => v + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent-soft selection:text-ink">
      <SkipLink />

      <Header
        isWorkspace={isWorkspace}
        onOpenApiKey={handleOpenApiKey}
        onOpenReset={handleOpenReset}
        apiKeyVersion={apiKeyVersion}
      />

      <main id="main" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {isWorkspace ? (
          <Workspace
            hasLiveKey={hasLiveKey}
            onOpenAiSettings={handleOpenApiKey}
          />
        ) : (
          <Launchpad />
        )}
      </main>

      <Footer />

      <ApiKeyDialog
        open={isApiKeyOpen}
        onClose={handleCloseApiKey}
        onKeyChange={handleKeyChange}
      />

      <ResetDialog
        open={isResetOpen}
        onClose={handleCloseReset}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}

export default App;
