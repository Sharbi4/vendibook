import React from 'react';

// Simple global error boundary for catching render errors.
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Future: send to logging service
    console.error('[GlobalErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-orange/10 px-8 py-12">
          <div className="w-full max-w-xl rounded-3xl border border-orange/25 bg-white p-10 shadow-brand-soft">
            <h1 className="text-2xl font-bold text-orange">Something went wrong</h1>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/80">
              An unexpected error occurred while rendering the application. You can try again, or return to the homepage.
            </p>
            <pre className="mt-5 max-h-56 overflow-x-auto rounded-2xl bg-orange/10 p-4 text-xs text-orange">
              {this.state.error?.message}
            </pre>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={this.handleRetry}
                className="rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold"
              >
                Retry
              </button>
              <a
                href="/"
                className="rounded-full border border-charcoal/15 px-5 py-3 text-sm font-semibold text-orange transition hover:border-orange hover:text-gold"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
