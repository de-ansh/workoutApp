"use client";
import React, { useState, useEffect } from "react";

// Types
import { DBData, WorkoutEntry } from "./types";



// Libs
import { fetchDB, updateDB } from "./lib/db";
import { todayKey } from "./lib/utils";

// UI Components
import { Wrapper, NavBtn, Toggle, Tag } from "./components/UI";
import { JourneyProgress } from "./components/JourneyProgress";
import { WaterTracker } from "./components/WaterTracker";
import { HistoryView } from "./components/HistoryView";
import { WorkoutSession } from "./components/WorkoutSession";
import { PlanEditor } from "./components/PlanEditor";

export default function App() {
  const [view, setView] = useState<"today" | "workouts" | "history" | "settings">("today");
  const [showEditor, setShowEditor] = useState(false);
  const [sessionPlan, setSessionPlan] = useState<string | null>(null);
  const [data, setData] = useState<DBData | null>(null);
  const [loading, setLoading] = useState(true);

  // Session settings
  const [withWarmup, setWithWarmup] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    fetchDB().then(db => {
      if (db) setData(db);
      setLoading(false);
    });
  }, []);

  const saveWorkout = async (planKey: string, mins: number) => {
    if (!data) return;
    const today = todayKey();
    const entry: WorkoutEntry = { planKey, mins, time: new Date().toISOString() };

    const newHistory = { ...data.history, [today]: [...(data.history[today] || []), entry] };
    const newStreak = (data.profile.streak || 0) + 1;

    const update = {
      history: newHistory,
      profile: { ...data.profile, streak: newStreak }
    };

    setData({ ...data, ...update });
    await updateDB(update);
    setSessionPlan(null);
  };

  const addWater = async (ml: number) => {
    if (!data) return;
    const newWater = data.profile.currentWater + ml;
    const update = { profile: { ...data.profile, currentWater: newWater } };
    setData({ ...data, ...update });
    await updateDB(update);
  };

  if (loading || !data) {
    return (
      <Wrapper>
        <div className="flex items-center justify-center min-h-[60vh] text-primary animate-pulse font-bold heading-bebas tracking-widest text-2xl">
          Loading Your Journey...
        </div>
      </Wrapper>
    );
  }

  if (sessionPlan) {
    const plan = data.plans[sessionPlan];
    if (!plan) return null;
    return (
      <Wrapper>
        <WorkoutSession
          plan={plan}
          planKey={sessionPlan}
          withWarmup={withWarmup}
          soundOn={soundOn}
          onExit={() => setSessionPlan(null)}
          onComplete={saveWorkout}
        />
      </Wrapper>
    );
  }

  const todayDone = (data.history[todayKey()] || []).map(w => w.planKey);

  return (
    <Wrapper>
      <div className="pb-24">
        {showEditor ? (
          <PlanEditor
            plans={data.plans}
            setPlans={(p) => setData({ ...data, plans: p })}
            onClose={() => setShowEditor(false)}
          />
        ) : (
          <>
            {view === "today" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-primary text-[10px] uppercase font-bold tracking-[.3em] mb-2">My Journey</div>
                    <h1 className="text-5xl leading-none m-0 text-white">Hi, {data.profile.name}!</h1>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl py-2 px-4 text-center">
                    <div className="text-warning text-lg heading-bebas">Today</div>
                    <div className="text-[10px] text-gray-500 uppercase">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                  </div>
                </div>

                <JourneyProgress profile={data.profile} />
                <WaterTracker current={data.profile.currentWater} goal={data.profile.waterGoal} onAdd={addWater} />

                <div className="glass rounded-[32px] p-6 mb-8 premium-gradient soft-shadow relative overflow-hidden">
                  <div className="relative z-10 text-white">
                    <h3 className="text-xl mb-2">Daily Motivation</h3>
                    <p className="text-sm italic opacity-90 leading-relaxed">
                      "{data.dailyTips[Math.floor(Math.random() * data.dailyTips.length)]}"
                    </p>
                  </div>
                  <div className="absolute top-[-10px] right-[-10px] text-8xl opacity-10 rotate-12">✨</div>
                </div>
              </div>
            )}

            {view === "workouts" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-end mb-8">
                  <h1 className="text-5xl leading-none m-0 text-white">Workouts</h1>
                  <Toggle label="Warm-Up" active={withWarmup} onClick={() => setWithWarmup(!withWarmup)} />
                </div>
                <div className="space-y-4">
                  {Object.entries(data.plans).map(([key, plan]) => {
                    const done = todayDone.includes(key);
                    return (
                      <div key={key} className={`glass rounded-[32px] overflow-hidden border transition-all duration-300 ${done ? 'border-primary/40' : 'border-white/10'} hover:border-primary/20 bg-white/[0.01]`}>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="text-3xl bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-sm">
                              {plan.emoji}
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{plan.difficulty}</div>
                              <div className="text-primary font-bold heading-bebas text-xl">{plan.duration ? Math.round(plan.duration / 60) : 15} MIN</div>
                            </div>
                          </div>
                          <h3 className="text-2xl m-0 mb-4 text-white">{plan.label}</h3>
                          <div className="flex gap-2">
                            <Tag color={plan.color}>{plan.exercises.length} Exercises</Tag>
                            <Tag color="#888">{plan.equipment}</Tag>
                          </div>
                        </div>
                        <button
                          onClick={() => setSessionPlan(key)}
                          className={`w-full py-5 text-center font-bold text-lg heading-bebas tracking-widest active:scale-[0.98] transition-all ${done ? 'bg-white/5 text-primary' : 'bg-primary text-white'}`}
                        >
                          {done ? "Completed — Go Again?" : "Start Workout"}
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setShowEditor(true)}
                    className="w-full py-6 rounded-[32px] border-2 border-dashed border-white/5 flex items-center justify-center gap-3 text-gray-500 hover:text-white hover:border-white/10 transition-all font-bold heading-bebas tracking-widest"
                  >
                    <span>⚙️</span> Customize Plans
                  </button>
                </div>
              </div>
            )}

            {view === "history" && <HistoryView history={data.history} plans={data.plans} onClose={() => setView("today")} />}

            {view === "settings" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-5xl leading-none mb-8 m-0 text-white">Settings</h1>
                <div className="glass rounded-[32px] p-6 mb-4 border-white/5 bg-white/[0.02]">
                  <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4 px-1">Audio & Haptics</h3>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-sm text-white">Session Sounds</span>
                    <Toggle label={soundOn ? "On" : "Off"} active={soundOn} onClick={() => setSoundOn(!soundOn)} />
                  </div>
                </div>
                <div className="glass rounded-[32px] p-6 border-white/5 bg-white/[0.02]">
                  <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4 px-1">Profile</h3>
                  <div className="py-4 border-b border-white/5 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Name</span>
                    <span className="font-bold text-sm tracking-wide text-white">{data.profile.name}</span>
                  </div>
                  <div className="py-4 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Main Goal</span>
                    <span className="font-bold text-sm tracking-wide text-white">{data.profile.goal}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!showEditor && (
        <nav className="fixed bottom-6 left-6 right-6 h-20 glass-dark rounded-[24px] flex items-center justify-around px-2 z-50 shadow-2xl border border-white/5">
          <NavBtn active={view === "today"} icon="🎯" label="Today" onClick={() => setView("today")} />
          <NavBtn active={view === "workouts"} icon="💪" label="Workouts" onClick={() => setView("workouts")} />
          <NavBtn active={view === "history"} icon="📈" label="History" onClick={() => setView("history")} />
          <NavBtn active={view === "settings"} icon="⚙️" label="Settings" onClick={() => setView("settings")} />
        </nav>
      )}
    </Wrapper>
  );
}
