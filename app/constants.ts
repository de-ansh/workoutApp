import { Exercise } from "./types";

export const WARMUP_EXERCISES: Exercise[] = [
    { id: "w1", name: "Neck Rolls", duration: 20, type: "warmup", rest: 5, steps: ["Slowly roll your neck in a circular motion", "Hold for 2 seconds at points of tension"] },
    { id: "w2", name: "Arm Circles", duration: 25, type: "warmup", rest: 5, steps: ["Extend arms out to the sides", "Make small circles forward", "Switch to backward circles halfway"] },
    { id: "w3", name: "Hip Circles", duration: 25, type: "warmup", rest: 5, steps: ["Hands on hips", "Rotate hips in large circles clockwise", "Switch to anti-clockwise"] },
    { id: "w4", name: "Leg Swings", duration: 30, type: "warmup", rest: 5, steps: ["Stand near a wall for balance", "Swing one leg forward and backward", "Keep your core tight"] },
    { id: "w5", name: "Torso Twists", duration: 25, type: "warmup", rest: 5, steps: ["Feet shoulder-width apart", "Twist side-to-side with arms bent", "Look behind you with each twist"] },
    { id: "w6", name: "March in Place", duration: 40, type: "warmup", rest: 10, steps: ["Lift knees high with each step", "Pump your arms synchronously"] },
    { id: "w7", name: "Shoulder Shrugs", duration: 20, type: "warmup", rest: 5, steps: ["Lift shoulders towards ears", "Roll them back and down"] },
    { id: "w8", name: "Ankle Rolls", duration: 20, type: "warmup", rest: 5, steps: ["Rotate ankles clockwise", "Switch to anti-clockwise"] },
];

export const EXERCISE_POOL = [
    // Cardio
    { name: "Jump Rope", type: "cardio", defaultDur: 120, steps: ["Rotate wrists only", "Stay light on the balls of your feet", "Keep jumps low to the ground"] },
    { name: "High Knees", type: "cardio", defaultDur: 45, steps: ["Drive knees up towards your chest", "Pump arms for momentum", "Stay on your toes"] },
    { name: "Burpees", type: "cardio", defaultDur: 40, steps: ["Squat, kick back to plank", "Optional pushup", "Jump feet forward", "Explosive vertical jump"] },
    { name: "Mountain Climbers", type: "cardio", defaultDur: 45, steps: ["Plank position", "Alternate driving knees to chest rapidly", "Keep hips low"] },
    { name: "Jumping Jacks", type: "cardio", defaultDur: 60, steps: ["Simultaneous arm lift and leg spread", "Sync movements with rhythmic jumps"] },
    { name: "Shadow Boxing", type: "cardio", defaultDur: 60, steps: ["Alternate jabs, crosses, and hooks", "Stay light on your feet", "Keep hands up by chin"] },
    { name: "Butt Kicks", type: "cardio", defaultDur: 45, steps: ["Jog in place", "Kick heels back towards your glutes with each step"] },

    // Abs - UPPER
    { name: "Cable Crunches", type: "abs", defaultDur: 45, steps: ["Kneel at the pulley", "Grip the rope behind your head", "Crunch down towards your knees", "Exhale on contraction"] },
    { name: "Weighted Crunches", type: "abs", defaultDur: 45, steps: ["Lie on back, knees bent", "Hold weight at chest", "Lift shoulder blades off floor", "Squeeze at top"] },
    { name: "Rope Crunches", type: "abs", defaultDur: 45, steps: ["Use a high cable pulley", "Kneel and crunch downwards", "Focus on upper ab isolation"] },

    // Abs - LOWER
    { name: "Leg Raises", type: "abs", defaultDur: 40, steps: ["Lie flat, hands under glutes", "Lift legs to 90 degrees", "Lower slowly without touching floor"] },
    { name: "Reverse Crunches", type: "abs", defaultDur: 45, steps: ["Lie flat, knees bent", "Lift hips off the floor towards your chest", "Control the descent"] },
    { name: "Flutter Kicks", type: "abs", defaultDur: 40, steps: ["Hands under glutes", "Lift legs slightly off floor", "Alternate rapid leg kicks up and down"] },
    { name: "Scissors", type: "abs", defaultDur: 40, steps: ["Lift legs 6 inches off floor", "Cross legs over each other in a flat plane", "Keep core tight"] },

    // Abs - MIDDLE / CORE
    { name: "Plank", type: "abs", defaultDur: 60, steps: ["Body in a straight line on forearms", "Engage glutes and core", "Keep neck neutral"] },
    { name: "Bicycle Crunches", type: "abs", defaultDur: 45, steps: ["Alternate elbow to opposite knee", "Perform in a cycling motion", "Exhale with each twist"] },
    { name: "Russian Twists", type: "abs", defaultDur: 40, steps: ["Sit with knees bent, feet up", "Rotate torso to touch floor on each side"] },
    { name: "V-Ups", type: "abs", defaultDur: 45, steps: ["Lie flat, reach hands to toes simultaneously", "Balance on your tailbone at top"] },
    { name: "Dead Bug", type: "abs", defaultDur: 45, steps: ["Lie on back, arms and legs up", "Lower opposite arm and leg while keeping back flat"] },
    { name: "Jackknife", type: "abs", defaultDur: 45, steps: ["Simultaneous leg and upper body lift", "Clasp hands near shins at top"] },

    // Strength / Bodyweight
    { name: "Pushups", type: "strength", defaultDur: 45, steps: ["Keep elbows at 45 degrees", "Full range of motion: chest to floor", "Push up to lock out"] },
    { name: "Squats", type: "strength", defaultDur: 45, steps: ["Hips back first", "Keep weight in heels", "Chest up, eyes forward"] },
    { name: "Lunges", type: "strength", defaultDur: 50, steps: ["Big step forward", "Back knee almost touches floor", "Keep torso upright"] },
    { name: "Glute Bridges", type: "strength", defaultDur: 45, steps: ["Lie on back, feet flat on floor", "Lift hips as high as possible", "Squeeze glutes at top"] },
    { name: "Diamond Pushups", type: "strength", defaultDur: 30, steps: ["Form a diamond with hands", "Keep elbows close to side", "Focus on triceps"] },

    // Calisthenics
    { name: "Pullups", type: "strength", defaultDur: 45, steps: ["Grip the bar wider than shoulders", "Pull chest to bar", "Slow, controlled descent"] },
    { name: "Dips", type: "strength", defaultDur: 40, steps: ["Lower until elbows are at 90 degrees", "Push back up without locking elbows", "Keep chest slightly forward"] },
    { name: "Pistol Squats", type: "strength", defaultDur: 50, steps: ["Balance on one leg", "Lower into a full squat", "Extend other leg forward", "Drive back up"] },
    { name: "Muscle-ups", type: "strength", defaultDur: 30, steps: ["Explosive pullup", "Transition grip above bar", "Dip to lock out"] },
    { name: "L-Sit", type: "strength", defaultDur: 30, steps: ["Hands on floor/bars", "Lift legs parallel to floor", "Keep back straight and core tight"] },
];

export const CALISTHENICS_CHALLENGES = [
    {
        id: "cali_foundation_7",
        title: "7-Day Foundation",
        desc: "Build the raw strength for advanced calisthenics.",
        days: 7,
        exercisesPerDay: 5,
        difficulty: "Intermediate",
        rewardEmoji: "👑"
    }
];
