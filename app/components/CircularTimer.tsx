import React from "react";
import { fmt } from "../lib/utils";

interface CircularTimerProps {
    current: number;
    total: number;
    isRest: boolean;
    isRunning: boolean;
    color?: string;
}

export function CircularTimer({ current, total, isRest, isRunning, color = "#7B61FF" }: CircularTimerProps) {
    const r = 90;
    const circ = 2 * Math.PI * r;
    const pct = total > 0 ? (total - current) / total : 0;
    const dash = circ * pct;
    const stroke = isRest ? "#FFB800" : isRunning ? color : "#333";

    return (
        <div className="relative w-[240px] h-[240px] mx-auto my-8">
            <svg width="240" height="240" className="-rotate-90">
                <circle cx="120" cy="120" r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                <circle
                    cx="120" cy="120" r={r} fill="none" stroke={stroke} strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
                    className="transition-all duration-500 ease-linear"
                />
                {/* Glow effect */}
                {isRunning && (
                    <circle
                        cx="120" cy="120" r={r} fill="none" stroke={stroke} strokeWidth="12"
                        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
                        style={{ filter: `blur(8px)`, opacity: 0.3 }}
                        className="transition-all duration-500 ease-linear"
                    />
                )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-[10px] uppercase tracking-[0.3em] font-medium mb-1 ${isRest ? "text-warning" : "text-primary opacity-80"}`}>
                    {isRest ? "Recovering" : "Active Work"}
                </div>
                <div className="text-6xl font-bold heading-bebas leading-none tracking-tighter text-white">
                    {fmt(current)}
                </div>
                {!isRest && <div className="text-[11px] text-gray-500 mt-2 font-medium opacity-60">Goal: {fmt(total)}</div>}
            </div>
        </div>
    );
}
