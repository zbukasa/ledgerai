
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    FileText, 
    Download, 
    Mail, 
    MessageSquare, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight,
    FileSpreadsheet,
    Share2,
    Info,
    RefreshCw
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, isValid, startOfYear } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNotification } from '../contexts/NotificationContext';
import { db } from '../services/syncService';
import { useLiveQuery } from 'dexie-react-hooks';
import { Transaction, Trip, ProductionBatch } from '../types';
import { convertDistance, formatDistance } from '../utils/helpers';

const ReportsView: React.FC = () => {
    const { currentUser, business, activeBusinessId, hasFeature } = useAuth();
    const { t } = useLanguage();
    const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
    const { addToast } = useNotification();

    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });

    const [includeSections, setIncludeSections] = useState({
        expenses: true,
        vehicle: true,
        inventory: true,
        analytics: true
    });

    const [activePeriod, setActivePeriod] = useState<'7d' | 'mtd' | 'lastMonth' | 'ytd' | 'custom'>('mtd');
    const [isGenerating, setIsGenerating] = useState(false);

    // Data fetching. Reports reflect the books, so archived transactions are excluded.
    // In personal mode we also scope to the current user so a shared device doesn't mix
    // one person's personal ledger into another's report.
    const rawTransactions = useLiveQuery(() =>
        db.transactions
            .where('businessId')
            .equals(activeBusinessId || 'personal')
            .toArray()
    , [activeBusinessId]) || [];

    const transactions = useMemo(() => {
        const isPersonal = (activeBusinessId || 'personal') === 'personal';
        return rawTransactions.filter(tx => {
            if (tx.isArchived) return false;
            if (isPersonal && currentUser?.id && (tx as any).userId && (tx as any).userId !== currentUser.id) return false;
            return true;
        });
    }, [rawTransactions, activeBusinessId, currentUser?.id]);

    const trips = useLiveQuery(() => 
        db.trips
            .where('businessId')
            .equals(activeBusinessId || 'personal')
            .toArray()
    ) || [];

    const batches = useLiveQuery(() => 
        db.productionBatches
            .where('businessId')
            .equals(activeBusinessId || 'personal')
            .toArray()
    ) || [];

    const inventoryItems = useLiveQuery(() => 
        db.inventoryItems
            .where('businessId')
            .equals(activeBusinessId || 'personal')
            .toArray()
    ) || [];

    const products = useLiveQuery(() => 
        db.products
            .where('businessId')
            .equals(activeBusinessId || 'personal')
            .toArray()
    ) || [];

    const filteredData = useMemo(() => {
        const interval = { start: dateRange.start, end: dateRange.end };
        
        const filterByDate = (date: any) => {
            try {
                const d = new Date(date);
                if (isNaN(d.getTime())) return false;
                return isWithinInterval(d, interval);
            } catch (e) {
                return false;
            }
        };

        return {
            transactions: transactions.filter(tx => filterByDate(tx.date) && (!tx.usageType || tx.usageType === 'none')),
            trips: trips.filter(trip => filterByDate(trip.startTime)),
            batches: batches.filter(batch => filterByDate(batch.date))
        };
    }, [transactions, trips, batches, dateRange]);

    const safeFormat = (date: any, formatStr: string) => {
        try {
            const d = new Date(date);
            if (!isValid(d)) return 'N/A';
            return format(d, formatStr);
        } catch (e) {
            return 'N/A';
        }
    };

    const canAccessReports = hasFeature('ADVANCED_EXPORT');

    const generatePDF = async () => {
        if (!canAccessReports) return;
        setIsGenerating(true);
        try {
            if (typeof jsPDF !== 'function') {
                throw new Error('jsPDF library is not correctly loaded');
            }

            const doc = new jsPDF() as any;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            const getT = (key: string, fallback: string) => {
                const val = String(t(key));
                return val === key ? fallback : val;
            };

            // Helper for drawing a professional header
            const drawHeader = () => {
                // Accent bar at the top
                doc.setFillColor(79, 70, 229); // Indigo 600
                doc.rect(0, 0, pageWidth, 15, 'F');
                
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(40, 40, 40);
                doc.text(getT('reports.title', 'FINANCIAL REPORT'), 14, 35);
                
                doc.setDrawColor(230, 230, 230);
                doc.line(14, 40, pageWidth - 14, 40);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(`ISSUED TO: ${business?.name || currentUser?.name || 'LedgerAI User'}`, 14, 48);
                doc.text(`PERIOD: ${safeFormat(dateRange.start, 'MMM dd, yyyy')} - ${safeFormat(dateRange.end, 'MMM dd, yyyy')}`, 14, 53);
                doc.text(`GENERATED: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, pageWidth - 14, 48, { align: 'right' });
                
                return 65; // Return next Y position
            };

            let currentY = drawHeader();

            // Summary Section (Cards)
            const income = filteredData.transactions
                .filter(tx => tx.type === 'income')
                .reduce((sum, tx) => sum + convertAmount(tx.amount, tx.currency, preferredCurrency), 0);
            const expenses = filteredData.transactions
                .filter(tx => tx.type === 'expense')
                .reduce((sum, tx) => sum + convertAmount(tx.amount, tx.currency, preferredCurrency), 0);
            const net = income - expenses;

            doc.setFillColor(249, 250, 251); // Gray 50
            doc.roundedRect(14, currentY, (pageWidth - 42) / 3, 25, 3, 3, 'F');
            doc.roundedRect(14 + (pageWidth - 42) / 3 + 7, currentY, (pageWidth - 42) / 3, 25, 3, 3, 'F');
            doc.roundedRect(14 + 2 * ((pageWidth - 42) / 3 + 7), currentY, (pageWidth - 42) / 3, 25, 3, 3, 'F');

            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            doc.text('TOTAL INCOME', 18, currentY + 8);
            doc.text('TOTAL EXPENSES', 18 + (pageWidth - 42) / 3 + 7, currentY + 8);
            doc.text('NET CASH FLOW', 18 + 2 * ((pageWidth - 42) / 3 + 7), currentY + 8);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(16, 185, 129); // Emerald 500
            doc.text(formatAmount(income, preferredCurrency), 18, currentY + 18);
            doc.setTextColor(239, 68, 68); // Red 500
            doc.text(formatAmount(expenses, preferredCurrency), 18 + (pageWidth - 42) / 3 + 7, currentY + 18);
            doc.setTextColor(net >= 0 ? 16 : 239, net >= 0 ? 185 : 68, net >= 0 ? 129 : 68);
            doc.text(formatAmount(net, preferredCurrency), 18 + 2 * ((pageWidth - 42) / 3 + 7), currentY + 18);

            currentY += 40;

            // Financial Transactions Table
            if (includeSections.expenses && filteredData.transactions.length > 0) {
                if (currentY > pageHeight - 60) { doc.addPage(); currentY = 25; }
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(31, 41, 55);
                doc.text(getT('reports.transactions', 'Financial Transactions'), 14, currentY);
                currentY += 8;

                const txRows = filteredData.transactions.map(tx => [
                    safeFormat(tx.date, 'yyyy-MM-dd'),
                    tx.merchant || tx.item || 'N/A',
                    tx.type?.toUpperCase() || 'EXPENSE',
                    formatAmount(convertAmount(tx.amount, tx.currency, preferredCurrency), preferredCurrency)
                ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [[
                        getT('reports.date', 'Date'),
                        getT('reports.description', 'Description'),
                        getT('reports.type', 'Type'),
                        getT('reports.amount', 'Amount')
                    ]],
                    body: txRows,
                    theme: 'striped',
                    headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
                    bodyStyles: { fontSize: 9 },
                    margin: { left: 14, right: 14 }
                });
                currentY = (doc as any).lastAutoTable.finalY + 15;
            }

            // Analytics / Categories
            if (includeSections.analytics && filteredData.transactions.length > 0) {
                if (currentY > pageHeight - 80) { doc.addPage(); currentY = 25; }
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(31, 41, 55);
                doc.text(getT('reports.analytics', 'Spending by Category'), 14, currentY);
                currentY += 8;

                const categories: Record<string, number> = {};
                filteredData.transactions.forEach(tx => {
                    const cat = tx.categoryId || 'Uncategorized';
                    const amount = convertAmount(tx.amount, tx.currency, preferredCurrency);
                    categories[cat] = (categories[cat] || 0) + amount;
                });

                const catRows = Object.entries(categories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amt]) => [
                        cat.charAt(0).toUpperCase() + cat.slice(1),
                        formatAmount(amt, preferredCurrency),
                        `${((amt / (expenses || 1)) * 100).toFixed(1)}%`
                    ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [[
                        getT('reports.category', 'Category'),
                        getT('reports.total', 'Total'),
                        getT('reports.percentage', 'Percentage')
                    ]],
                    body: catRows,
                    theme: 'grid',
                    headStyles: { fillColor: [107, 114, 128], fontSize: 10 },
                    bodyStyles: { fontSize: 9 },
                    margin: { left: 14, right: 14 }
                });
                currentY = (doc as any).lastAutoTable.finalY + 15;
            }

            // Vehicle Usage
            if (includeSections.vehicle && filteredData.trips.length > 0) {
                if (currentY > pageHeight - 80) { doc.addPage(); currentY = 25; }
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(31, 41, 55);
                doc.text(getT('reports.vehicle', 'Vehicle Usage & Insights'), 14, currentY);
                currentY += 8;

                // Vehicle Insights
                const unit = business?.settings?.distanceUnit || 'km';
                const totalDist = filteredData.trips.reduce((sum, t) => sum + (t.distance || 0), 0);
                const bizDist = filteredData.trips.filter(t => t.usageType === 'business').reduce((sum, t) => sum + (t.distance || 0), 0);
                const personalDist = filteredData.trips.filter(t => t.usageType === 'personal').reduce((sum, t) => sum + (t.distance || 0), 0);

                doc.setFillColor(240, 249, 255); // Blue 50
                doc.roundedRect(14, currentY, pageWidth - 28, 20, 2, 2, 'F');
                
                doc.setFontSize(8);
                doc.setTextColor(30, 64, 175); // Blue 800
                doc.setFont('helvetica', 'bold');
                doc.text('VEHICLE INSIGHTS', 18, currentY + 7);
                
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(`Total Distance: ${formatDistance(totalDist, unit)}`, 18, currentY + 14);
                doc.text(`Business: ${formatDistance(bizDist, unit)} (${totalDist > 0 ? ((bizDist/totalDist)*100).toFixed(1) : 0}%)`, 80, currentY + 14);
                doc.text(`Personal: ${formatDistance(personalDist, unit)}`, 140, currentY + 14);
                
                currentY += 28;

                const tripRows = filteredData.trips.map(trip => [
                    safeFormat(trip.startTime, 'yyyy-MM-dd HH:mm'),
                    trip.usageType?.toUpperCase() || 'BUSINESS',
                    formatDistance(trip.distance || 0, unit)
                ]);

                autoTable(doc, {
                    startY: currentY,
                    head: [[
                        getT('reports.dateTime', 'Date & Time'),
                        getT('reports.type', 'Type'),
                        getT('reports.distance', 'Distance')
                    ]],
                    body: tripRows,
                    theme: 'striped',
                    headStyles: { fillColor: [16, 185, 129], fontSize: 10 },
                    bodyStyles: { fontSize: 9 },
                    margin: { left: 14, right: 14 }
                });
                currentY = (doc as any).lastAutoTable.finalY + 15;
            }

            // Inventory & Stock Levels (Detailed Section)
            if (includeSections.inventory) {
                // 1. Current Stock Levels Table
                const trackedProductNames = new Set(products.filter(p => p.isTracked !== false).map(p => p.name));
                const trackedInventory = inventoryItems.filter(item => trackedProductNames.has(item.productType));

                if (trackedInventory.length > 0) {
                    if (currentY > pageHeight - 60) { doc.addPage(); currentY = 25; }
                    
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(31, 41, 55);
                    doc.text(getT('reports.inventoryStockLevels', 'Current Stock & Inventory Levels'), 14, currentY);
                    currentY += 8;

                    const stockSummaryRows = trackedInventory.map(item => [
                        item.productType.toUpperCase(),
                        item.totalQuantity.toLocaleString(),
                        safeFormat(item.lastUpdated, 'yyyy-MM-dd')
                    ]);

                    autoTable(doc, {
                        startY: currentY,
                        head: [[
                            getT('inventory.product', 'Product'),
                            getT('inventory.quantity', 'Current Quantity'),
                            getT('inventory.lastUpdated', 'Last Updated')
                        ]],
                        body: stockSummaryRows,
                        theme: 'grid',
                        headStyles: { fillColor: [245, 158, 11], fontSize: 9 },
                        bodyStyles: { fontSize: 8 },
                        margin: { left: 14, right: 14 }
                    });
                    currentY = (doc as any).lastAutoTable.finalY + 15;
                }

                // 2. Production History Table
                const trackedBatches = filteredData.batches.filter(batch => trackedProductNames.has(batch.productType));
                
                if (trackedBatches.length > 0) {
                    if (currentY > pageHeight - 60) { doc.addPage(); currentY = 25; }
                    
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(31, 41, 55);
                    doc.text(getT('reports.productionHistory', 'Production History'), 14, currentY);
                    currentY += 8;

                    const batchRows = trackedBatches.map(batch => [
                        safeFormat(batch.date, 'yyyy-MM-dd'),
                        batch.productType || 'N/A',
                        (batch.quantityProduced || 0).toLocaleString(),
                        (batch.status || 'unknown').toUpperCase()
                    ]);

                    autoTable(doc, {
                        startY: currentY,
                        head: [[
                            getT('reports.date', 'Date'),
                            getT('inventory.product', 'Product'),
                            getT('inventory.quantity', 'Quantity'),
                            getT('inventory.status', 'Status')
                        ]],
                        body: batchRows,
                        theme: 'striped',
                        headStyles: { fillColor: [251, 191, 36], fontSize: 9 },
                        bodyStyles: { fontSize: 8 },
                        margin: { left: 14, right: 14 }
                    });
                    currentY = (doc as any).lastAutoTable.finalY + 15;
                }
            }

            // Footer / Disclaimer
            if (currentY > pageHeight - 30) { doc.addPage(); currentY = 25; }
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(156, 163, 175);
            const disclaimerText = doc.splitTextToSize(String(t('reports.disclaimer') || ''), pageWidth - 28);
            doc.text(disclaimerText, 14, currentY);
            
            // Page numbers
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }

            return doc;
        } catch (error) {
            console.error(error);
            addToast("Failed to generate PDF", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const doc = await generatePDF();
            if (doc) {
                const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
                doc.save(`LedgerAI_Report_${timestamp}.pdf`);
                addToast(t('reports.reportReady'), "success");
            }
        } catch (error) {
            console.error('PDF Download error:', error);
            addToast("Failed to download PDF report", "error");
        }
    };

    const handleDownloadExcel = () => {
        if (!canAccessReports) return;
        setIsGenerating(true);
        try {
            const wb = XLSX.utils.book_new();

            // Summary Sheet
            const income = filteredData.transactions
                .filter(tx => tx.type === 'income')
                .reduce((sum, tx) => sum + convertAmount(tx.amount, tx.currency, preferredCurrency), 0);
            const expenses = filteredData.transactions
                .filter(tx => tx.type === 'expense')
                .reduce((sum, tx) => sum + convertAmount(tx.amount, tx.currency, preferredCurrency), 0);
            
            const totalStock = inventoryItems
                .filter(item => item.productType.toLowerCase().includes('block'))
                .reduce((sum, item) => sum + item.totalQuantity, 0);
            const totalInventory = inventoryItems
                .filter(item => !item.productType.toLowerCase().includes('block'))
                .reduce((sum, item) => sum + item.totalQuantity, 0);

            const summaryData = [
                { Metric: 'Total Income', Value: income, Currency: preferredCurrency },
                { Metric: 'Total Expenses', Value: expenses, Currency: preferredCurrency },
                { Metric: 'Net Cash Flow', Value: income - expenses, Currency: preferredCurrency },
                { Metric: '', Value: '', Currency: '' },
                { Metric: '--- INVENTORY BREAKDOWN ---', Value: '', Currency: '' },
                ...inventoryItems.map(item => ({
                    Metric: item.productType,
                    Value: item.totalQuantity,
                    Currency: 'Units'
                }))
            ];
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

            if (includeSections.expenses) {
                const wsData = filteredData.transactions.map(tx => {
                    let dateStr = 'N/A';
                    try {
                        const d = new Date(tx.date);
                        if (!isNaN(d.getTime())) {
                            dateStr = format(d, 'yyyy-MM-dd');
                        }
                    } catch (e) {
                        console.warn('Invalid date in Excel export:', tx.date);
                    }

                    return {
                        Date: dateStr,
                        Merchant: String(tx.merchant || ''),
                        Item: String(tx.item || ''),
                        Type: String(tx.type || ''),
                        Amount: Number(tx.amount || 0),
                        Currency: String(tx.currency || ''),
                        Category: String(tx.categoryId || '')
                    };
                });
                const ws = XLSX.utils.json_to_sheet(wsData);
                XLSX.utils.book_append_sheet(wb, ws, "Transactions");
            }

            if (includeSections.vehicle) {
                const wsData = filteredData.trips.map(trip => {
                    let dateStr = 'N/A';
                    try {
                        const d = new Date(trip.startTime);
                        if (!isNaN(d.getTime())) {
                            dateStr = format(d, 'yyyy-MM-dd HH:mm');
                        }
                    } catch (e) {
                        console.warn('Invalid date in Excel export:', trip.startTime);
                    }

                    return {
                        Date: dateStr,
                        Type: String(trip.usageType || 'business'),
                        Distance: Number(trip.distance || 0),
                        Unit: 'km'
                    };
                });
                const ws = XLSX.utils.json_to_sheet(wsData);
                XLSX.utils.book_append_sheet(wb, ws, "Vehicle Usage");
            }

            if (includeSections.inventory) {
                const wsData = filteredData.batches.map(batch => {
                    let dateStr = 'N/A';
                    try {
                        const d = new Date(batch.date);
                        if (!isNaN(d.getTime())) {
                            dateStr = format(d, 'yyyy-MM-dd');
                        }
                    } catch (e) {
                        console.warn('Invalid date in Excel export:', batch.date);
                    }

                    return {
                        Date: dateStr,
                        Product: String(batch.productType || ''),
                        Quantity: Number(batch.quantityProduced || 0),
                        Status: String(batch.status || '')
                    };
                });
                const ws = XLSX.utils.json_to_sheet(wsData);
                XLSX.utils.book_append_sheet(wb, ws, "Inventory");
            }

            XLSX.writeFile(wb, `LedgerAI_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
            addToast(t('reports.reportReady'), "success");
        } catch (error) {
            console.error('Excel Download error:', error);
            addToast("Failed to generate Excel", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async (method: 'email' | 'whatsapp' | 'native') => {
        try {
            const doc = await generatePDF();
            if (!doc) return;

            const pdfBlob = doc.output('blob');
            const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
            const fileName = `LedgerAI_Report_${timestamp}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            if (method === 'native' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'LedgerAI Financial Report',
                        text: 'Here is my financial report from LedgerAI.'
                    });
                } catch (error: any) {
                    if (error.name === 'AbortError') {
                        console.log('Share canceled by user');
                    } else if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
                        console.warn('Share not allowed by environment', error);
                        addToast("Sharing is restricted in this view. Please try downloading instead.", "info");
                    } else {
                        console.error('Share failed', error);
                        addToast(t('common.error') || "Sharing failed", "error");
                    }
                }
            } else if (method === 'email') {
                const subject = encodeURIComponent('LedgerAI Financial Report');
                const body = encodeURIComponent('Please find attached my financial report generated by LedgerAI.\n\n(Note: Please attach the downloaded file manually if your browser does not support automatic attachment)');
                
                // Trigger download first so they have the file
                doc.save(fileName);
                addToast("Report downloaded. Please attach it to the email manually.", "info");
                
                setTimeout(() => {
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }, 1000);
            } else if (method === 'whatsapp') {
                const text = encodeURIComponent('Here is my financial report from LedgerAI. (Please attach the downloaded file)');
                
                // Trigger download first
                doc.save(fileName);
                addToast("Report downloaded. Please attach it to the message manually.", "info");
                
                setTimeout(() => {
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                }, 1000);
            }
        } catch (error) {
            console.error('Share error:', error);
            addToast("Failed to share report", "error");
        }
    };

    if (!canAccessReports) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-[var(--bg-secondary)] rounded-3xl p-8 text-center border border-[var(--border-primary-translucent)] shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                        <AlertCircle size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black mb-4">{t('reports.upgradeRequired')}</h2>
                    <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                        {t('exportUpgrade.subtitle')}
                    </p>
                    <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('open-subscription-view'))}
                        className="bg-[var(--accent-primary)] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                        {t('exportUpgrade.upgradeAction')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{String(t('reports.title'))}</h1>
                    <p className="text-[var(--text-secondary)]">{String(t('reports.subtitle'))}</p>
                </div>
                <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border-primary-translucent)] overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => {
                            setDateRange({ start: subDays(new Date(), 7), end: new Date() });
                            setActivePeriod('7d');
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activePeriod === '7d' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'hover:bg-[var(--bg-tertiary)]'}`}
                    >
                        7D
                    </button>
                    <button 
                        onClick={() => {
                            setDateRange({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
                            setActivePeriod('mtd');
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activePeriod === 'mtd' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'hover:bg-[var(--bg-tertiary)]'}`}
                    >
                        MTD
                    </button>
                    <button 
                        onClick={() => {
                            const lastMonthStart = startOfMonth(subDays(startOfMonth(new Date()), 1));
                            const lastMonthEnd = endOfMonth(lastMonthStart);
                            setDateRange({ start: lastMonthStart, end: lastMonthEnd });
                            setActivePeriod('lastMonth');
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activePeriod === 'lastMonth' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'hover:bg-[var(--bg-tertiary)]'}`}
                    >
                        Last Month
                    </button>
                    <button 
                        onClick={() => {
                            setDateRange({ start: startOfYear(new Date()), end: new Date() });
                            setActivePeriod('ytd');
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${activePeriod === 'ytd' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'hover:bg-[var(--bg-tertiary)]'}`}
                    >
                        YTD
                    </button>
                    <div className="w-px h-6 bg-[var(--border-primary-translucent)] mx-1" />
                    <button 
                        onClick={() => {
                            // Data is live-queried, but we can trigger a visual "refresh"
                            setIsGenerating(true);
                            setTimeout(() => setIsGenerating(false), 500);
                            addToast(t('common.loading'), 'info');
                        }}
                        className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-primary-translucent)] shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-lg font-bold">{String(t('reports.dateRange'))}</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase">{t('history.startDate')}</label>
                                <input 
                                    type="date" 
                                    value={safeFormat(dateRange.start, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const d = new Date(e.target.value);
                                        if (isValid(d)) {
                                            setDateRange({ ...dateRange, start: d });
                                            setActivePeriod('custom');
                                        }
                                    }}
                                    className="w-full bg-[var(--bg-tertiary)] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase">{t('history.endDate')}</label>
                                <input 
                                    type="date" 
                                    value={safeFormat(dateRange.end, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const d = new Date(e.target.value);
                                        if (isValid(d)) {
                                            setDateRange({ ...dateRange, end: d });
                                            setActivePeriod('custom');
                                        }
                                    }}
                                    className="w-full bg-[var(--bg-tertiary)] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-primary-translucent)] shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <CheckCircle2 size={20} />
                            </div>
                            <h2 className="text-lg font-bold">{String(t('reports.includeSections'))}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(includeSections).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => setIncludeSections({ ...includeSections, [key]: !value })}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${value ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)]'}`}
                                >
                                    <span className="font-bold capitalize">{String(t(`reports.${key}`))}</span>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${value ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)]'}`}>
                                        {value && <CheckCircle2 size={14} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-4">
                        <Info className="text-blue-500 shrink-0" size={20} />
                        <p className="text-xs text-blue-700/80 leading-relaxed italic">
                            {String(t('reports.disclaimer'))}
                        </p>
                    </div>
                </div>

                {/* Actions Panel */}
                <div className="space-y-6">
                    <section className="bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-primary-translucent)] shadow-lg sticky top-6">
                        <h2 className="text-lg font-bold mb-6">{String(t('reports.generateReport'))}</h2>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={handleDownloadPdf}
                                disabled={isGenerating}
                                className="w-full bg-[var(--accent-primary)] text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={20} />}
                                {String(t('reports.downloadPdf'))}
                            </button>

                            <button 
                                onClick={handleDownloadExcel}
                                disabled={isGenerating}
                                className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] p-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[var(--bg-secondary)] border border-[var(--border-primary-translucent)] transition-all disabled:opacity-50"
                            >
                                <FileSpreadsheet size={20} className="text-emerald-500" />
                                {String(t('reports.downloadExcel'))}
                            </button>

                            <div className="pt-4 mt-4 border-t border-[var(--border-primary-translucent)]">
                                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">{String(t('reports.shareReport'))}</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => handleShare('email')}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-all"
                                    >
                                        <Mail size={20} className="text-blue-500 mb-1" />
                                        <span className="text-[10px] font-bold">Email</span>
                                    </button>
                                    <button 
                                        onClick={() => handleShare('whatsapp')}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-all"
                                    >
                                        <MessageSquare size={20} className="text-emerald-500 mb-1" />
                                        <span className="text-[10px] font-bold">WhatsApp</span>
                                    </button>
                                    <button 
                                        onClick={() => handleShare('native')}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-all"
                                    >
                                        <Share2 size={20} className="text-indigo-500 mb-1" />
                                        <span className="text-[10px] font-bold">Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
