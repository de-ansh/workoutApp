export interface Exercise {
    id: number | string;
    name: string;
    duration: number;
    type: "cardio" | "abs" | "warmup" | "strength";
    rest: number;
    steps?: string[];
}

export interface Plan {
    label: string;
    emoji?: string;
    color: string;
    exercises: Exercise[];
    difficulty?: string;
    equipment?: string;
    duration?: number;
}

export type Plans = Record<string, Plan>;

export interface Profile {
    name: string;
    goal: string;
    waterGoal: number;
    currentWater: number;
    currentWeight: number;
    streak: number;
    /** ISO date string (YYYY-MM-DD) of the last day water was tracked */
    lastWaterDate?: string;
}

export interface WorkoutEntry {
    planKey: string;
    mins: number;
    time: string;
}

export type History = Record<string, WorkoutEntry[]>;

/** Water intake history: Record<YYYY-MM-DD, ml consumed> */
export type WaterHistory = Record<string, number>;

export interface Challenge {
    id: string;
    title: string;
    desc: string;
    days: number;
    exercisesPerDay: number;
    difficulty: string;
    rewardEmoji: string;
}

export interface ChallengeProgress {
    challengeId: string;
    currentDay: number;
    completedDate?: string;
}

export interface DBData {
    profile: Profile;
    plans: Plans;
    history: History;
    waterHistory: WaterHistory;
    weightHistory: Record<string, number>;
    achievements: string[];
    activeChallenges: Record<string, ChallengeProgress>;
    dailyTips: string[];
}
