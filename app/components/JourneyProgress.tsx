import React from "react";
import { Profile, History } from "../types";

interface JourneyProgressProps {
    profile: Profile;
    history: History;
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

export function JourneyProgress({ profile, history }: JourneyProgressProps) {
    const last7 = getLastNDays(7);
    const thisWeekCount = last7.filter(d => history[d] && history[d].length > 0).length;
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayDone = (history[todayKey] || []).length;

    return (
        <div className="mb-6 space-y-4">
            {/* Streak + Weight */}
            <div className="grid grid-cols-2 gap-4">
                {/* Streak */}
                <div className="relative glass rounded-[28px] p-5 overflow-hidden border border-warning/20 bg-warning/5">
                    <div className="absolute top-[-8px] right-[-8px] text-6xl opacity-10">🔥</div>
                    <div className="relative z-10">
                        <div className="text-[9px] font-bold text-warning/70 uppercase tracking-[.2em] mb-2">Streak</div>
                        <div className="flex items-end gap-1.5">
                            <div className="text-5xl font-bold heading-bebas text-warning leading-none">{profile.streak}</div>
                            <div className="text-xl mb-0.5">🔥</div>
                        </div>
                        <div className="text-[9px] text-gray-600 mt-1">consecutive days</div>
                    </div>
                </div>

                {/* Weight */}
                <div className="glass rounded-[28px] p-5 border border-white/5 bg-white/[0.02]">
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[.2em] mb-2">Weight</div>
                    <div className="text-5xl font-bold heading-bebas text-white leading-none">{profile.currentWeight}<span className="text-xl text-gray-500 ml-1">kg</span></div>
                    <div className="text-[9px] text-gray-600 mt-1">Goal: {profile.goal}</div>
                </div>
            </div>

            {/* Weekly activity bar */}
            <div className="glass rounded-[28px] p-5 border border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[.2em]">This Week</div>
                    <div className="text-sm font-bold heading-bebas" style={{ color: '#00D4AA' }}>{thisWeekCount} / 7 days</div>
                </div>
                <div className="flex gap-2">
                    {last7.map((day) => {
                        const active = !!(history[day] && history[day].length > 0);
                        const isToday = day === todayKey;
                        const d = new Date(day + "T00:00:00");
                        const label = ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
                        return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm transition-all duration-300 ${active ? 'bg-primary shadow-lg shadow-primary/30' : isToday ? 'border border-white/10 bg-white/5' : 'bg-white/[0.03]'}`}>
                                    {active ? "✓" : ""}
                                </div>
                                <div className={`text-[9px] font-bold ${isToday ? 'text-white' : 'text-gray-600'}`}>{label}</div>
                            </div>
                        );
                    })}
                </div>
                {/* Progress bar */}
                <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${(thisWeekCount / 7) * 100}%` }}
                    />
                </div>
            </div>

            {/* Today's sessions */}
            {todayDone > 0 && (
                <div className="glass rounded-[28px] p-5 border border-success/20 bg-success/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-bold text-success/70 uppercase tracking-[.2em] mb-1">Today's Activity</div>
                            <div className="text-2xl font-bold heading-bebas text-success">{todayDone} Session{todayDone > 1 ? "s" : ""} Complete</div>
                        </div>
                        <div className="text-4xl">🏆</div>
                    </div>
                </div>
            )}
        </div>
    );
}
