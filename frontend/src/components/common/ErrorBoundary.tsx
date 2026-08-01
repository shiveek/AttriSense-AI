import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React ErrorBoundary exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 shadow-md rounded-3xl p-8 max-w-lg w-full text-center space-y-6">
            <div className="h-16 w-16 bg-rose-50 border border-rose-200 rounded-3xl flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900">Application Error Encountered</h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                AttriSense AI detected an unexpected rendering state. Your data is secure.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left font-mono text-[11px] text-rose-700 max-h-32 overflow-y-auto">
                {this.state.error.message || "Unknown client-side exception"}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw size={14} />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home size={14} />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
