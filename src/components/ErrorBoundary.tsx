import { Component, type ReactNode } from 'react';
import { Button } from './ui/Button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(): void {
    // Intentionally silent per zero logging policy
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleReset = (): void => {
    this.props.onReset();
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-bg text-ink flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-line rounded-card p-8 shadow-sm flex flex-col gap-4 text-center items-center">
            <h1 className="font-serif text-3xl text-ink">
              Something went wrong displaying this page.
            </h1>
            <p className="text-sm text-ink-soft leading-relaxed">
              An unexpected error occurred while rendering the workspace.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-4 justify-center">
              <Button
                variant="secondary"
                onClick={this.handleReload}
                className="w-full sm:w-auto"
              >
                Reload page
              </Button>
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                Clear saved data and restart
              </Button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
