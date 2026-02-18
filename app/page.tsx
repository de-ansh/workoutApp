"use client";
import React, { useState, useEffect, useRef, useCallback, CSSProperties } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Exercise {
  id: number | string;
  name: string;
  duration: number;
  type: "cardio" | "abs" | "warmup";
  rest: number;
}

interface Plan {
  label: string;
  emoji?: string;
  color: string;
  exercises: Exercise[];
}

type Plans = Record<string, Plan>;

interface ExercisePoolItem {
  name: string;
  type: "cardio" | "abs";
  defaultDur: number;
}

interface WorkoutEntry {
  planKey: string;
  mins: number;
  time: string;
}

type History = Record<string, WorkoutEntry[]>;

// ─── SOUND ENGINE ─────────────────────────────────────────────────────────────

function createBeep(ctx: AudioContext, freq: number, dur: number, vol = 0.4, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

const playCountdown = (ctx: AudioContext) => { createBeep(ctx, 880, 0.15, 0.3); };
const playGo = (ctx: AudioContext) => {
  createBeep(ctx, 523, 0.12, 0.4);
  setTimeout(() => createBeep(ctx, 784, 0.2, 0.5), 130);
  setTimeout(() => createBeep(ctx, 1047, 0.3, 0.6), 260);
};
const playRest = (ctx: AudioContext) => {
  createBeep(ctx, 440, 0.2, 0.35);
  setTimeout(() => createBeep(ctx, 330, 0.25, 0.3), 200);
};
const playDone = (ctx: AudioContext) => {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => createBeep(ctx, f, 0.2, 0.5), i * 120));
};

// ─── DATA ────────────────────────────────────────────────────────────────────

const WARMUP_EXERCISES: Exercise[] = [
  { id: "w1", name: "Neck Rolls", duration: 20, type: "warmup", rest: 5 },
  { id: "w2", name: "Arm Circles", duration: 25, type: "warmup", rest: 5 },
  { id: "w3", name: "Hip Circles", duration: 25, type: "warmup", rest: 5 },
  { id: "w4", name: "Leg Swings", duration: 30, type: "warmup", rest: 5 },
  { id: "w5", name: "Torso Twists", duration: 25, type: "warmup", rest: 5 },
  { id: "w6", name: "March in Place", duration: 40, type: "warmup", rest: 10 },
];

const DEFAULT_PLANS: Plans = {
  morning: {
    label: "Morning",
    emoji: "☀️",
    color: "#FF6B35",
    exercises: [
      { id: 1, name: "Jump Rope", duration: 120, type: "cardio", rest: 15 },
      { id: 2, name: "High Knees", duration: 45, type: "cardio", rest: 15 },
      { id: 3, name: "Burpees", duration: 40, type: "cardio", rest: 20 },
      { id: 4, name: "Plank", duration: 60, type: "abs", rest: 15 },
      { id: 5, name: "Bicycle Crunches", duration: 45, type: "abs", rest: 15 },
      { id: 6, name: "Leg Raises", duration: 40, type: "abs", rest: 15 },
      { id: 7, name: "Russian Twists", duration: 40, type: "abs", rest: 15 },
      { id: 8, name: "Mountain Climbers", duration: 45, type: "cardio", rest: 20 },
    ],
  },
  postgym: {
    label: "Post-Gym",
    emoji: "💪",
    color: "#00D4AA",
    exercises: [
      { id: 1, name: "Flex  Rower", duration: 500, type: "cardio", rest: 30 },
      { id: 2, name: "Box Jumps", duration: 45, type: "cardio", rest: 20 },
      { id: 3, name: "Dead Bug", duration: 45, type: "abs", rest: 15 },
      { id: 4, name: "Cable Crunches", duration: 40, type: "abs", rest: 15 },
      { id: 5, name: "Hanging Knee Raise", duration: 40, type: "abs", rest: 20 },
      { id: 6, name: "Reverse Crunches", duration: 45, type: "abs", rest: 15 },
      { id: 7, name: "Hollow Body Hold", duration: 45, type: "abs", rest: 15 },
      { id: 8, name: "Heel Touches", duration: 40, type: "abs", rest: 10 },
      { id: 9, name: "Side Plank (L)", duration: 30, type: "abs", rest: 10 },
      { id: 10, name: "Side Plank (R)", duration: 30, type: "abs", rest: 10 },
      { id: 11, name: "Flutter Kicks", duration: 40, type: "abs", rest: 15 },
    ],
  },
};

const EXERCISE_POOL: ExercisePoolItem[] = [
  { name: "Jump Rope", type: "cardio", defaultDur: 120 },
  { name: "High Knees", type: "cardio", defaultDur: 45 },
  { name: "Burpees", type: "cardio", defaultDur: 40 },
  { name: "Mountain Climbers", type: "cardio", defaultDur: 45 },
  { name: "Box Jumps", type: "cardio", defaultDur: 45 },
  { name: "Jumping Jacks", type: "cardio", defaultDur: 60 },
  { name: "Sprint in Place", type: "cardio", defaultDur: 30 },
  { name: "Treadmill Walk", type: "cardio", defaultDur: 180 },
  { name: "Plank", type: "abs", defaultDur: 60 },
  { name: "Bicycle Crunches", type: "abs", defaultDur: 45 },
  { name: "Leg Raises", type: "abs", defaultDur: 40 },
  { name: "Russian Twists", type: "abs", defaultDur: 40 },
  { name: "Dead Bug", type: "abs", defaultDur: 45 },
  { name: "Flutter Kicks", type: "abs", defaultDur: 40 },
  { name: "Hanging Knee Raise", type: "abs", defaultDur: 40 },
  { name: "Side Plank (L)", type: "abs", defaultDur: 30 },
  { name: "Side Plank (R)", type: "abs", defaultDur: 30 },
  { name: "V-Ups", type: "abs", defaultDur: 30 },
  { name: "Cable Crunches", type: "abs", defaultDur: 40 },
  { name: "Hollow Body Hold", type: "abs", defaultDur: 45 },
  { name: "Bird Dog", type: "abs", defaultDur: 45 },
  { name: "Heel Touches", type: "abs", defaultDur: 40 },
  { name: "Scissor Kicks", type: "abs", defaultDur: 40 },
  { name: "Windshield Wipers", type: "abs", defaultDur: 30 },
  { name: "Reverse Crunches", type: "abs", defaultDur: 45 },
];

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const todayKey = () => new Date().toISOString().slice(0, 10);

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, val: T): void {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val));
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

interface CircularTimerProps {
  current: number;
  total: number;
  isRest: boolean;
  isRunning: boolean;
  color?: string;
}

function CircularTimer({ current, total, isRest, isRunning, color = "#00D4AA" }: CircularTimerProps) {
  const r = 88;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? current / total : 0;
  const dash = circ * pct;
  const stroke = isRest ? "#FFD700" : isRunning ? color : "#555";

  return (
    <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto" }}>
      <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle cx="110" cy="110" r={r} fill="none" stroke={stroke} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: isRest ? "#FFD700" : "#666", textTransform: "uppercase", marginBottom: 2 }}>
          {isRest ? "Rest" : "Active"}
        </div>
        <div style={{ fontSize: 54, fontFamily: "'Bebas Neue', sans-serif", color: "#fff", lineHeight: 1, letterSpacing: 2 }}>
          {fmt(current)}
        </div>
        {!isRest && <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>of {fmt(total)}</div>}
      </div>
    </div>
  );
}

interface WorkoutSessionProps {
  plan: Plan;
  planKey: string;
  withWarmup: boolean;
  soundOn: boolean;
  onExit: () => void;
  onComplete: (planKey: string, mins: number) => void;
}

function WorkoutSession({ plan, planKey, withWarmup, soundOn, onExit, onComplete }: WorkoutSessionProps) {
  const allExercises = withWarmup
    ? [...WARMUP_EXERCISES, ...plan.exercises]
    : plan.exercises;

  const warmupEnd = withWarmup ? WARMUP_EXERCISES.length : 0;

  const [exIdx, setExIdx] = useState(0);
  const [isRest, setIsRest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(allExercises[0]?.duration || 0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  const getAudio = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const currentEx = allExercises[exIdx];
  const total = isRest ? currentEx?.rest || 0 : currentEx?.duration || 0;
  const isWarmupPhase = exIdx < warmupEnd;

  const advance = useCallback(() => {
    if (isRest) {
      const next = exIdx + 1;
      if (next >= allExercises.length) { setRunning(false); setDone(true); if (soundOn) playDone(getAudio()); return; }
      setExIdx(next);
      setIsRest(false);
      setTimeLeft(allExercises[next].duration);
      if (soundOn) playGo(getAudio());
    } else {
      if (currentEx?.rest > 0) {
        setIsRest(true);
        setTimeLeft(currentEx.rest);
        if (soundOn) playRest(getAudio());
      } else {
        const next = exIdx + 1;
        if (next >= allExercises.length) { setRunning(false); setDone(true); if (soundOn) playDone(getAudio()); return; }
        setExIdx(next);
        setTimeLeft(allExercises[next].duration);
        if (soundOn) playGo(getAudio());
      }
    }
  }, [isRest, exIdx, allExercises, currentEx, soundOn, getAudio]);

  useEffect(() => {
    if (running && !done) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 3 && t > 1 && !isRest && soundOn) playCountdown(getAudio());
          if (t <= 1) { advance(); return 0; }
          return t - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, done, advance, isRest, soundOn, getAudio]);

  const handleStart = () => {
    if (soundOn) playGo(getAudio());
    setRunning(true);
  };

  const skip = () => { advance(); };

  const totalTime = allExercises.reduce((a, e) => a + e.duration + e.rest, 0);
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const progressPct = Math.round(((exIdx) / allExercises.length) * 100);

  if (done) {
    const mins = Math.round(elapsed / 60);
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 70, marginBottom: 8 }}>🔥</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 46, color: plan.color, margin: 0 }}>CRUSHED IT</h2>
        <p style={{ color: "#666", margin: "8px 0 28px", fontSize: 15 }}>
          {plan.exercises.length} exercises · ~{mins} min
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
          {[
            { label: "Cardio", val: plan.exercises.filter(e => e.type === "cardio").length, c: "#FF6B35" },
            { label: "Abs", val: plan.exercises.filter(e => e.type === "abs").length, c: "#00D4AA" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", borderRadius: 14, padding: "14px 24px", border: `1px solid ${s.c}33` }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: s.c }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => onComplete(planKey, mins)} style={{
          width: "100%", padding: 16, borderRadius: 14, border: "none",
          background: plan.color, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
          marginBottom: 10
        }}>Save & Go Home 🏠</button>
        <button onClick={onExit} style={{ background: "none", border: "none", color: "#555", fontSize: 14, cursor: "pointer" }}>Exit without saving</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={onExit} style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          {isWarmupPhase && (
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 3 }}>Warm-Up Phase</div>
          )}
          <div style={{ background: "#1a1a1a", borderRadius: 99, height: 5, overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: isWarmupPhase ? "#888" : plan.color, borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 10, color: "#444" }}>{exIdx}/{allExercises.length}</span>
            <span style={{ fontSize: 10, color: "#444" }}>{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Exercise Name */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: isWarmupPhase ? "#888" : (currentEx?.type === "cardio" ? "#FF6B35" : "#00D4AA"), textTransform: "uppercase", marginBottom: 4 }}>
          {currentEx?.type}
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: "#fff", margin: 0, letterSpacing: 1 }}>
          {currentEx?.name}
        </h2>
      </div>

      {/* Timer */}
      <CircularTimer current={timeLeft} total={total} isRest={isRest} isRunning={running} color={plan.color} />

      {/* Controls */}
      <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "center", marginTop: 28 }}>
        <button onClick={skip} style={iconBtnStyle("#1a1a1a")}>⏭</button>
        <button onClick={running ? () => setRunning(false) : handleStart} style={{
          width: 76, height: 76, borderRadius: "50%",
          background: running ? "#1a1a1a" : plan.color,
          border: running ? `2px solid ${plan.color}` : "none",
          color: "#fff", fontSize: 30, cursor: "pointer",
          boxShadow: running ? "none" : `0 0 30px ${plan.color}66`,
          transition: "all 0.2s"
        }}>
          {running ? "⏸" : "▶"}
        </button>
        <button onClick={() => { setExIdx(0); setIsRest(false); setTimeLeft(allExercises[0].duration); setRunning(false); }} style={iconBtnStyle("#1a1a1a")}>↺</button>
      </div>

      {/* Up Next */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", marginBottom: 10 }}>Up Next</div>
        {allExercises.slice(exIdx + 1, exIdx + 4).map((ex, i) => {
          const typeColor = ex.type === "warmup" ? "#888" : ex.type === "cardio" ? "#FF6B35" : "#00D4AA";
          return (
            <div key={`${ex.id}-${i}`} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", background: "#0f0f0f", borderRadius: 10, marginBottom: 6,
              borderLeft: `3px solid ${typeColor}`, opacity: 1 - i * 0.2
            }}>
              <div>
                <span style={{ color: "#ccc", fontSize: 14 }}>{ex.name}</span>
                <span style={{ marginLeft: 8, fontSize: 10, color: typeColor }}>{ex.type}</span>
              </div>
              <span style={{ color: "#555", fontSize: 12, fontFamily: "monospace" }}>{fmt(ex.duration)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HISTORY VIEW ─────────────────────────────────────────────────────────────

interface HistoryViewProps {
  history: History;
  plans: Plans;
  onClose: () => void;
}

function HistoryView({ history, plans, onClose }: HistoryViewProps) {
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#fff", margin: 0 }}>History</h2>
        <button onClick={onClose} aria-label="Close History" style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer" }}>✕</button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Day Streak", val: `${streak}🔥`, color: "#FF6B35" },
          { label: "Total", val: `${totalWorkouts}`, color: "#00D4AA" },
          { label: "Minutes", val: `${totalMins}`, color: "#FFD700" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#111", borderRadius: 14, padding: "14px 10px", textAlign: "center", border: `1px solid ${s.color}22` }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Calendar heatmap (last 28 days) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#444", textTransform: "uppercase", marginBottom: 10 }}>Last 28 Days</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (27 - i));
            const key = d.toISOString().slice(0, 10);
            const count = history[key]?.length || 0;
            return (
              <div key={key} title={key} style={{
                aspectRatio: "1", borderRadius: 5,
                background: count === 0 ? "#111" : count === 1 ? "#1a4a3a" : "#00D4AA",
                border: key === todayKey() ? "1px solid #00D4AA" : "1px solid transparent",
                transition: "background 0.2s"
              }} />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "#333" }}>4 weeks ago</span>
          <span style={{ fontSize: 10, color: "#333" }}>Today</span>
        </div>
      </div>

      {/* Log entries */}
      {entries.length === 0 ? (
        <div style={{ textAlign: "center", color: "#444", padding: 40, fontSize: 14 }}>
          No workouts yet. Complete one to see history!
        </div>
      ) : entries.map(([date, workouts]) => (
        <div key={date} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
            {formatDate(date)}
          </div>
          {workouts.map((w, i) => {
            const plan = plans[w.planKey];
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", background: "#111", borderRadius: 12, marginBottom: 6,
                borderLeft: `3px solid ${plan?.color || "#555"}`
              }}>
                <div style={{ fontSize: 22 }}>{plan?.emoji || "🏋️"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#ddd", fontSize: 14, fontWeight: 600 }}>{plan?.label || w.planKey}</div>
                  <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>
                    {w.mins ? `~${w.mins} min` : "completed"} · {new Date(w.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div style={{ fontSize: 20 }}>✅</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── PLAN EDITOR ──────────────────────────────────────────────────────────────

interface PlanEditorProps {
  plans: Plans;
  setPlans: React.Dispatch<React.SetStateAction<Plans>>;
  onClose: () => void;
}

function PlanEditor({ plans, setPlans, onClose }: PlanEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("morning");
  const [showModal, setShowModal] = useState(false);
  const [newEx, setNewEx] = useState<Omit<Exercise, 'id'>>({ name: "", type: "cardio", duration: 45, rest: 15 });
  const [poolSel, setPoolSel] = useState("");

  const plan = plans[activeTab];
  const removeEx = (id: number | string) => setPlans(p => ({ ...p, [activeTab]: { ...p[activeTab], exercises: p[activeTab].exercises.filter(e => e.id !== id) } }));
  const addEx = () => {
    const ex: Exercise = { ...newEx, id: Date.now() };
    setPlans(p => ({ ...p, [activeTab]: { ...p[activeTab], exercises: [...p[activeTab].exercises, ex] } }));
    setShowModal(false);
    setNewEx({ name: "", type: "cardio", duration: 45, rest: 15 });
  };
  const applyPool = () => {
    const f = EXERCISE_POOL.find(e => e.name === poolSel);
    if (f) setNewEx(n => ({ ...n, name: f.name, type: f.type, duration: f.defaultDur }));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: "#fff", margin: 0 }}>Plan Editor</h2>
        <button onClick={onClose} aria-label="Close Editor" style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {Object.entries(plans).map(([key, p]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
            background: activeTab === key ? p.color : "#111",
            color: activeTab === key ? "#fff" : "#555",
            fontWeight: 600, fontSize: 13, transition: "all 0.2s"
          }}>{p.emoji} {p.label}</button>
        ))}
      </div>

      {plan.exercises.map((ex) => (
        <div key={ex.id} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 14px", background: "#111", borderRadius: 10, marginBottom: 8,
          borderLeft: `3px solid ${ex.type === "cardio" ? "#FF6B35" : "#00D4AA"}`
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#ddd", fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{fmt(ex.duration)} · {ex.rest}s rest</div>
          </div>
          <button onClick={() => removeEx(ex.id)} aria-label={`Remove ${ex.name}`} style={{ background: "none", border: "none", color: "#333", fontSize: 18, cursor: "pointer" }}>🗑</button>
        </div>
      ))}

      <button onClick={() => setShowModal(true)} style={{
        width: "100%", padding: 14, marginTop: 8, borderRadius: 12,
        border: `2px dashed ${plan.color}44`, background: "transparent",
        color: plan.color, fontSize: 15, cursor: "pointer"
      }}>+ Add Exercise</button>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 999, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#0f0f0f", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, margin: "0 auto", padding: 24 }}>
            <h3 style={{ color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, marginBottom: 16 }}>Add Exercise</h3>
            <label style={labelStyle}>From library</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <select value={poolSel} onChange={e => setPoolSel(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
                <option value="">— pick one —</option>
                {EXERCISE_POOL.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
              </select>
              <button onClick={applyPool} style={btnStyle("#222", "#fff")}>Apply</button>
            </div>
            <label style={labelStyle}>Name</label>
            <input value={newEx.name} onChange={e => setNewEx(n => ({ ...n, name: e.target.value }))} style={inputStyle} placeholder="Custom name" />
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Type</label>
                <select value={newEx.type} onChange={e => setNewEx(n => ({ ...n, type: e.target.value as "cardio" | "abs" }))} style={selectStyle}>
                  <option value="cardio">Cardio</option>
                  <option value="abs">Abs</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Duration (s)</label>
                <input type="number" value={newEx.duration} onChange={e => setNewEx(n => ({ ...n, duration: +e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Rest (s)</label>
                <input type="number" value={newEx.rest} onChange={e => setNewEx(n => ({ ...n, rest: +e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ ...btnStyle("#1a1a1a", "#888"), flex: 1 }}>Cancel</button>
              <button onClick={addEx} disabled={!newEx.name} style={{ ...btnStyle(plan.color, "#fff"), flex: 1, opacity: newEx.name ? 1 : 0.4 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<"home" | "session" | "plan" | "history">("home");
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plans>(DEFAULT_PLANS);
  const [withWarmup, setWithWarmup] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [history, setHistory] = useState<History>({});

  useEffect(() => {
    setHistory(getStorage<History>("workout_history", {}));
    const savedPlans = getStorage<Plans | null>("workout_plans", null);
    if (savedPlans) setPlans(savedPlans);
  }, []);

  useEffect(() => {
    if (Object.keys(plans).length) setStorage("workout_plans", plans);
  }, [plans]);

  const saveWorkout = (planKey: string, mins: number) => {
    const today = todayKey();
    const entry: WorkoutEntry = { planKey, mins, time: new Date().toISOString() };
    setHistory(h => {
      const updated = { ...h, [today]: [...(h[today] || []), entry] };
      setStorage("workout_history", updated);
      return updated;
    });
    setView("home");
  };

  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (history[key]) { count++; d.setDate(d.getDate() - 1); } else break;
    }
    return count;
  })();

  const todayDone = (history[todayKey()] || []).map(w => w.planKey);

  if (view === "session" && activePlan) {
    return (
      <Wrapper>
        <WorkoutSession
          plan={plans[activePlan]}
          planKey={activePlan}
          withWarmup={withWarmup}
          soundOn={soundOn}
          onExit={() => setView("home")}
          onComplete={saveWorkout}
        />
      </Wrapper>
    );
  }

  if (view === "plan") return <Wrapper><PlanEditor plans={plans} setPlans={setPlans} onClose={() => setView("home")} /></Wrapper>;
  if (view === "history") return <Wrapper><HistoryView history={history} plans={plans} onClose={() => setView("home")} /></Wrapper>;

  return (
    <Wrapper>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#FF6B35", textTransform: "uppercase", marginBottom: 6 }}>Daily Grind</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, color: "#fff" }}>CARDIO +<br />ABS</h1>
          <p style={{ color: "#444", marginTop: 6, fontSize: 13 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <button onClick={() => setView("history")} aria-label="View History" style={{
            background: "#111", border: "1px solid #1e1e1e", borderRadius: 12,
            color: "#fff", padding: "8px 14px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6
          }}>
            📅 <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#FF6B35" }}>{streak}</span>
            <span style={{ color: "#555", fontSize: 11 }}>day streak</span>
          </button>
        </div>
      </div>

      {/* Settings row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Toggle label="🔥 Warm-Up" active={withWarmup} onClick={() => setWithWarmup(w => !w)} />
        <Toggle label={soundOn ? "🔊 Sound On" : "🔇 Muted"} active={soundOn} onClick={() => setSoundOn(s => !s)} />
      </div>

      {/* Plan cards */}
      {Object.entries(plans).map(([key, plan]) => {
        const tt = plan.exercises.reduce((a, e) => a + e.duration + e.rest, 0);
        const warmupExtra = withWarmup ? WARMUP_EXERCISES.reduce((a, e) => a + e.duration + e.rest, 0) : 0;
        const cardio = plan.exercises.filter(e => e.type === "cardio").length;
        const abs = plan.exercises.filter(e => e.type === "abs").length;
        const done = todayDone.includes(key);

        return (
          <div key={key} style={{
            background: "#0f0f0f", borderRadius: 20, marginBottom: 14,
            overflow: "hidden", border: `1px solid ${done ? plan.color + "44" : "#1a1a1a"}`,
            transition: "border 0.3s"
          }}>
            <div style={{ background: `linear-gradient(135deg, ${plan.color}18 0%, transparent 55%)`, padding: "20px 20px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#fff", lineHeight: 1 }}>
                    {plan.emoji} {plan.label}
                  </div>
                  {done && <div style={{ fontSize: 11, color: plan.color, marginTop: 4 }}>✓ Done today</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 18, color: plan.color }}>{fmt(tt + warmupExtra)}</div>
                  {withWarmup && <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>+ warmup</div>}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, margin: "14px 0 16px", flexWrap: "wrap" }}>
                <Tag color="#FF6B35">{cardio} Cardio</Tag>
                <Tag color="#00D4AA">{abs} Abs</Tag>
                {withWarmup && <Tag color="#888">{WARMUP_EXERCISES.length} Warmup</Tag>}
              </div>
            </div>

            <div style={{ display: "flex", borderTop: "1px solid #1a1a1a" }}>
              <button onClick={() => { setActivePlan(key); setView("session"); }} style={{
                flex: 2, padding: 15, background: done ? "#1a1a1a" : plan.color, border: "none",
                color: done ? plan.color : "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                letterSpacing: 1, transition: "all 0.2s"
              }}>{done ? "▶ Again" : "▶ Start"}</button>
              <button onClick={() => { setActivePlan(key); setView("plan"); }} aria-label={`Edit ${plan.label} Plan`} style={{
                flex: 1, padding: 15, background: "transparent", border: "none",
                borderLeft: "1px solid #1a1a1a", color: "#555", fontSize: 14, cursor: "pointer"
              }}>Edit</button>
            </div>
          </div>
        );
      })}

      {/* Bottom stats */}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        {[
          { label: "Streak", val: `${streak}🔥` },
          { label: "Today", val: `${todayDone.length}/2` },
          { label: "Total", val: `${Object.values(history).reduce((a, v) => a + v.length, 0)}` },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#0f0f0f", borderRadius: 14, padding: "14px 10px", textAlign: "center", border: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 2, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────

interface WrapperProps {
  children: React.ReactNode;
}

function Wrapper({ children }: WrapperProps) {
  return (
    <div style={{
      maxWidth: 480, margin: "0 auto", minHeight: "100dvh",
      background: "#0a0a0a", padding: "env(safe-area-inset-top, 24px) 20px 48px",
      fontFamily: "'DM Sans', sans-serif", color: "#fff"
    }}>
      {children}
    </div>
  );
}

interface ToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const Toggle = ({ label, active, onClick }: ToggleProps) => (
  <button onClick={onClick} style={{
    flex: 1, padding: "9px 12px", borderRadius: 10, border: `1px solid ${active ? "#333" : "#1a1a1a"}`,
    background: active ? "#1a1a1a" : "transparent", color: active ? "#ddd" : "#444",
    fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
  }}>{label}</button>
);

interface TagProps {
  color: string;
  children: React.ReactNode;
}

const Tag = ({ color, children }: TagProps) => (
  <span style={{ background: `${color}1a`, color, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
    {children}
  </span>
);

const iconBtnStyle = (bg: string): CSSProperties => ({
  width: 52, height: 52, borderRadius: "50%", border: "none",
  background: bg, color: "#666", fontSize: 20, cursor: "pointer"
});

const btnStyle = (bg: string, color: string): CSSProperties => ({
  padding: "10px 16px", borderRadius: 10, border: "none",
  background: bg, color, fontWeight: 600, fontSize: 13, cursor: "pointer",
  transition: "all 0.2s"
});

const labelStyle: CSSProperties = { display: "block", fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, marginTop: 12 };
const selectStyle: CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", fontSize: 14 };
const inputStyle: CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", fontSize: 14 };
