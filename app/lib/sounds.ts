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

export const playCountdown = (ctx: AudioContext) => { createBeep(ctx, 880, 0.15, 0.3); };

export const playGo = (ctx: AudioContext) => {
    createBeep(ctx, 523, 0.12, 0.4);
    setTimeout(() => createBeep(ctx, 784, 0.2, 0.5), 130);
    setTimeout(() => createBeep(ctx, 1047, 0.3, 0.6), 260);
};

export const playRest = (ctx: AudioContext) => {
    createBeep(ctx, 440, 0.2, 0.35);
    setTimeout(() => createBeep(ctx, 330, 0.25, 0.3), 200);
};

export const playDone = (ctx: AudioContext) => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => createBeep(ctx, f, 0.2, 0.5), i * 120));
};
