export const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export const todayKey = () =>
    new Date().toISOString().slice(0, 10);
