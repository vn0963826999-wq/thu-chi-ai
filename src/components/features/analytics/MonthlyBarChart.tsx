"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    type TooltipProps
} from 'recharts';
import { useFinanceStore, formatMoney } from '@/lib/store';

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════

interface CustomPayload {
    income?: number;
    expense?: number;
    month?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload as CustomPayload;

        return (
            <div className="rounded-xl border border-white/10 bg-[#0B0E23]/95 p-3 shadow-2xl backdrop-blur-md">
                <p className="mb-2 text-xs font-bold text-cyan-400">{label}</p>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-6">
                        <span className="flex items-center gap-2 text-xs text-[#22C55E]">
                            <div className="h-2 w-2 rounded-full bg-[#22C55E]" />
                            Thu nhập
                        </span>
                        <span className="text-xs font-bold text-white">
                            {formatMoney(data.income || 0)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                        <span className="flex items-center gap-2 text-xs text-[#EF4444]">
                            <div className="h-2 w-2 rounded-full bg-[#EF4444]" />
                            Chi tiêu
                        </span>
                        <span className="text-xs font-bold text-white">
                            {formatMoney(data.expense || 0)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

// ═══════════════════════════════════════════════════════════════════════════
// MONTHLY BAR CHART COMPONENT
// Biểu đồ cột Thu/Chi 6 tháng gần nhất
// ═══════════════════════════════════════════════════════════════════════════

export function MonthlyBarChart() {
    const { getMonthlyChartData } = useFinanceStore();
    const data = getMonthlyChartData();

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                    barCategoryGap="20%"
                >
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                    />

                    <YAxis hide />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                    />

                    <Bar
                        dataKey="income"
                        fill="#22C55E"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`income-${index}`}
                                fill={entry.income > 0 ? '#22C55E' : '#22C55E20'}
                                style={{ filter: entry.income > 0 ? 'drop-shadow(0 4px 6px rgba(34,197,94,0.3))' : 'none' }}
                            />
                        ))}
                    </Bar>

                    <Bar
                        dataKey="expense"
                        fill="#EF4444"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`expense-${index}`}
                                fill={entry.expense > 0 ? '#EF4444' : '#EF444420'}
                                style={{ filter: entry.expense > 0 ? 'drop-shadow(0 4px 6px rgba(239,68,68,0.3))' : 'none' }}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
