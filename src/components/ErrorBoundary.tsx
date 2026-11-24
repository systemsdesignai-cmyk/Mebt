import React from 'react';
import { storageAdapter } from '../services/storageAdapter';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected interface error occurred.',
    };
  }

  handleRecover = () => {
    this.setState({ hasError: false, message: '' });
  };

  handleResetDemo = () => {
    storageAdapter.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F8FF] dark:bg-[#081224] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-[#0F1D36] rounded-3xl border border-[#DCE6F7] dark:border-[#1E3254] p-6 space-y-4">
            <h1 className="font-heading text-xl font-bold text-[#09234F] dark:text-[#F1F5FF]">
              Something interrupted MEBT
            </h1>
            <p className="text-sm text-[#4A5D7A] dark:text-[#A9B9D4] leading-relaxed">
              We caught a local display error so your session does not crash. You can try returning
              to the screen or resetting the fictional demonstration data.
            </p>
            <p className="text-xs text-[#4A5D7A] dark:text-[#A9B9D4] bg-[#F5F8FF] dark:bg-[#132544] rounded-xl p-3 border border-[#DCE6F7] dark:border-[#1E3254]">
              {this.state.message}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRecover}
                className="min-h-[44px] flex-1 rounded-xl bg-[#075DEB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0547B8] transition-colors"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={this.handleResetDemo}
                className="min-h-[44px] flex-1 rounded-xl border border-[#DCE6F7] dark:border-[#1E3254] bg-white dark:bg-[#132544] px-4 py-2.5 text-sm font-semibold text-[#09234F] dark:text-[#F1F5FF] hover:bg-[#F5F8FF] dark:hover:bg-[#1B335C] transition-colors"
              >
                Reset demo data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
