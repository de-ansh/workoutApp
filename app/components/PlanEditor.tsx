import React, { useState } from "react";
import { Plans, Exercise } from "../types";
import { EXERCISE_POOL } from "../constants";
import { updateDB } from "../lib/db";

interface PlanEditorProps {
    plans: Plans;
    setPlans: (plans: Plans) => void;
    onClose: () => void;
}

export function PlanEditor({ plans, setPlans, onClose }: PlanEditorProps) {
    const [activeTab, setActiveTab] = useState<string>("morning");
    const [showModal, setShowModal] = useState(false);
    const [newEx, setNewEx] = useState<Omit<Exercise, 'id'>>({ name: "", type: "cardio", duration: 45, rest: 15, steps: [] });
    const [poolSel, setPoolSel] = useState("");

    const plan = plans[activeTab];
    if (!plan) return null;

    const removeEx = (id: number | string) => {
        const next = { ...plans, [activeTab]: { ...plans[activeTab], exercises: plans[activeTab].exercises.filter(e => e.id !== id) } };
        setPlans(next);
        updateDB({ plans: next });
    };

    const addEx = () => {
        const ex: Exercise = { ...newEx, id: Date.now() };
        const next = { ...plans, [activeTab]: { ...plans[activeTab], exercises: [...plans[activeTab].exercises, ex] } };
        setPlans(next);
        updateDB({ plans: next });
        setShowModal(false);
        setNewEx({ name: "", type: "cardio", duration: 45, rest: 15, steps: [] });
    };

    const applyPool = () => {
        const f = EXERCISE_POOL.find(e => e.name === poolSel);
        if (f) setNewEx(n => ({ ...n, name: f.name, type: f.type as any, duration: f.defaultDur, steps: f.steps || [] }));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-5xl m-0 text-white">Edit Plans</h1>
                <button onClick={onClose} className="text-gray-500 text-3xl p-2 hover:text-white transition-colors">✕</button>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {Object.entries(plans).map(([key, p]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold heading-bebas tracking-widest ${activeTab === key ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white/5 text-gray-400 opacity-60'}`}
                    >
                        {p.emoji} {p.label}
                    </button>
                ))}
            </div>

            <div className="glass rounded-[32px] p-6 mb-8 border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl m-0 text-white">Exercises</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-transform"
                    >
                        +
                    </button>
                </div>

                <div className="space-y-3">
                    {plan.exercises.map((ex, i) => (
                        <div key={ex.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-4">
                                    <div className="text-xs text-gray-500 font-bold w-4">{i + 1}</div>
                                    <div>
                                        <div className="font-bold text-sm text-white">{ex.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{ex.duration}s · {ex.type}</div>
                                    </div>
                                </div>
                                <button onClick={() => removeEx(ex.id)} className="text-gray-600 hover:text-red-400 transition-colors p-2 text-sm">✕</button>
                            </div>
                            {ex.steps && ex.steps.length > 0 && (
                                <div className="ml-8 mt-2 space-y-1">
                                    {ex.steps.map((s, idx) => (
                                        <div key={idx} className="text-[10px] text-gray-400 flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-sm rounded-[40px] p-8 bg-[#121216] border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
                        <h3 className="text-3xl heading-bebas mb-6 text-white">Add Exercise</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-[.2em] font-bold block mb-2 px-1">Library</label>
                                <div className="flex gap-2">
                                    <select
                                        value={poolSel}
                                        onChange={e => setPoolSel(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary focus:outline-none appearance-none transition-colors text-white"
                                    >
                                        <option value="" className="bg-[#121216]">Library...</option>
                                        {EXERCISE_POOL.map(e => <option key={e.name} value={e.name} className="bg-[#121216]">{e.name}</option>)}
                                    </select>
                                    <button onClick={applyPool} className="px-4 bg-white/5 border border-white/10 rounded-2xl font-bold heading-bebas tracking-widest text-white">Apply</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-[.2em] font-bold block mb-2 px-1">Exercise Name</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary focus:outline-none transition-colors text-white"
                                    value={newEx.name}
                                    onChange={e => setNewEx(n => ({ ...n, name: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-[.2em] font-bold block mb-2 px-1">Type</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary focus:outline-none appearance-none transition-colors text-white"
                                        value={newEx.type}
                                        onChange={e => setNewEx(n => ({ ...n, type: e.target.value as any }))}
                                    >
                                        <option value="cardio" className="bg-[#121216]">Cardio</option>
                                        <option value="abs" className="bg-[#121216]">Abs</option>
                                        <option value="warmup" className="bg-[#121216]">Warm-up</option>
                                        <option value="strength" className="bg-[#121216]">Strength</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-[.2em] font-bold block mb-2 px-1">Duration (s)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary focus:outline-none transition-colors text-white"
                                        value={newEx.duration}
                                        onChange={e => setNewEx(n => ({ ...n, duration: +e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 text-gray-400 font-bold heading-bebas tracking-widest hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addEx}
                                disabled={!newEx.name}
                                className="flex-1 py-4 bg-primary rounded-2xl text-white font-bold heading-bebas tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
