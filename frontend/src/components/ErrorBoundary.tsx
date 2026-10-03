import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enterprise React Error Boundary Component.
 * Catches unhandled JavaScript runtime errors in child component rendering,
 * logs full error stack traces, and displays a graceful fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to diagnostic trace and error tracking metrics
    console.error('[DocAuthority ErrorBoundary Caught Exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle size={32} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Application Error Caught</h2>
              <p className="text-sm text-slate-500 mt-2">
                An unexpected runtime error occurred in the component tree. The Error Boundary prevented an unhandled application crash.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 text-slate-200 text-xs text-left p-4 rounded-lg overflow-x-auto font-mono max-h-40 border border-slate-800">
                <p className="font-bold text-red-400 mb-1">{this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors space-x-2"
            >
              <RefreshCw size={18} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
