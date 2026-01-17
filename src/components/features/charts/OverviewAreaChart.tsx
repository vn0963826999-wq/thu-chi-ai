"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';
import { useFinanceStore, formatMoney } from '@/lib/store';
import { useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM TOOLTIP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
        const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;

        return (
            <div className="rounded-xl border border-white/10 bg-[#0B0E23]/90 p-3 shadow-2xl backdrop-blur-md">
                <p className="mb-2 text-xs font-bold text-[#94A3B8]">Ngày {label}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-xs text-[#22C55E]">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                            Thu:
                        </span>
                        <span className="text-xs font-bold text-white">{formatMoney(Number(income))}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-xs text-[#EF4444]">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                            Chi:
                        </span>
                        <span className="text-xs font-bold text-white">{formatMoney(Number(expense))}</span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW AREA CHART COMPONENT
// Biểu đồ vùng hiển thị biến động Thu/Chi trong tháng
// ═══════════════════════════════════════════════════════════════════════════

export function OverviewAreaChart() {
    const { selectedDate, getChartData } = useFinanceStore();

    // Memoize data to prevent unnecessary re-renders
    const data = useMemo(() => {
        return getChartData(new Date(selectedDate));
    }, [selectedDate, getChartData]);

    return (
        <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIncome" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                        interval={4}
                    />

                    <YAxis hide domain={[0, 'auto']} />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#22C55E"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        animationDuration={1500}
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#EF4444"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
