import React from "react";
import { WaterHistory } from "../types";

interface WaterTrackerProps {
    current: number;
    goal: number;
    waterHistory: WaterHistory;
    onAdd: (ml: number) => void;
}

function getLastNDays(n: number): string[] {
    const days: string[] = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const copy = new Date(d);
        copy.setDate(d.getDate() - i);
        days.push(copy.toISOString().slice(0, 10));
    }
    return days;
}

export function WaterTracker({ current, goal, waterHistory, onAdd }: WaterTrackerProps) {
    const pct = Math.min(100, Math.round((current / goal) * 100));
    const last7 = getLastNDays(7);
    const todayKey = new Date().toISOString().slice(0, 10);

    // Build history entries including today's live value
    const historyWithToday: WaterHistory = {
        ...waterHistory,
        [todayKey]: current,
    };
    const maxInPeriod = Math.max(goal, ...last7.map(d => historyWithToday[d] || 0));

    return (
        <div className="glass rounded-[32px] p-6 mb-6 border border-white/5">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <div className="text-[9px] font-bold text-blue-400/70 uppercase tracking-[.2em] mb-1">Hydration</div>
                    <h3 className="text-xl m-0 text-white">Water Intake</h3>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold heading-bebas text-blue-400">{current}<span className="text-sm text-gray-500 font-normal ml-0.5">ml</span></div>
                    <div className="text-[9px] text-gray-600">of {goal}ml</div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative bg-white/5 rounded-full h-3 overflow-hidden mb-2">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${pct}%`,
                        background: pct >= 100
                            ? 'linear-gradient(90deg, #00D4AA, #00f5c4)'
                            : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                    }}
                />
            </div>
            <div className="flex justify-between items-center mb-5">
                <div className="text-[9px] text-gray-600">{pct}% of daily goal</div>
                {pct >= 100 && <div className="text-[9px] text-success font-bold">🎉 Goal reached!</div>}
            </div>

            {/* Quick add buttons */}
            <div className="flex gap-2 mb-6">
                {[150, 250, 500].map(ml => (
                    <button
                        key={ml}
                        onClick={() => onAdd(ml)}
                        className="flex-1 py-3 rounded-2xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 text-white transition-all active:scale-95"
                    >
                        +{ml}ml
                    </button>
                ))}
            </div>

            {/* 7-day history */}
            <div>
                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-[.25em] mb-3">7-Day History</div>
                <div className="flex items-end gap-1.5 h-12">
                    {last7.map((day) => {
                        const val = historyWithToday[day] || 0;
                        const barPct = maxInPeriod > 0 ? (val / maxInPeriod) * 100 : 0;
                        const isToday = day === todayKey;
                        const hitGoal = val >= goal;
                        const d = new Date(day + "T00:00:00");
                        const label = ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
                        return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex-1 flex items-end rounded-t-lg overflow-hidden bg-white/[0.03]">
                                    <div
                                        className="w-full rounded-t-lg transition-all duration-500"
                                        style={{
                                            height: `${Math.max(4, barPct)}%`,
                                            background: hitGoal
                                                ? 'linear-gradient(180deg, #00D4AA, #00b894)'
                                                : isToday
                                                    ? 'linear-gradient(180deg, #60A5FA, #3B82F6)'
                                                    : 'rgba(255,255,255,0.08)',
                                        }}
                                    />
                                </div>
                                <div className={`text-[8px] font-bold ${isToday ? 'text-white' : 'text-gray-600'}`}>{label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
