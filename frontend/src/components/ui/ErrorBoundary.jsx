import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-red-500/20">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Something went wrong</h1>
                    <p className="text-gray-500 max-w-md mb-8 font-medium">
                        A campus-wide glitch occurred. Don't worry, your data is safe. We've been notified and are looking into it.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                            variant="primary" 
                            className="gap-2 px-8 py-3 rounded-2xl"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh Page
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="gap-2 px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10"
                            onClick={() => window.location.href = '/'}
                        >
                            <Home className="w-4 h-4" />
                            Back to Campus
                        </Button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-12 p-4 bg-dark-800 rounded-2xl border border-white/5 text-left max-w-2xl w-full">
                            <p className="text-red-400 font-mono text-xs overflow-auto">
                                {this.state.error?.toString()}
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
