"use client";

import { useFinanceStore, formatMoney } from '@/lib/store';
import { ICON_MAP } from '@/lib/icon-library';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY PROGRESS LIST COMPONENT
// Danh sách chi tiêu theo danh mục với Progress Bar
// ═══════════════════════════════════════════════════════════════════════════

export function CategoryProgressList() {
    const { getCategoryBreakdown } = useFinanceStore();
    const breakdown = getCategoryBreakdown();

    if (breakdown.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-dashed border-white/10 bg-white/5">
                <span className="text-3xl mb-2">📊</span>
                <p className="text-[#94A3B8] text-sm">Chưa có chi tiêu tháng này</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {breakdown.map((item, idx) => {
                const Icon = ICON_MAP[item.icon] || Wallet;

                return (
                    <div key={item.id} className="group cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${item.color}20` }}
                                >
                                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-[#64748B]">{item.percent}% tổng chi</p>
                                </div>
                            </div>
                            <p className="font-bold text-white text-sm">
                                {formatMoney(item.value)}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${item.percent}%`,
                                    backgroundColor: item.color,
                                    boxShadow: `0 0 10px ${item.color}50`
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
