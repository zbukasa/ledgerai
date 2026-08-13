
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Calendar, User, ArrowLeft, 
    Download, RefreshCw, ChevronRight, Clock,
    Database, Shield, UserCheck, AlertCircle
} from 'lucide-react';
import { useActivity } from '../contexts/ActivityContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Activity } from '../types';

interface AuditLogViewProps {
    onBack: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ onBack }) => {
    const { t, language } = useLanguage();
    const { searchActivities } = useActivity();
    const { users } = useAuth();
    
    const [logs, setLogs] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        userId: '',
        type: '',
        action: '',
        dateRange: 'all'
    });
    const [showFilters, setShowFilters] = useState(false);

    const [isExporting, setIsExporting] = useState(false);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            let startDate: number | undefined;
            const now = Date.now();
            
            if (filters.dateRange === 'today') {
                startDate = new Date().setHours(0, 0, 0, 0);
            } else if (filters.dateRange === 'week') {
                startDate = now - (7 * 24 * 60 * 60 * 1000);
            } else if (filters.dateRange === 'month') {
                startDate = now - (30 * 24 * 60 * 60 * 1000);
            }

            const results = await searchActivities(searchQuery, {
                userId: filters.userId || undefined,
                type: filters.type || undefined,
                action: filters.action || undefined,
                startDate
            });
            setLogs(results);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        if (logs.length === 0) return;
        
        setIsExporting(true);
        try {
            const headers = ['Timestamp', 'User Name', 'User ID', 'Type', 'Action', 'Details'];
            
            const formatCsvField = (field: any): string => {
                if (field === null || field === undefined) return '';
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            const csvRows = [
                headers.join(','),
                ...logs.map(log => [
                    new Date(log.timestamp).toISOString(),
                    formatCsvField(log.userName),
                    log.userId,
                    log.type,
                    log.action,
                    formatCsvField(log.details)
                ].join(','))
            ];

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const dateStr = new Date().toISOString().split('T')[0];
            
            link.setAttribute('href', url);
            link.setAttribute('download', `audit_logs_${dateStr}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [searchQuery, filters]);

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(timestamp));
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return <Database size={14} className="text-emerald-500" />;
            case 'update': return <RefreshCw size={14} className="text-blue-500" />;
            case 'delete': return <AlertCircle size={14} className="text-red-500" />;
            default: return <Clock size={14} className="text-gray-400" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'transaction': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'inventory': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'production': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'business': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-primary-translucent)] px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-primary)]"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Shield size={20} className="text-[var(--accent-primary)]" />
                                {t('audit.title')}
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold">
                                {t('audit.enterpriseExclusive')}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleExport}
                        disabled={isExporting || logs.length === 0}
                        className="p-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-interactive-hover)] transition-all disabled:opacity-50"
                        title="Export CSV"
                    >
                        {isExporting ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
                    </button>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 space-y-6">
                {/* Search & Filters */}
                <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-primary-translucent)] p-4 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                            <input 
                                type="text"
                                placeholder={t('audit.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50 transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                                showFilters 
                                    ? 'bg-[var(--accent-primary)] text-white' 
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary-translucent)]'
                            }`}
                        >
                            <Filter size={18} />
                            {t('audit.filters')}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-1">{t('audit.user')}</label>
                                    <select 
                                        value={filters.userId}
                                        onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value }))}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl text-sm focus:outline-none"
                                    >
                                        <option value="">{t('audit.allUsers')}</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-1">Type</label>
                                    <select 
                                        value={filters.type}
                                        onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl text-sm focus:outline-none"
                                    >
                                        <option value="">{t('audit.allTypes')}</option>
                                        <option value="transaction">{t('common.transaction') || 'Transaction'}</option>
                                        <option value="inventory">{t('nav.inventory') || 'Inventory'}</option>
                                        <option value="production">{t('inventory.production') || 'Production'}</option>
                                        <option value="business">{t('profile.businessInfo') || 'Business'}</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-1">Action</label>
                                    <select 
                                        value={filters.action}
                                        onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl text-sm focus:outline-none"
                                    >
                                        <option value="">{t('audit.allActions')}</option>
                                        <option value="create">{t('common.add') || 'Create'}</option>
                                        <option value="update">{t('common.edit') || 'Update'}</option>
                                        <option value="delete">{t('common.delete') || 'Delete'}</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-1">Timeframe</label>
                                    <select 
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value }))}
                                        className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] rounded-xl text-sm focus:outline-none"
                                    >
                                        <option value="all">{t('audit.allTime')}</option>
                                        <option value="today">{t('audit.today')}</option>
                                        <option value="week">{t('audit.last7Days')}</option>
                                        <option value="month">{t('audit.last30Days')}</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Logs Table */}
                <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-primary-translucent)] overflow-hidden shadow-sm">
                    {/* Table Header - Desktop */}
                    <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_2fr_40px] gap-4 p-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-primary-translucent)]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('audit.timestamp')}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('audit.user')}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('audit.typeAction')}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('audit.details')}</span>
                        <span></span>
                    </div>

                    <div className="divide-y divide-[var(--border-primary-translucent)]">
                        {isLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="animate-spin text-[var(--accent-primary)]" size={32} />
                                <p className="text-sm text-[var(--text-tertiary)]">{t('audit.loading')}</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)]">
                                    <Search size={32} />
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--text-primary)]">{t('audit.noLogs')}</p>
                                    <p className="text-sm text-[var(--text-tertiary)]">{t('audit.noLogsDesc')}</p>
                                </div>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <motion.div 
                                    key={log.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_2fr_40px] gap-4 p-4 hover:bg-[var(--bg-tertiary)]/50 transition-colors group"
                                >
                                    {/* Mobile Timestamp */}
                                    <div className="md:hidden flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                                            {formatDate(log.timestamp)}
                                        </span>
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getTypeColor(log.type)}`}>
                                            {log.type}
                                        </div>
                                    </div>

                                    {/* Desktop Timestamp */}
                                    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                                        <Clock size={14} className="opacity-50" />
                                        {formatDate(log.timestamp)}
                                    </div>

                                    {/* User */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] text-xs font-bold">
                                            {log.userName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[var(--text-primary)]">{log.userName}</span>
                                            <span className="text-[10px] text-[var(--text-tertiary)]">ID: {log.userId.slice(0, 8)}</span>
                                        </div>
                                    </div>

                                    {/* Type / Action */}
                                    <div className="flex items-center gap-2">
                                        <div className={`hidden md:block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getTypeColor(log.type)}`}>
                                            {log.type}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary-translucent)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                            {getActionIcon(log.action)}
                                            {log.action}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex items-center">
                                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 md:line-clamp-1">
                                            {log.details}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="flex items-center justify-end">
                                        <button className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[var(--text-tertiary)] px-2">
                    <p className="text-xs font-medium">
                        {t('audit.showingLogs', { count: logs.length })}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <UserCheck size={14} />
                        {t('audit.complianceVerified')}
                    </div>
                </div>
            </div>
        </div>
    );
};
