"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PieChart as PieChartIcon,
    AlertCircle,
    Sparkles,
    Lightbulb
} from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { aiService } from "@/lib/ai-service";
import { MonthlyBarChart } from "@/components/features/analytics/MonthlyBarChart";
import { CategoryProgressList } from "@/components/features/analytics/CategoryProgressList";
import { cn } from "@/lib/utils";

export default function PhantichPage() {
    const { transactions, getDashboardStats } = useFinanceStore();
    const stats = getDashboardStats();
    const [aiTips, setAiTips] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const fetchAiInsights = async () => {
            if (transactions.length < 3) return;
            setIsAnalyzing(true);
            try {
                const tips = await aiService.analyzeFinancialHealth(transactions);
                setAiTips(tips);
            } catch (error) {
                console.error("AI Insight Error:", error);
            } finally {
                setIsAnalyzing(false);
            }
        };

        fetchAiInsights();
    }, [transactions]);

    const formatMoney = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " ₫";
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-8 pb-10">
            <Header title="Phân tích" />

            {/* AI Insights - Bento Card */}
            <div className="relative p-6 rounded-3xl border border-blue-500/30 bg-blue-500/10 overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-32 w-32" />
                </div>
                <div className="relative z-10 flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-2xl bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Góc nhìn AI</h2>
                        <p className="text-blue-300/70 text-sm">Phân tích chuyên sâu từ Gemini</p>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isAnalyzing ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                        ))
                    ) : aiTips.length > 0 ? (
                        aiTips.map((tip, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex gap-3 items-start">
                                <div className="h-2 w-2 rounded-full bg-blue-400 mt-2 shrink-0 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                                <p className="text-gray-300 text-sm italic">"{tip}"</p>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-3 text-gray-500 italic text-center py-4">Chưa có đủ dữ liệu để AI phân tích sức khỏe tài chính.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Balance */}
                <div className="col-span-1 md:col-span-2 p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E3A5F] to-[#0F1635] shadow-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] bg-white/5 px-2 py-1 rounded-full">Tổng tài sản</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl lg:text-4xl font-black text-white">{formatMoney(stats.balance)}</p>
                    </div>
                </div>

                {/* Savings Goal Card */}
                <div className="p-6 rounded-3xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-white">Tháng này</h3>
                        <p className="text-2xl font-black text-[#22C55E] tracking-tight mt-2">
                            +{formatMoney(stats.income - stats.expense)}
                        </p>
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden relative z-10">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="p-5 lg:p-6 rounded-3xl border border-white/10 bg-[#0F1635]">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-400" /> Biến động 6 tháng
                    </h3>
                    <div className="h-[250px]">
                        <MonthlyBarChart />
                    </div>
                </div>

                <div className="p-5 lg:p-6 rounded-3xl border border-white/10 bg-[#0F1635]">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-purple-400" /> Cơ cấu chi tiêu
                    </h3>
                    <CategoryProgressList />
                </div>
            </div>
        </div>
    );
}
