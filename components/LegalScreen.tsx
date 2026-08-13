
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, 
    FileText, 
    Lock, 
    ArrowLeft, 
    ChevronRight,
    Download,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { 
    PRIVACY_POLICY, 
    PRIVACY_POLICY_FR,
    PRIVACY_POLICY_ES,
    PRIVACY_POLICY_PT,
    PRIVACY_POLICY_HI,
    PRIVACY_POLICY_AR,
    TERMS_OF_SERVICE, 
    TERMS_OF_SERVICE_FR,
    TERMS_OF_SERVICE_ES,
    TERMS_OF_SERVICE_PT,
    TERMS_OF_SERVICE_HI,
    TERMS_OF_SERVICE_AR,
    DATA_RETENTION_POLICY, 
    DATA_RETENTION_POLICY_FR,
    DATA_RETENTION_POLICY_ES,
    DATA_RETENTION_POLICY_PT,
    DATA_RETENTION_POLICY_HI,
    DATA_RETENTION_POLICY_AR,
    LEGAL_CONFIG 
} from '../constants/LegalConstants';
import { useLanguage } from '../contexts/LanguageContext';

type PolicyTab = 'privacy' | 'terms' | 'security';

interface LegalScreenProps {
    onBack?: () => void;
}

const LegalScreen: React.FC<LegalScreenProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<PolicyTab>('privacy');
    const { t, language } = useLanguage();

    const tabs = [
        { id: 'privacy' as PolicyTab, label: t('legal.privacy'), icon: Shield },
        { id: 'terms' as PolicyTab, label: t('legal.terms'), icon: FileText },
        { id: 'security' as PolicyTab, label: t('legal.security'), icon: Lock },
    ];

    const getContent = () => {
        switch (activeTab) {
            case 'privacy':
                if (language === 'fr') return PRIVACY_POLICY_FR;
                if (language === 'es') return PRIVACY_POLICY_ES;
                if (language === 'pt') return PRIVACY_POLICY_PT;
                if (language === 'hi') return PRIVACY_POLICY_HI;
                if (language === 'ar') return PRIVACY_POLICY_AR;
                return PRIVACY_POLICY;
            case 'terms':
                if (language === 'fr') return TERMS_OF_SERVICE_FR;
                if (language === 'es') return TERMS_OF_SERVICE_ES;
                if (language === 'pt') return TERMS_OF_SERVICE_PT;
                if (language === 'hi') return TERMS_OF_SERVICE_HI;
                if (language === 'ar') return TERMS_OF_SERVICE_AR;
                return TERMS_OF_SERVICE;
            case 'security':
                if (language === 'fr') return DATA_RETENTION_POLICY_FR;
                if (language === 'es') return DATA_RETENTION_POLICY_ES;
                if (language === 'pt') return DATA_RETENTION_POLICY_PT;
                if (language === 'hi') return DATA_RETENTION_POLICY_HI;
                if (language === 'ar') return DATA_RETENTION_POLICY_AR;
                return DATA_RETENTION_POLICY;
            default:
                if (language === 'fr') return PRIVACY_POLICY_FR;
                if (language === 'es') return PRIVACY_POLICY_ES;
                if (language === 'pt') return PRIVACY_POLICY_PT;
                if (language === 'hi') return PRIVACY_POLICY_HI;
                if (language === 'ar') return PRIVACY_POLICY_AR;
                return PRIVACY_POLICY;
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const content = getContent();
        const title = tabs.find(t => t.id === activeTab)?.label || 'Policy';
        
        // PDF Styling
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(title, 20, 25);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Last Updated: ${LEGAL_CONFIG.LAST_UPDATED}`, 20, 35);
        
        doc.setDrawColor(200);
        doc.line(20, 40, 190, 40);
        
        doc.setFontSize(11);
        doc.setTextColor(0);
        
        // Clean markdown for PDF
        const cleanContent = content
            .replace(/#+\s/g, '') // Remove headers
            .replace(/\*\*/g, '') // Remove bold
            .replace(/\n\n/g, '\n \n'); // Preserve some spacing
            
        const splitText = doc.splitTextToSize(cleanContent, 170);
        
        let cursorY = 50;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        
        splitText.forEach((line: string) => {
            if (cursorY > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
            }
            doc.text(line, margin, cursorY);
            cursorY += 6;
        });
        
        doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-primary-translucent)]">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button 
                                onClick={onBack}
                                className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h1 className="text-xl font-bold tracking-tight">{t('legal.title')}</h1>
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">
                        {t('legal.lastUpdated')}: {LEGAL_CONFIG.LAST_UPDATED}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <aside className="md:col-span-1 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                        isActive 
                                        ? 'bg-[var(--accent-primary)] text-[var(--text-contrast)] shadow-lg shadow-[var(--accent-primary-shadow)]' 
                                        : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                                </button>
                            );
                        })}

                        <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary-translucent)]">
                            <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">{t('legal.complianceStatus')}</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
                                    <CheckCircle2 size={14} />
                                    {t('legal.plaidCompliant')}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
                                    <CheckCircle2 size={14} />
                                    {t('legal.gdprReady')}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
                                    <CheckCircle2 size={14} />
                                    {t('legal.encrypted')}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="md:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] rounded-3xl p-8 shadow-xl"
                            >
                                <div className="prose prose-invert max-w-none prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)] prose-li:text-[var(--text-secondary)]">
                                    <ReactMarkdown>{getContent()}</ReactMarkdown>
                                </div>

                                <div className="mt-12 pt-8 border-t border-[var(--border-primary-translucent)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <p className="text-xs text-[var(--text-tertiary)]">
                                        {t('legal.physicalCopy', { email: 'tradelab.mantis@gmail.com' })}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={handleDownloadPDF}
                                            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] rounded-lg text-xs font-bold text-[var(--text-primary)] transition-colors border border-[var(--border-primary-translucent)]"
                                        >
                                            <Download size={14} />
                                            {t('legal.downloadPdf')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LegalScreen;
