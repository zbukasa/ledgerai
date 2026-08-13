import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HealthStatus {
    status: string;
    database: string;
    engine: string;
    timestamp: string;
    details?: {
        userCount: number;
    };
    error?: string;
    hint?: string;
}

const DatabaseStatus: React.FC = () => {
    const { t } = useLanguage();
    const [status, setStatus] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hint, setHint] = useState<string | null>(null);

    const checkHealth = async () => {
        setLoading(true);
        setError(null);
        setHint(null);
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            setStatus(data);
            if (data.status === 'error') {
                setError(data.error || 'Database connection failed');
                setHint(data.hint || null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch health status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    return (
        <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary-translucent)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                        <Database size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Database Status</h3>
                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest font-bold">System Connectivity</p>
                    </div>
                </div>
                <button 
                    onClick={checkHealth}
                    disabled={loading}
                    className={`p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-all ${loading ? 'animate-spin' : ''}`}
                    title="Refresh Status"
                >
                    <RefreshCw size={18} className="text-[var(--text-secondary)]" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary-translucent)]">
                    <div className={`p-2 rounded-full ${status?.database === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {status?.database === 'connected' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Connection</p>
                        <p className="font-bold text-[var(--text-primary)] capitalize">{status?.database || 'Checking...'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary-translucent)]">
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Engine</p>
                        <p className="font-bold text-[var(--text-primary)] uppercase">{status?.engine || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    <p className="font-bold mb-1 flex items-center gap-2">
                        <XCircle size={14} />
                        Connection Error
                    </p>
                    <p className="opacity-80 break-words">{error}</p>
                    {hint && (
                        <div className="mt-3 pt-3 border-t border-red-500/20">
                            <p className="text-xs font-bold uppercase tracking-widest mb-1">Recommendation</p>
                            <p className="text-[var(--text-primary)]">{hint}</p>
                        </div>
                    )}
                </div>
            )}

            {status?.details && (
                <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-tertiary)] font-medium">
                    <span>Active Users in DB: <span className="text-[var(--text-primary)] font-bold">{status.details.userCount}</span></span>
                    <span>Last Checked: {new Date(status.timestamp).toLocaleTimeString()}</span>
                </div>
            )}
        </div>
    );
};

export default DatabaseStatus;
