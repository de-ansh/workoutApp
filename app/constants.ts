import { Exercise } from "./types";

export const WARMUP_EXERCISES: Exercise[] = [
    { id: "w1", name: "Neck Rolls", duration: 20, type: "warmup", rest: 5 },
    { id: "w2", name: "Arm Circles", duration: 25, type: "warmup", rest: 5 },
    { id: "w3", name: "Hip Circles", duration: 25, type: "warmup", rest: 5 },
    { id: "w4", name: "Leg Swings", duration: 30, type: "warmup", rest: 5 },
    { id: "w5", name: "Torso Twists", duration: 25, type: "warmup", rest: 5 },
    { id: "w6", name: "March in Place", duration: 40, type: "warmup", rest: 10 },
];

export const EXERCISE_POOL = [
    { name: "Jump Rope", type: "cardio", defaultDur: 120 },
    { name: "High Knees", type: "cardio", defaultDur: 45 },
    { name: "Burpees", type: "cardio", defaultDur: 40 },
    { name: "Mountain Climbers", type: "cardio", defaultDur: 45 },
    { name: "Plank", type: "abs", defaultDur: 60 },
    { name: "Bicycle Crunches", type: "abs", defaultDur: 45 },
    { name: "Leg Raises", type: "abs", defaultDur: 40 },
    { name: "Russian Twists", type: "abs", defaultDur: 40 },
];
