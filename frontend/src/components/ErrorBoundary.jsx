import React from 'react';
import { safeSession } from '../utils/safeStorage';

const CHUNK_ERROR_RE = /Loading chunk|Loading CSS chunk|dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

// Root error boundary: an uncaught render/effect error would otherwise unmount the whole
// app and leave a blank dark page. Shows a recoverable fallback instead, and silently
// reloads once when a lazy chunk fails to load (typical right after a new deploy).
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info?.componentStack);
    const message = String(error?.message || error || '');
    if (CHUNK_ERROR_RE.test(message) && !safeSession.getItem('chunk_reload_attempted')) {
      safeSession.setItem('chunk_reload_attempted', '1');
      window.location.reload();
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#131314',
          color: '#e5e2e3',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 22, margin: '0 0 12px', color: '#ff7a1a' }}>Something went wrong</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: '0 0 20px' }}>
            The page hit an unexpected problem. Reloading usually fixes it. If it keeps happening, call us and we will help
            you directly.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              minHeight: 48,
              padding: '0 24px',
              background: '#ff7a1a',
              color: '#000',
              border: 0,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              marginRight: 8
            }}
          >
            Reload page
          </button>
          <a
            href="tel:19452879865"
            style={{
              display: 'inline-block',
              minHeight: 48,
              lineHeight: '48px',
              padding: '0 24px',
              border: '1px solid #ff7a1a',
              color: '#ff7a1a',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none'
            }}
          >
            Call +1 (945) 287-9865
          </a>
        </div>
      </div>
    );
  }
}
