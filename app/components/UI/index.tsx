import React from "react";

interface WrapperProps {
    children: React.ReactNode;
}

export function Wrapper({ children }: WrapperProps) {
    return (
        <div className="max-w-[480px] mx-auto min-h-screen bg-background p-6 pt-12 text-foreground font-sans selection:bg-primary/30 relative">
            <div className="absolute top-0 left-0 right-0 h-64 bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
            {children}
        </div>
    );
}

export function NavBtn({ active, icon, label, onClick }: { active: boolean, icon: string, label: string, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-gray-500 opacity-60'}`}>
            <span className="text-2xl">{icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
            {active && <div className="w-1 h-1 bg-primary rounded-full mt-1 animate-pulse" />}
        </button>
    );
}

interface ToggleProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export const Toggle = ({ label, active, onClick }: ToggleProps) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${active ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-gray-500 opacity-60'}`}>
        {label}
    </button>
);

interface TagProps {
    color: string;
    children: React.ReactNode;
}

export const Tag = ({ color, children }: TagProps) => (
    <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/10" style={{ color }}>
        {children}
    </span>
);
