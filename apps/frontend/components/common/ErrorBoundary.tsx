import React from 'react';

type ErrorBoundaryProps = React.PropsWithChildren<unknown>;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error: error instanceof Error ? error : new Error('Unknown error') };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="text-text-secondary mt-2">Please refresh the page or try again later.</p>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="mt-4 p-3 rounded bg-muted text-left max-w-[80ch] overflow-auto text-sm">
              {this.state.error.message}{'\n\n'}{this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;
