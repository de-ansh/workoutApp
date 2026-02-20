import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plan, WorkoutEntry } from "../types";
import { WARMUP_EXERCISES } from "../constants";
import { fmt } from "../lib/utils";
import { playCountdown, playGo, playRest, playDone } from "../lib/sounds";
import { CircularTimer } from "./CircularTimer";

interface WorkoutSessionProps {
    plan: Plan;
    planKey: string;
    withWarmup: boolean;
    soundOn: boolean;
    onExit: () => void;
    onComplete: (planKey: string, mins: number) => void;
}

export function WorkoutSession({ plan, planKey, withWarmup, soundOn, onExit, onComplete }: WorkoutSessionProps) {
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
            if (next >= allExercises.length) {
                setRunning(false);
                setDone(true);
                if (soundOn) playDone(getAudio());
                return;
            }
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
                if (next >= allExercises.length) {
                    setRunning(false);
                    setDone(true);
                    if (soundOn) playDone(getAudio());
                    return;
                }
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

    const [showSteps, setShowSteps] = useState(false);
    const [holdingExit, setHoldingExit] = useState(false);
    const [holdingSkip, setHoldingSkip] = useState(false);
    const exitHoldRef = useRef<NodeJS.Timeout | null>(null);
    const skipHoldRef = useRef<NodeJS.Timeout | null>(null);
    const [lastActionTime, setLastActionTime] = useState(0);

    const handleStart = () => {
        if (soundOn) playGo(getAudio());
        setRunning(true);
    };

    // Exit requires 1.5 second hold to prevent accidental exit
    const handleExitPress = () => {
        setHoldingExit(true);
        exitHoldRef.current = setTimeout(() => {
            setHoldingExit(false);
            onExit();
        }, 1500);
    };

    const handleExitRelease = () => {
        if (exitHoldRef.current) clearTimeout(exitHoldRef.current);
        setHoldingExit(false);
    };

    // Skip requires 1 second hold to prevent accidental skip
    const handleSkipPress = () => {
        if (Date.now() - lastActionTime < 500) return; // Debounce
        setHoldingSkip(true);
        skipHoldRef.current = setTimeout(() => {
            setHoldingSkip(false);
            setLastActionTime(Date.now());
            advance();
        }, 1000);
    };

    const handleSkipRelease = () => {
        if (skipHoldRef.current) clearTimeout(skipHoldRef.current);
        setHoldingSkip(false);
    };

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const progressPct = Math.round(((exIdx) / allExercises.length) * 100);

    if (done) {
        const mins = Math.round(elapsed / 60);
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in zoom-in duration-700">
                <div className="text-8xl mb-6 drop-shadow-[0_0_20px_rgba(123,97,255,0.4)]">🏆</div>
                <h2 className="text-6xl heading-bebas leading-none tracking-tighter mb-2 text-white">Crushed It!</h2>
                <p className="text-gray-400 text-sm tracking-widest uppercase mb-10 font-medium">Session Complete</p>

                <div className="grid grid-cols-2 gap-4 w-full mb-12">
                    <div className="glass rounded-3xl p-6 bg-white/[0.02]">
                        <div className="text-primary text-3xl font-bold heading-bebas mb-1">{mins}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Minutes</div>
                    </div>
                    <div className="glass rounded-3xl p-6 bg-white/[0.02]">
                        <div className="text-success text-3xl font-bold heading-bebas mb-1">{allExercises.length}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Exercises</div>
                    </div>
                </div>

                <button
                    onClick={() => onComplete(planKey, mins)}
                    className="w-full py-5 rounded-[24px] bg-primary text-white text-xl font-bold heading-bebas tracking-[.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all mb-4"
                >
                    Save & Exit
                </button>
                <button onClick={onExit} className="text-gray-600 font-bold uppercase tracking-widest text-[10px] py-4">Discard changes</button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onMouseDown={handleExitPress}
                    onMouseUp={handleExitRelease}
                    onMouseLeave={handleExitRelease}
                    onTouchStart={handleExitPress}
                    onTouchEnd={handleExitRelease}
                    className={`text-3xl p-2 transition-all ${holdingExit ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-gray-400'}`}
                    title="Hold 1.5s to exit"
                >
                    ✕
                    {holdingExit && <div className="absolute text-[8px] text-red-500 font-bold -mt-1">Hold...</div>}
                </button>
                <div className="flex-1">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
                <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{progressPct}%</div>
            </div>

            <div className="text-center py-6">
                <div className={`text-[10px] font-bold uppercase tracking-[.4em] mb-2 ${isWarmupPhase ? 'text-gray-500' : 'text-primary'}`}>
                    {isWarmupPhase ? 'Warm-up Phase' : currentEx?.type}
                </div>
                <h2 className="text-4xl m-0 heading-bebas tracking-tight text-white mb-8">{currentEx?.name}</h2>

                {/* Visual Guide Placeholder */}
                <div className="relative h-32 flex items-center justify-center mb-8">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150" />
                    <div className="relative text-7xl float-animation">
                        <div className="exercise-pulse">
                            {currentEx?.type === 'abs' ? '🧘' : isWarmupPhase ? '🧘' : '⚡'}
                        </div>
                    </div>
                    {/* Shimmer background */}
                    <div className="absolute inset-0 glow-shimmer opacity-20 pointer-events-none rounded-3xl" />
                </div>
            </div>

            <CircularTimer current={timeLeft} total={total} isRest={isRest} isRunning={running} color={plan.color} />

            <div className="flex items-center justify-center gap-8 mt-10 mb-12">
                {/* Reset button - increased touch target */}
                <button
                    onMouseDown={() => setExIdx(0)}
                    onTouchStart={() => setExIdx(0)}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl text-gray-600 hover:text-white hover:bg-white/5 transition-all active:scale-90"
                    title="Reset to first exercise"
                >
                    ↺
                </button>

                {/* Main play/pause button - large touch target */}
                <button
                    onClick={running ? () => setRunning(false) : handleStart}
                    className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl transition-all duration-300 font-bold ${running ? 'bg-white/10 border border-white/20 text-white' : 'bg-primary text-white shadow-2xl shadow-primary/50 scale-110'} active:scale-95`}
                    style={{ minHeight: '112px', minWidth: '112px' }}
                >
                    {running ? "⏸" : "▶"}
                </button>

                {/* Skip button - hold to prevent accidental skip */}
                <button
                    onMouseDown={handleSkipPress}
                    onMouseUp={handleSkipRelease}
                    onMouseLeave={handleSkipRelease}
                    onTouchStart={handleSkipPress}
                    onTouchEnd={handleSkipRelease}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all font-bold ${holdingSkip ? 'text-primary bg-white/10 scale-95' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                    title="Hold to skip exercise"
                >
                    ⏭
                </button>
            </div>

            {holdingSkip && (
                <div className="text-center mb-4 text-primary text-sm font-bold animate-pulse">
                    ⏱ Hold {(1 - Math.max(0, Date.now() - lastActionTime) / 1000).toFixed(1)}s to skip
                </div>
            )}

            {currentEx?.steps && currentEx.steps.length > 0 && (
                <div className="mb-12">
                    <button
                        onClick={() => setShowSteps(!showSteps)}
                        className="w-full flex justify-between items-center px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all font-bold heading-bebas tracking-widest"
                    >
                        <span>📖 INSTRUCTIONS</span>
                        <span>{showSteps ? '−' : '+'}</span>
                    </button>
                    {showSteps && (
                        <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                            {currentEx.steps.map((step, idx) => (
                                <div key={idx} className="flex gap-4 items-start bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                                    <div className="text-gray-400 text-sm leading-relaxed">{step}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-16">
                <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[.3em] mb-6 px-2">Up Next</h3>
                <div className="space-y-3">
                    {allExercises.slice(exIdx + 1, exIdx + 4).map((ex, i) => (
                        <div key={`${ex.id}-${i}`} className="glass rounded-2xl p-4 flex justify-between items-center opacity-40 group hover:opacity-100 transition-opacity">
                            <div>
                                <div className="text-sm font-bold text-white mb-1">{ex.name}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{ex.duration}s · {ex.type}</div>
                            </div>
                            <div className="text-xs font-mono text-gray-600">{fmt(ex.duration)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
