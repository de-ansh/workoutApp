import React from 'react';

interface Achievement {
    id: string;
    title: string;
    desc: string;
    emoji: string;
    color: string;
}

const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'first_workout', title: 'First Steps', desc: 'Complete your first workout', emoji: '👟', color: '#7B61FF' },
    { id: 'streak_3', title: 'On Fire', desc: 'Maintain a 3-day streak', emoji: '🔥', color: '#FFB800' },
    { id: 'water_goal', title: 'Hydration Hero', desc: 'Hit your water goal 3 times', emoji: '💧', color: '#3B82F6' },
    { id: 'weight_logged', title: 'Self-Aware', desc: 'Log your weight for the first time', emoji: '⚖️', color: '#00D4AA' },
    { id: 'early_bird', title: 'Early Bird', desc: 'Workout before 9:00 AM', emoji: '🌅', color: '#FF6B35' },
    { id: 'night_owl', title: 'Night Owl', desc: 'Workout after 9:00 PM', emoji: '🌙', color: '#A289FF' },
    { id: 'cali_master', title: 'Cali King', desc: 'Complete a 7-day Calisthenics challenge', emoji: '👑', color: '#FFD700' },
];

interface AchievementsViewProps {
    unlockedIds: string[];
}

export function AchievementsView({ unlockedIds }: AchievementsViewProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6">
                <div className="text-primary text-[10px] uppercase font-bold tracking-[.3em] mb-2">Milestones</div>
                <h1 className="text-5xl m-0 text-white">Badges</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {ACHIEVEMENTS_LIST.map(a => {
                    const isUnlocked = unlockedIds.includes(a.id);
                    return (
                        <div
                            key={a.id}
                            className={`glass rounded-[32px] p-6 border transition-all duration-500 overflow-hidden relative ${isUnlocked ? 'border-white/10' : 'border-white/5 opacity-40 grayscale'}`}
                        >
                            {isUnlocked && (
                                <div className="absolute top-[-10px] right-[-10px] text-6xl opacity-10 rotate-12" style={{ color: a.color }}>
                                    {a.emoji}
                                </div>
                            )}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className={`text-4xl mb-4 w-16 h-16 rounded-3xl flex items-center justify-center bg-white/5 border border-white/5 ${isUnlocked ? 'shadow-lg' : ''}`} style={isUnlocked ? { boxShadow: `0 8px 16px ${a.color}22` } : {}}>
                                    {a.emoji}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">{a.title}</h3>
                                <p className="text-[10px] text-gray-400 leading-tight px-2">{a.desc}</p>
                                {isUnlocked && (
                                    <div className="mt-3 text-[9px] font-bold text-success uppercase tracking-widest">Unlocked ✓</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
