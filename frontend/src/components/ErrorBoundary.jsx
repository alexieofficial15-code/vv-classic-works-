import React from 'react';

// Root Error Boundary to catch render crashes and prevent the white/blank screen
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#131314] text-[#e5e2e3] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-xl bg-[#1c1b1c] border border-[#584236]/40 shadow-2xl space-y-6">
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-wider text-[#ff7a1a] uppercase font-mono">
                Classic Aircooled VW Works
              </h1>
              <p className="text-sm text-[#a78b7d]">
                Something went wrong loading this page. Please reload or contact our workshop directly.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-colors cursor-pointer shadow-md"
              >
                Reload Page
              </button>

              <a
                href="tel:19452879865"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2a292b] hover:bg-[#38373a] text-[#ffb68e] border border-[#584236]/50 font-bold uppercase tracking-wider text-xs rounded-sm transition-colors text-center inline-block"
              >
                Call: +1 (945) 287-9865
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
