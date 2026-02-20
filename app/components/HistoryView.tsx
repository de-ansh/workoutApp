import React from "react";
import { History, Plans } from "../types";
import { todayKey } from "../lib/utils";

interface HistoryViewProps {
    history: History;
    plans: Plans;
    onClose: () => void;
}

/** Returns an array of the last N date keys (YYYY-MM-DD), newest last */
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

function computeStreak(history: History): number {
    let count = 0;
    const d = new Date();
    while (true) {
        const key = d.toISOString().slice(0, 10);
        if (history[key] && history[key].length > 0) {
            count++;
            d.setDate(d.getDate() - 1);
        } else break;
    }
    return count;
}

export function HistoryView({ history, plans }: HistoryViewProps) {
    const entries = Object.entries(history).sort((a, b) => b[0].localeCompare(a[0]));
    const streak = computeStreak(history);
    const totalWorkouts = entries.reduce((a, [, v]) => a + v.length, 0);
    const totalMins = entries.reduce((a, [, v]) => a + v.reduce((b, w) => b + (w.mins || 0), 0), 0);

    const last28 = getLastNDays(28);
    const last7 = getLastNDays(7);
    const thisWeekCount = last7.filter(d => history[d] && history[d].length > 0).length;

    const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

    const formatDate = (key: string) => {
        const d = new Date(key + "T00:00:00");
        const today = todayKey();
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        if (key === today) return "Today";
        if (key === yKey) return "Yesterday";
        return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-8">
                <div className="text-primary text-[10px] uppercase font-bold tracking-[.3em] mb-2">Consistency</div>
                <h1 className="text-5xl m-0 text-white">History</h1>
            </div>

            {/* Streak hero card */}
            <div className="relative glass rounded-[32px] p-6 mb-6 overflow-hidden border border-warning/20 bg-warning/5">
                <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-warning/80 uppercase tracking-[.3em] mb-1">Current Streak</div>
                        <div className="flex items-end gap-2">
                            <div className="text-7xl font-bold heading-bebas text-warning leading-none">{streak}</div>
                            <div className="text-2xl mb-1">🔥</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">consecutive days</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">This Week</div>
                        <div className="flex gap-1.5">
                            {last7.map((day) => {
                                const active = !!(history[day] && history[day].length > 0);
                                const d = new Date(day + "T00:00:00");
                                return (
                                    <div key={day} className="flex flex-col items-center gap-1">
                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm transition-all ${active ? 'bg-warning text-black' : 'bg-white/5 text-gray-600'}`}>
                                            {active ? "🔥" : ""}
                                        </div>
                                        <div className="text-[8px] text-gray-600 font-bold">{DAY_LABELS[d.getDay()]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                    { label: "Sessions", val: totalWorkouts, color: "#7B61FF" },
                    { label: "Active Days", val: thisWeekCount + "/7", color: "#00D4AA" },
                    { label: "Minutes", val: totalMins, color: "#FF6B35" },
                ].map(s => (
                    <div key={s.label} className="glass rounded-2xl p-4 text-center border-white/5 bg-white/[0.02]">
                        <div className="text-2xl font-bold heading-bebas mb-1" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* 28-day heatmap calendar */}
            <div className="glass rounded-[28px] p-5 mb-8 border-white/5 bg-white/[0.02]">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[.3em] mb-4">28-Day Activity</div>
                <div className="grid grid-cols-7 gap-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
                        <div key={i} className="text-[9px] text-gray-600 text-center font-bold">{l}</div>
                    ))}
                    {last28.map((day) => {
                        const count = history[day]?.length || 0;
                        const isToday = day === todayKey();
                        let bg = "bg-white/5";
                        if (count >= 3) bg = "bg-primary";
                        else if (count === 2) bg = "bg-primary/60";
                        else if (count === 1) bg = "bg-primary/30";
                        return (
                            <div
                                key={day}
                                className={`aspect-square rounded-lg ${bg} ${isToday ? 'ring-1 ring-white/30' : ''} flex items-center justify-center`}
                                title={`${day}: ${count} workout(s)`}
                            >
                                {count > 0 && <div className="text-[8px] font-bold text-white/80">{count}</div>}
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center gap-3 mt-4 justify-end">
                    <div className="text-[9px] text-gray-600 uppercase tracking-widest">Less</div>
                    {["bg-white/5", "bg-primary/30", "bg-primary/60", "bg-primary"].map((c, i) => (
                        <div key={i} className={`w-4 h-4 rounded-md ${c}`} />
                    ))}
                    <div className="text-[9px] text-gray-600 uppercase tracking-widest">More</div>
                </div>
            </div>

            {/* Per-day history */}
            {entries.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4">🏋️</div>
                    <div className="text-gray-500 font-bold heading-bebas tracking-widest text-2xl">No Workouts Yet</div>
                    <div className="text-gray-600 text-xs mt-2">Complete a session to see your history here</div>
                </div>
            ) : (
                <div className="space-y-6">
                    {entries.map(([date, items]) => (
                        <div key={date}>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-[.3em] mb-4 px-2 flex items-center gap-3">
                                <span>{formatDate(date)}</span>
                                <div className="flex-1 h-px bg-white/5" />
                                <span className="text-primary">{items.length} session{items.length > 1 ? "s" : ""}</span>
                            </div>
                            <div className="space-y-3">
                                {items.map((it, idx) => {
                                    const p = plans[it.planKey];
                                    return (
                                        <div
                                            key={idx}
                                            className="glass rounded-2xl p-5 flex items-center justify-between border-white/5 bg-white/[0.01]"
                                            style={{ borderLeft: `3px solid ${p?.color || '#7B61FF'}` }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/5">
                                                    {p?.emoji || "💪"}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{p?.label || it.planKey}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{it.mins} Minutes</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-600 font-mono">
                                                    {new Date(it.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                                <div className="text-[9px] text-success mt-1 font-bold">✓ Done</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
