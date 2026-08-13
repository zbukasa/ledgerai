
import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    color?: string;
    withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 32, color = "currentColor", withText = false }) => {
    const logoIcon = (
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Minimalist abstract geometric shape representing structure and growth */}
                <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="8" className="opacity-20" />
                <path 
                    d="M35 35 V65 H65" 
                    stroke={color} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <circle cx="65" cy="35" r="6" fill="var(--accent-primary)" />
            </svg>
        </div>
    );

    if (withText) {
        return (
            <div className={`flex items-center gap-3 select-none ${className}`}>
                {logoIcon}
                <span 
                    className="font-bold tracking-tight leading-none" 
                    style={{ 
                        fontSize: Math.max(18, size * 0.65), // Dynamic font size scaling with logo
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: color === 'currentColor' ? 'inherit' : color
                    }}
                >
                    LedgerAI
                </span>
            </div>
        );
    }

    return <div className={className}>{logoIcon}</div>;
};

export default Logo;
