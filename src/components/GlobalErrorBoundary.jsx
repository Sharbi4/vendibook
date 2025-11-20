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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF3F0', padding: '32px' }}>
          <div style={{ maxWidth: '520px', width: '100%', background: 'white', border: '1px solid #FFDACD', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#FF5124', marginBottom: '12px' }}>Something went wrong</h1>
            <p style={{ fontSize: '14px', color: '#343434', lineHeight: 1.5, marginBottom: '20px' }}>
              An unexpected error occurred while rendering the application. You can try again, or return to the homepage.
            </p>
            <pre style={{ background: '#FFF7F5', padding: '12px', fontSize: '12px', color: '#B24524', borderRadius: '8px', overflowX: 'auto', maxHeight: '160px', marginBottom: '20px' }}>
              {this.state.error?.message}
            </pre>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={this.handleRetry} style={{ background: '#FF5124', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
              <a href="/" style={{ background: 'white', color: '#FF5124', border: '1px solid #FF5124', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>Go Home</a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
