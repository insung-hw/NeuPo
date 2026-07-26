import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Minimal replacement for the platform's dev error boundary. The original
 * lived outside the code export, but main.tsx / App.tsx import it. It only
 * renders in development (both call sites are gated on import.meta.env.MODE),
 * so this lightweight version just catches render errors and shows them.
 */
interface Props {
  children: ReactNode;
  /** Kept for API compatibility with the original; unused here. */
  captureGlobalErrors?: boolean;
}

interface State {
  error: Error | null;
}

export default class AiroErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AiroErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: '2rem',
            fontFamily: 'ui-monospace, monospace',
            color: '#fca5a5',
            background: '#013e37',
            minHeight: '100vh',
            whiteSpace: 'pre-wrap',
          }}
        >
          <h1 style={{ color: '#ffef63', marginBottom: '1rem' }}>Something went wrong (dev)</h1>
          {String(this.state.error?.stack ?? this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}
