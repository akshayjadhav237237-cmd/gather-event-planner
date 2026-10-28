import { lazy, Suspense, useEffect, useState } from 'react';
import { clearApiKey, hasApiKey } from './ai/apiKeyStorage';
import { ExportDialog } from './components/export';
import { Launchpad } from './components/launchpad/Launchpad';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { SkipLink } from './components/layout/SkipLink';
import { ApiKeyDialog } from './components/settings/ApiKeyDialog';
import { ResetDialog } from './components/settings/ResetDialog';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useFocusOnMount } from './hooks/useFocusOnMount';
import { usePlanStore } from './store/planStore';

const Workspace = lazy(() =>
  import('./components/layout/Workspace').then((m) => ({ default: m.Workspace }))
);

export function App() {
  const context = usePlanStore((s) => s.context);
  const clearAll = usePlanStore((s) => s.clearAll);

  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
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

  const handleOpenExport = () => setIsExportOpen(true);
  const handleCloseExport = () => setIsExportOpen(false);

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
      <div className="print:hidden">
        <SkipLink />
      </div>

      <Header
        isWorkspace={isWorkspace}
        onOpenApiKey={handleOpenApiKey}
        onOpenReset={handleOpenReset}
        onOpenExport={handleOpenExport}
        apiKeyVersion={apiKeyVersion}
      />

      <main
        id="main"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full"
      >
        {isWorkspace ? (
          <Suspense fallback={null}>
            <Workspace hasLiveKey={hasLiveKey} onOpenAiSettings={handleOpenApiKey} />
          </Suspense>
        ) : (
          <Launchpad />
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>

      <ApiKeyDialog open={isApiKeyOpen} onClose={handleCloseApiKey} onKeyChange={handleKeyChange} />

      <ResetDialog open={isResetOpen} onClose={handleCloseReset} onConfirm={handleConfirmReset} />

      <ExportDialog open={isExportOpen} onClose={handleCloseExport} />
    </div>
  );
}

export default App;
