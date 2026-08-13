import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { Toast } from '../types';

const ToastContainer: React.FC = () => {
    const { toasts } = useNotification();

    return (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-xs space-y-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastMessage key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

interface ToastMessageProps {
    toast: Toast;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ toast }) => {
    const { removeToast } = useNotification();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, 4000); // Auto-dismiss after 4 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, removeToast]);

    const icons = {
        success: <CheckCircle2 className="text-green-500" />,
        error: <XCircle className="text-red-500" />,
        info: <Info className="text-blue-500" />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="flex items-start p-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg shadow-2xl border border-[var(--border-primary-translucent)]"
        >
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 flex-shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
                <XCircle size={16} />
            </button>
        </motion.div>
    );
};

export default ToastContainer;
