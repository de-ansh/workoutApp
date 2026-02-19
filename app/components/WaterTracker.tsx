import React from "react";

export function WaterTracker({ current, goal, onAdd }: { current: number, goal: number, onAdd: (ml: number) => void }) {
    return (
        <div className="glass rounded-[32px] p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl m-0 text-white">Water Intake</h3>
                    <p className="text-sm text-gray-400 m-0">{current} / {goal} ml</p>
                </div>
                <div className="text-3xl">💧</div>
            </div>
            <div className="bg-gray-800 h-2 rounded-full overflow-hidden mb-6">
                <div className="premium-gradient h-full transition-all duration-500" style={{ width: `${Math.min(100, (current / goal) * 100)}%` }} />
            </div>
            <div className="flex gap-3">
                {[250, 500].map(ml => (
                    <button key={ml} onClick={() => onAdd(ml)} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-sm font-semibold hover:bg-white/10 transition-colors text-white">
                        +{ml}ml
                    </button>
                ))}
            </div>
        </div>
    );
}
