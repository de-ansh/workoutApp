import React from 'react';
import { Challenge, ChallengeProgress } from '../types';
import { CALISTHENICS_CHALLENGES } from '../constants';
import { ChallengeCard } from './ChallengeCard';

interface ChallengesViewProps {
    activeChallenges: Record<string, ChallengeProgress>;
    onStartChallenge: (id: string) => void;
    onStartWorkout: (challengeId: string) => void;
}

export function ChallengesView({
    activeChallenges,
    onStartChallenge,
    onStartWorkout
}: ChallengesViewProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 p-1">
                <div className="text-primary text-[10px] uppercase font-bold tracking-[.4em] mb-2">Programs</div>
                <h1 className="text-5xl m-0 text-white font-bold leading-none">Challenges</h1>
                <p className="text-gray-500 text-sm mt-3 tracking-wide">Multi-day programs built for results.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-20">
                {CALISTHENICS_CHALLENGES.map((challenge) => (
                    <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        progress={activeChallenges[challenge.id]}
                        onStart={onStartChallenge}
                        onWorkout={onStartWorkout}
                    />
                ))}

                {/* Coming Soon Placeholder */}
                <div className="glass rounded-[32px] p-8 border border-white/5 bg-white/[0.01] text-center border-dashed">
                    <div className="text-3xl mb-2 opacity-30">⏳</div>
                    <div className="text-xs text-gray-600 font-bold uppercase tracking-widest">More Challenges Coming Soon</div>
                </div>
            </div>
        </div>
    );
}
