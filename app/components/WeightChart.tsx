import React from 'react';

interface WeightChartProps {
    data: Record<string, number>;
}

export function WeightChart({ data }: WeightChartProps) {
    const entries = Object.entries(data)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-7); // Last 7 data points

    if (entries.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/10 italic text-gray-500 text-sm">
                Log weight more regularly to see trends
            </div>
        );
    }

    const weights = entries.map(e => e[1]);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const range = maxWeight - minWeight || 1;
    const padding = range * 0.2;

    const chartMax = maxWeight + padding;
    const chartMin = minWeight - padding;
    const chartRange = chartMax - chartMin;

    const width = 300;
    const height = 150;

    const points = entries.map(([, weight], i) => {
        const x = (i / (entries.length - 1)) * width;
        const y = height - ((weight - chartMin) / chartRange) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-4 px-2">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Weight Trend</div>
                <div className="text-right">
                    <div className="text-xs font-bold text-white">Last 7 Logs</div>
                </div>
            </div>
            <div className="relative h-[150px] w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="0" x2={width} y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    {/* The Path */}
                    <path
                        d={`M ${points}`}
                        fill="none"
                        stroke="#7B61FF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_8px_rgba(123,97,255,0.5)]"
                    />

                    {/* Dots */}
                    {entries.map(([, weight], i) => {
                        const x = (i / (entries.length - 1)) * width;
                        const y = height - ((weight - chartMin) / chartRange) * height;
                        return (
                            <g key={i}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#7B61FF"
                                    stroke="white"
                                    strokeWidth="2"
                                />
                                {i === entries.length - 1 && (
                                    <text x={x} y={y - 12} fontSize="10" fill="white" fontWeight="bold" textAnchor="middle">
                                        {weight}kg
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-between mt-4 px-1">
                {entries.map(([date], i) => (
                    <div key={i} className="text-[8px] text-gray-600 font-bold uppercase">
                        {new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </div>
                ))}
            </div>
        </div>
    );
}
