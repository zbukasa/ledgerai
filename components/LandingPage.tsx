
import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative overflow-hidden font-sans selection:bg-blue-500/30">
            
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <nav className="relative z-10 w-full max-w-7xl mx-auto p-6 md:p-10 flex justify-between items-center">
                <Logo size={40} color="white" withText />
                {/* Optional Login button could go here */}
            </nav>

            {/* Main Content */}
            <main className="flex-grow relative z-10 flex flex-col items-center justify-center px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl space-y-8"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.05]">
                        Financial clarity,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-400 to-indigo-400">perfected.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        The intelligent operating system for your money. Track, analyze, and grow your wealth with the precision of AI and the simplicity of design.
                    </p>

                    <div className="pt-8 flex flex-col items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onGetStarted}
                            className="group bg-white text-[#0f172a] px-10 py-5 rounded-full text-lg font-bold inline-flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300"
                        >
                            <span>Start your journey</span>
                            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </motion.button>
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                            Includes 7-Day Free Premium Trial
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs uppercase tracking-widest gap-4">
                <div className="flex gap-6">
                    <span>Secure</span>
                    <span>Private</span>
                    <span>Intelligent</span>
                </div>
                <div>© {new Date().getFullYear()} LedgerAI</div>
            </footer>
        </div>
    );
};

export default LandingPage;
