import React from "react";
import { Profile } from "../types";

export function JourneyProgress({ profile }: { profile: Profile }) {
    return (
        <div className="glass rounded-[32px] p-6 mb-6">
            <h3 className="text-xl mb-4 text-white">Daily Journey</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-2xl font-bold heading-bebas text-white">{profile.streak}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Day Streak</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="text-2xl mb-1">⚖️</div>
                    <div className="text-2xl font-bold heading-bebas text-white">{profile.currentWeight}kg</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Weight</div>
                </div>
            </div>
        </div>
    );
}
