import React from 'react';
import { Challenge, ChallengeProgress } from '../types';

interface ChallengeCardProps {
    challenge: Challenge;
    progress?: ChallengeProgress;
    onStart: (id: string) => void;
    onWorkout: (challengeId: string) => void;
}

export function ChallengeCard({ challenge, progress, onStart, onWorkout }: ChallengeCardProps) {
    const isStarted = !!progress;
    const isCompleted = !!(progress?.currentDay && progress.currentDay > challenge.days);
    const progressPct = isStarted ? Math.min(100, Math.round(((progress?.currentDay || 1) - 1) / challenge.days * 100)) : 0;

    return (
        <div className={`glass rounded-[32px] overflow-hidden border transition-all duration-300 ${isStarted ? 'border-primary/40' : 'border-white/10'} bg-white/[0.02] flex flex-col`}>
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 shadow-sm shadow-primary/10">
                        {challenge.rewardEmoji}
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{challenge.difficulty}</div>
                        <div className="text-primary font-bold heading-bebas text-xl">{challenge.days} DAYS</div>
                    </div>
                </div>

                <h3 className="text-2xl m-0 mb-2 text-white">{challenge.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">{challenge.desc}</p>

                {isStarted && !isCompleted && (
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-[10px] font-bold text-gray-500 uppercase">Progress</div>
                            <div className="text-[10px] font-bold text-primary uppercase">Day {progress?.currentDay} / {challenge.days}</div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                )}

                {isCompleted && (
                    <div className="bg-success/10 border border-success/20 rounded-2xl p-3 text-center mb-6 animate-pulse">
                        <div className="text-success text-xs font-bold uppercase tracking-widest">Challenge Completed 🏆</div>
                    </div>
                )}
            </div>

            <button
                onClick={() => isStarted ? onWorkout(challenge.id) : onStart(challenge.id)}
                className={`w-full py-5 text-center font-bold text-lg heading-bebas tracking-widest active:scale-[0.98] transition-all ${isStarted ? 'bg-primary text-white' : 'bg-white/10 text-white'}`}
                disabled={isCompleted}
            >
                {isCompleted ? "WELL DONE!" : isStarted ? `START DAY ${progress?.currentDay}` : "START CHALLENGE"}
            </button>
        </div>
    );
}
