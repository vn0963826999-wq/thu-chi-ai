"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LedgerSummaryProps {
    stats: {
        opening: number;
        income: number;
        expense: number;
        closing: number;
    };
}

export function LedgerSummary({ stats }: LedgerSummaryProps) {
    const items = [
        { label: "Số dư đầu kỳ", value: stats.opening, color: "text-blue-400" },
        { label: "Tổng Thu", value: stats.income, color: "text-[#22C55E]" },
        { label: "Tổng Chi", value: stats.expense, color: "text-[#EF4444]" },
        { label: "Số dư cuối kỳ", value: stats.closing, color: "text-cyan-400" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <p className="text-xs font-medium text-gray-400 mb-1">{item.label}</p>
                    <p className={cn("text-xl font-bold font-mono", item.color)}>
                        {item.value.toLocaleString("vi-VN")} ₫
                    </p>
                </div>
            ))}
        </div>
    );
}
