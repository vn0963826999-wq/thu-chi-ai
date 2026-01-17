"use client";

import { useMemo } from "react";
import { useFinanceStore, formatMoney, type Transaction } from "@/lib/store";
import { ICON_MAP } from "@/lib/icon-library";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// SMART TRANSACTION LIST COMPONENT
// Danh sách giao dịch nhóm theo ngày với phong cách Fintech
// ═══════════════════════════════════════════════════════════════════════════

interface SmartTransactionListProps {
    limit?: number;
    showHeader?: boolean;
}

export function SmartTransactionList({ limit = 20, showHeader = true }: SmartTransactionListProps) {
    const { getRecentTransactions, getCategoryById, getAccountById } = useFinanceStore();

    const transactions = getRecentTransactions(limit);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        transactions.forEach((tx) => {
            if (!groups[tx.date]) groups[tx.date] = [];
            groups[tx.date].push(tx);
        });

        // Sort dates descending
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [transactions]);

    // Format date header
    const formatDateHeader = (dateStr: string) => {
        const d = parseISO(dateStr);
        if (isToday(d)) return "HÔM NAY";
        if (isYesterday(d)) return "HÔM QUA";
        return format(d, "EEEE, dd/MM", { locale: vi }).toUpperCase();
    };

    // Calculate daily total
    const getDailyTotal = (items: Transaction[]) => {
        const income = items.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return income - expense;
    };

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-white/10 bg-white/5">
                <span className="text-4xl mb-3">💸</span>
                <p className="text-[#94A3B8] text-sm">Chưa có giao dịch nào</p>
                <p className="text-[#64748B] text-xs mt-1">Bắt đầu thêm giao dịch đầu tiên</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showHeader && (
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-lg">Lịch sử giao dịch</h3>
                    <button className="text-xs text-[#3B82F6] hover:text-[#3B82F6]/80 font-medium transition-colors">
                        Xem tất cả
                    </button>
                </div>
            )}

            {groupedTransactions.map(([dateStr, items]) => (
                <div key={dateStr} className="space-y-2">
                    {/* Date Header */}
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                            {formatDateHeader(dateStr)}
                        </span>
                        <span className={cn(
                            "text-xs font-semibold",
                            getDailyTotal(items) >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                        )}>
                            {getDailyTotal(items) >= 0 ? "+" : ""}{formatMoney(getDailyTotal(items))}
                        </span>
                    </div>

                    {/* Transactions Card */}
                    <div className="rounded-2xl border border-white/10 bg-[#0F1635] overflow-hidden">
                        {items.map((tx, idx) => {
                            const category = getCategoryById(tx.categoryId);
                            const account = getAccountById(tx.accountId);
                            const Icon = category ? ICON_MAP[category.icon] : Wallet;

                            return (
                                <div
                                    key={tx.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 transition-colors hover:bg-white/5 cursor-pointer",
                                        idx < items.length - 1 && "border-b border-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg transition-transform hover:scale-105"
                                            style={{ backgroundColor: `${category?.color || '#3B82F6'}20` }}
                                        >
                                            <Icon className="h-5 w-5" style={{ color: category?.color || '#3B82F6' }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">
                                                {tx.note || category?.name || 'Giao dịch'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#94A3B8]">
                                                    {account?.name || 'Tài khoản'}
                                                </span>
                                                <span className="text-[10px] text-[#64748B]">
                                                    {format(parseISO(tx.date), "HH:mm")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p
                                        className={cn(
                                            "font-bold text-base",
                                            tx.type === "income" ? "text-[#22C55E]" : "text-[#EF4444]"
                                        )}
                                    >
                                        {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
