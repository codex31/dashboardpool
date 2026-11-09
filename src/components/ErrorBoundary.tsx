import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('preferred_default_month_id');
    } catch {}
    this.state = { hasError: false, error: null };
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#edf3fc] flex items-center justify-center p-4">
          <div className="neo-card max-w-lg w-full p-6 text-center bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] rounded-xl">
            <div className="w-14 h-14 bg-rose-100 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600 shadow-[2px_2px_0px_0px_#0f172a]">
              <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-xl font-black text-slate-900 font-['Space_Grotesk',sans-serif] mb-2">
              Terjadi Kendala Tampilan
            </h1>
            <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
              Sistem mendeteksi error pada antarmuka: <br />
              <code className="text-xs bg-slate-100 px-2 py-1 rounded text-rose-700 font-mono mt-1 inline-block max-w-full overflow-x-auto">
                {this.state.error?.message || 'Unknown render error'}
              </code>
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
