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
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { WeightChart } from "./components/WeightChart";
import { AchievementsView } from "./components/AchievementsView";
import { ChallengesView } from "./components/ChallengesView";
import { CALISTHENICS_CHALLENGES, EXERCISE_POOL } from "./constants";

export default function App() {
  const [view, setView] = useState<"today" | "workouts" | "history" | "settings" | "trophies" | "challenges">("today");
  const [showEditor, setShowEditor] = useState(false);
  const [sessionPlan, setSessionPlan] = useState<string | null>(null);
  const [data, setData] = useState<DBData | null>(null);
  const [loading, setLoading] = useState(true);

  // Session settings
  const [withWarmup, setWithWarmup] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  // Settings edit state
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editGoal, setEditGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [editWaterGoal, setEditWaterGoal] = useState(false);
  const [newWaterGoal, setNewWaterGoal] = useState("");
  const [editWeight, setEditWeight] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  // Prevent accidental back navigation during workout
  useEffect(() => {
    if (sessionPlan) {
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [sessionPlan]);

  useEffect(() => {
    fetchDB().then(db => {
      if (!db) { setLoading(false); return; }

      const today = todayKey();
      const lastDate = db.profile.lastWaterDate;

      // If the app is opened on a new day (or first ever use), roll over water
      if (lastDate && lastDate !== today) {
        // Archive yesterday's consumption and reset for today
        const existingWaterHistory = db.waterHistory || {};
        const updatedWaterHistory = {
          ...existingWaterHistory,
          [lastDate]: db.profile.currentWater,
        };
        const resetProfile = {
          ...db.profile,
          currentWater: 0,
          lastWaterDate: today,
        };
        const rolloverUpdate = {
          waterHistory: updatedWaterHistory,
          profile: resetProfile,
        };
        // Apply locally and persist
        const updatedDB = { ...db, ...rolloverUpdate };
        setData(updatedDB);
        updateDB(rolloverUpdate);
      } else {
        // First time today — just stamp the date if missing
        if (!lastDate) {
          const stamp = { profile: { ...db.profile, lastWaterDate: today } };
          updateDB(stamp);
          setData({ ...db, profile: { ...db.profile, lastWaterDate: today }, waterHistory: db.waterHistory || {} });
        } else {
          setData({ ...db, waterHistory: db.waterHistory || {} });
        }
      }
      setLoading(false);
    });
  }, []);

  /** Compute streak from history — counts consecutive calendar days (backwards from today)
   *  that have at least one completed workout. Ignores future dates. */
  const computeStreak = (history: DBData["history"]): number => {
    let count = 0;
    const d = new Date();
    // Start checking from today
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (history[key] && history[key].length > 0) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  };

  const saveWorkout = async (planKey: string, mins: number) => {
    if (!data) return;
    try {
      const today = todayKey();
      const entry: WorkoutEntry = { planKey, mins, time: new Date().toISOString() };

      // Merge new entry with any existing entries for today
      const newHistory = {
        ...data.history,
        [today]: [...(data.history[today] || []), entry]
      };

      const newStreak = computeStreak(newHistory);

      // Achievement logic
      const unlocked = [...(data.achievements || [])];

      // Challenge progress logic
      const activeChallenges = { ...(data.activeChallenges || {}) };
      if (planKey.startsWith('challenge_')) {
        const challengeId = planKey.replace('challenge_', '').split('_day_')[0];
        if (activeChallenges[challengeId]) {
          activeChallenges[challengeId].currentDay += 1;
          if (activeChallenges[challengeId].currentDay > 7) { // Completion
            if (!unlocked.includes('cali_master')) unlocked.push('cali_master');
          }
        }
      }

      if (!unlocked.includes('first_workout')) unlocked.push('first_workout');
      if (newStreak >= 3 && !unlocked.includes('streak_3')) unlocked.push('streak_3');

      const hour = new Date().getHours();
      if (hour < 9 && !unlocked.includes('early_bird')) unlocked.push('early_bird');
      if (hour >= 21 && !unlocked.includes('night_owl')) unlocked.push('night_owl');

      const update = {
        history: newHistory,
        profile: { ...data.profile, streak: newStreak },
        achievements: unlocked,
        activeChallenges: activeChallenges
      };

      setData({ ...data, ...update });
      await updateDB(update);
      setSessionPlan(null);
    } catch (e) {
      console.error('Failed to save workout:', e);
      alert('Failed to save workout. Please try again.');
    }
  };

  const addWater = async (ml: number) => {
    if (!data) return;
    try {
      const newWater = data.profile.currentWater + ml;
      const update = {
        profile: {
          ...data.profile,
          currentWater: newWater,
          lastWaterDate: todayKey(), // keep date fresh on every log
        }
      };
      setData({ ...data, ...update });
      await updateDB(update);
    } catch (e) {
      console.error('Failed to update water intake:', e);
      alert('Failed to update water intake. Please try again.');
    }
  };

  const saveProfileField = async (field: string, value: any) => {
    if (!data) return;
    try {
      const update: any = {
        profile: {
          ...data.profile,
          [field]: value,
        }
      };

      // Special case for weight: also log to weightHistory
      if (field === 'currentWeight') {
        const today = todayKey();
        update.weightHistory = {
          ...(data.weightHistory || {}),
          [today]: value
        };

        const unlocked = [...(data.achievements || [])];
        if (!unlocked.includes('weight_logged')) {
          unlocked.push('weight_logged');
          update.achievements = unlocked;
        }
      }

      setData({ ...data, ...update });
      await updateDB(update);
    } catch (e) {
      console.error('Failed to save profile change:', e);
      alert('Failed to save changes. Please try again.');
    }
  };

  const startChallenge = async (challengeId: string) => {
    if (!data) return;
    const update = {
      activeChallenges: {
        ...(data.activeChallenges || {}),
        [challengeId]: { challengeId, currentDay: 1 }
      }
    };
    setData({ ...data, ...update });
    await updateDB(update);
  };

  const startChallengeWorkout = (challengeId: string) => {
    if (!data) return;
    const progress = data.activeChallenges?.[challengeId];
    if (!progress) return;

    const challenge = CALISTHENICS_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return;

    // Generate a specific plan for the challenge day
    const caliExercises = EXERCISE_POOL.filter(ex =>
      ex.name === "Pushups" ||
      ex.name === "Pullups" ||
      ex.name === "Dips" ||
      ex.name === "Squats" ||
      ex.name === "Plank" ||
      ex.name === "Pistol Squats" ||
      ex.name === "L-Sit"
    );

    // Pick random exercises but consistent per day seed
    const seed = progress.currentDay + challengeId.length;
    const dayExercises = [];
    for (let i = 0; i < challenge.exercisesPerDay; i++) {
      const idx = (seed + i) % caliExercises.length;
      const base = caliExercises[idx];
      dayExercises.push({
        id: `ch_${challengeId}_d${progress.currentDay}_e${i}`,
        name: base.name,
        type: base.type as any,
        duration: (base as any).defaultDur || 45,
        rest: 15,
        steps: (base as any).steps
      });
    }

    const tempPlan: any = { // Using 'any' for Plan type as it's not fully defined here
      label: `${challenge.title} - Day ${progress.currentDay}`,
      color: "#7B61FF",
      exercises: dayExercises
    };

    // Use a special key to track challenge progression on completion
    const specialKey = `challenge_${challengeId}_day_${progress.currentDay}`;

    // Bypass the normal plans and start session directly
    setSessionPlan(specialKey);
    // Since sessionPlan is just a key, we need to handle the plan lookup in the render or inject it.
    // In our current page logic, sessionPlan triggers a lookup in data.plans[sessionPlan].
    // Let's hack it for now by injecting it into a temp state or data.plans.
    setData({
      ...data,
      plans: {
        ...data.plans,
        [specialKey]: tempPlan
      }
    });
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
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          overflow: 'hidden',
          overscrollBehavior: 'contain'
        }}
      >
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
      </div>
    );
  }

  const todayDone = (data.history[todayKey()] || []).map(w => w.planKey);

  return (
    <Wrapper>
      <PWAInstallPrompt />
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

                <JourneyProgress profile={data.profile} history={data.history} />
                <WaterTracker current={data.profile.currentWater} goal={data.profile.waterGoal} waterHistory={data.waterHistory} onAdd={addWater} />

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

            {view === "history" && (
              <div className="space-y-8">
                <HistoryView history={data.history} plans={data.plans} onClose={() => setView("today")} />
                {data.weightHistory && Object.keys(data.weightHistory).length > 0 && (
                  <div className="glass rounded-[32px] p-6 border-white/5 bg-white/[0.02]">
                    <WeightChart data={data.weightHistory} />
                  </div>
                )}
              </div>
            )}

            {view === "trophies" && <AchievementsView unlockedIds={data.achievements || []} />}

            {view === "challenges" && (
              <ChallengesView
                activeChallenges={data.activeChallenges || {}}
                onStartChallenge={startChallenge}
                onStartWorkout={startChallengeWorkout}
              />
            )}

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

                  {/* Name */}
                  <div className="py-4 border-b border-white/5">
                    {editName ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                          placeholder="Enter name"
                        />
                        <button
                          onClick={async () => {
                            await saveProfileField("name", newName);
                            setEditName(false);
                          }}
                          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditName(false)}
                          className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Name</span>
                        <button
                          onClick={() => {
                            setNewName(data.profile.name);
                            setEditName(true);
                          }}
                          className="font-bold text-sm tracking-wide text-white hover:text-primary transition-colors"
                        >
                          {data.profile.name} ✎
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Goal */}
                  <div className="py-4 border-b border-white/5">
                    {editGoal ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGoal}
                          onChange={e => setNewGoal(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                          placeholder="e.g., Weight Loss, Muscle Gain"
                        />
                        <button
                          onClick={async () => {
                            await saveProfileField("goal", newGoal);
                            setEditGoal(false);
                          }}
                          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditGoal(false)}
                          className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Main Goal</span>
                        <button
                          onClick={() => {
                            setNewGoal(data.profile.goal);
                            setEditGoal(true);
                          }}
                          className="font-bold text-sm tracking-wide text-white hover:text-primary transition-colors"
                        >
                          {data.profile.goal} ✎
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Current Weight */}
                  <div className="py-4 border-b border-white/5">
                    {editWeight ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newWeight}
                          onChange={e => setNewWeight(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                          placeholder="Weight in kg"
                        />
                        <button
                          onClick={async () => {
                            await saveProfileField("currentWeight", parseFloat(newWeight));
                            setEditWeight(false);
                          }}
                          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditWeight(false)}
                          className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Current Weight</span>
                        <button
                          onClick={() => {
                            setNewWeight(data.profile.currentWeight.toString());
                            setEditWeight(true);
                          }}
                          className="font-bold text-sm tracking-wide text-white hover:text-primary transition-colors"
                        >
                          {data.profile.currentWeight} kg ✎
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Water Goal */}
                  <div className="py-4">
                    {editWaterGoal ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newWaterGoal}
                          onChange={e => setNewWaterGoal(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                          placeholder="Water goal in ml"
                        />
                        <button
                          onClick={async () => {
                            await saveProfileField("waterGoal", parseInt(newWaterGoal));
                            setEditWaterGoal(false);
                          }}
                          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditWaterGoal(false)}
                          className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Water Goal</span>
                        <button
                          onClick={() => {
                            setNewWaterGoal(data.profile.waterGoal.toString());
                            setEditWaterGoal(true);
                          }}
                          className="font-bold text-sm tracking-wide text-white hover:text-primary transition-colors"
                        >
                          {data.profile.waterGoal} ml ✎
                        </button>
                      </div>
                    )}
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
          <NavBtn active={view === "challenges"} icon="⚡" label="Challenge" onClick={() => setView("challenges")} />
          <NavBtn active={view === "workouts"} icon="💪" label="Workouts" onClick={() => setView("workouts")} />
          <NavBtn active={view === "trophies"} icon="🏆" label="Badges" onClick={() => setView("trophies")} />
          <NavBtn active={view === "history"} icon="📈" label="History" onClick={() => setView("history")} />
          <NavBtn active={view === "settings"} icon="⚙️" label="Settings" onClick={() => setView("settings")} />
        </nav>
      )}
    </Wrapper>
  );
}
