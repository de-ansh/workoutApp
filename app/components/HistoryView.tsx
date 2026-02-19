import React from "react";
import { History, Plans } from "../types";
import { todayKey } from "../lib/utils";

interface HistoryViewProps {
    history: History;
    plans: Plans;
    onClose: () => void;
}

export function HistoryView({ history, plans }: HistoryViewProps) {
    const entries = Object.entries(history).sort((a, b) => b[0].localeCompare(a[0]));

    const streak = (() => {
        let count = 0;
        const d = new Date();
        while (true) {
            const key = d.toISOString().slice(0, 10);
            if (history[key]) { count++; d.setDate(d.getDate() - 1); } else break;
        }
        return count;
    })();

    const totalWorkouts = entries.reduce((a, [, v]) => a + v.length, 0);
    const totalMins = entries.reduce((a, [, v]) => a + v.reduce((b, w) => b + (w.mins || 0), 0), 0);

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
                <h1 className="text-5xl m-0 text-white">History</h1>
                <div className="text-primary text-sm font-bold heading-bebas uppercase tracking-widest">{totalWorkouts} Sessions</div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                    { label: "Streak", val: `${streak}🔥`, color: "#FFB800" },
                    { label: "Total", val: `${totalWorkouts}`, color: "#7B61FF" },
                    { label: "Mins", val: `${totalMins}`, color: "#00D4AA" },
                ].map(s => (
                    <div key={s.label} className="glass rounded-2xl p-4 text-center border-white/5 bg-white/[0.02]">
                        <div className="text-2xl font-bold heading-bebas mb-1" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                {entries.map(([date, items]) => (
                    <div key={date}>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-[.3em] mb-4 px-2">{formatDate(date)}</div>
                        <div className="space-y-3">
                            {items.map((it, idx) => {
                                const p = plans[it.planKey];
                                return (
                                    <div key={idx} className="glass rounded-2xl p-5 flex items-center justify-between border-white/5 bg-white/[0.01]">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center border border-white/5">
                                                {p?.emoji || "💪"}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{p?.label || it.planKey}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{it.mins} Minutes</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-gray-600 font-mono">{new Date(it.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
