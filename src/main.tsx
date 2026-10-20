import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/dm-sans';
import { clearApiKey } from './ai';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { usePlanStore } from './store/planStore';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary
      onReset={() => {
        usePlanStore.getState().clearAll();
        clearApiKey();
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
