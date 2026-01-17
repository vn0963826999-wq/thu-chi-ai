"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { CryptoCardBackground } from "@/components/ui/CryptoCardBackground";
import {
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight,
  ChevronRight, Sparkles, Plus
} from "lucide-react";
import { AddTransactionDialog } from "@/components/features/AddTransactionDialog";
import { MonthFilter } from "@/components/features/MonthFilter";
import { OverviewAreaChart } from "@/components/features/charts/OverviewAreaChart";
import { useFinanceStore, formatMoney } from "@/lib/store";
import { ICON_MAP } from "@/lib/icon-library";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════
// HOME PAGE - DYNAMIC DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const router = useRouter();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");

  const handleOpenTransaction = (type: "income" | "expense") => {
    setTransactionType(type);
    setTransactionOpen(true);
  };

  const handleAIScan = () => {
    setTransactionType("expense"); // Start with expense for scan usually
    setTransactionOpen(true);
    // Ideally trigger scan here, but for now just open dialog.
    // We can use a toast to guide user or just let them click.
    setTimeout(() => toast.info("Chọn 'Scan Hóa Đơn' để AI tự điền thông tin!"), 500);
  };

  const {
    transactions,
    accounts,
    selectedDate,
    getMonthlyStats,
    getDashboardStats,
    getCategoryById,
    getAccountById
  } = useFinanceStore();

  const currentMonthDate = new Date(selectedDate);
  const monthlyStats = getMonthlyStats(currentMonthDate);
  const dashboardStats = getDashboardStats(); // Total balance from all accounts

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    // Filter by selected month first
    const targetYear = currentMonthDate.getFullYear();
    const targetMonth = currentMonthDate.getMonth();

    const filtered = transactions.filter(t => {
      const d = parseISO(t.date);
      return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
    });

    // Grouping logic
    const groups: Record<string, typeof transactions> = {};
    filtered.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });

    // Sort dates descending
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions, selectedDate]);

  // Format date header (Hôm nay, Hôm qua, v.v.)
  const formatDateHeader = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Hôm nay";
    if (isYesterday(d)) return "Hôm qua";
    return format(d, "eeee, dd/MM", { locale: vi });
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6 pb-20 lg:pb-0">
      <Header title="Thu Chi AI" />

      {/* Desktop Title & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
          <p className="text-[#94A3B8]">Chào mừng bạn trở lại</p>
        </div>
        <MonthFilter />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card - Dynamic */}
        <div className="relative md:col-span-2 rounded-2xl border border-white/10 bg-[#0B0E23] p-5 lg:p-6 overflow-hidden">
          <CryptoCardBackground
            className="opacity-10 text-cyan-400"
            variant="uptrend"
            showVolume={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E23] via-transparent to-transparent opacity-60 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94A3B8]">Số dư tháng này</p>
              <h2 className="mt-1 text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {formatMoney(dashboardStats.balance)}
              </h2>
            </div>
            <div className="flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Wallet className="h-6 w-6 lg:h-7 lg:w-7 text-cyan-400" />
            </div>
          </div>

          {/* Area Chart Integration */}
          <OverviewAreaChart />
        </div>

        {/* Income Card */}
        <div className="relative rounded-2xl border border-[#22C55E]/20 bg-[#0B0E23] p-4 lg:p-5 overflow-hidden">
          <CryptoCardBackground className="opacity-15 text-[#22C55E]" variant="uptrend" showVolume={false} />
          <div className="absolute inset-0 bg-[#22C55E]/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-[#22C55E]" />
              <span className="text-sm text-[#94A3B8]">Thu nhập</span>
            </div>
            <p className="mt-2 text-xl lg:text-2xl font-bold text-[#22C55E]">
              +{formatMoney(monthlyStats.totalIncome)}
            </p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="relative rounded-2xl border border-[#EF4444]/20 bg-[#0B0E23] p-4 lg:p-5 overflow-hidden">
          <CryptoCardBackground className="opacity-15 text-[#EF4444]" variant="downtrend" showVolume={false} />
          <div className="absolute inset-0 bg-[#EF4444]/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-[#EF4444]" />
              <span className="text-sm text-[#94A3B8]">Chi tiêu</span>
            </div>
            <p className="mt-2 text-xl lg:text-2xl font-bold text-[#EF4444]">
              -{formatMoney(monthlyStats.totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <AddTransactionDialog
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
        defaultTab={transactionType}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* + Thu */}
        <Button
          className="h-20 flex-col gap-1 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20 hover:scale-[1.02] transition-all"
          onClick={() => handleOpenTransaction("income")}
        >
          <ArrowUpRight className="h-6 w-6" />
          <span className="font-bold">Thu Nhập</span>
        </Button>

        {/* + Chi */}
        <Button
          className="h-20 flex-col gap-1 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20 hover:scale-[1.02] transition-all"
          onClick={() => handleOpenTransaction("expense")}
        >
          <ArrowDownRight className="h-6 w-6" />
          <span className="font-bold">Chi Tiêu</span>
        </Button>

        {/* AI Scan */}
        <Button
          className="h-20 flex-col gap-1 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/10"
          onClick={handleAIScan}
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
          <span className="font-bold">AI Scan</span>
        </Button>

        {/* New Quick Action Buttons */}
        <div className="hidden md:contents">
          <Button variant="outline" onClick={() => router.push('/phan-tich')} className="h-16 lg:h-20 flex-col gap-2 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all">
            <TrendingUp className="h-5 w-5 text-[#22C55E]" />
            <span className="text-xs">Báo cáo</span>
          </Button>
          <Button variant="outline" onClick={() => router.push('/quan-ly')} className="h-16 lg:h-20 flex-col gap-2 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all">
            <span className="text-xl">📊</span>
            <span className="text-xs">Ngân sách</span>
          </Button>
          <Button variant="outline" onClick={() => toast.info("Tính năng đang phát triển")} className="h-16 lg:h-20 flex-col gap-2 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all">
            <span className="text-xl">🎯</span>
            <span className="text-xs">Mục tiêu</span>
          </Button>
        </div>
      </div>

      {/* Two Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History - Grouped by Date */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">Lịch sử giao dịch</h3>
            <button
              onClick={() => router.push("/quan-ly")}
              className="text-xs text-[#3B82F6] hover:text-[#3B82F6]/80 font-medium"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-6">
            {groupedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-white/10 bg-white/5">
                <span className="text-4xl mb-2">💸</span>
                <p className="text-[#94A3B8]">Chưa có giao dịch nào trong tháng này</p>
              </div>
            ) : (
              groupedTransactions.map(([dateStr, items]) => (
                <div key={dateStr} className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      {formatDateHeader(dateStr)}
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      {items.length} giao dịch
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0F1635] overflow-hidden">
                    {items.map((tx, idx) => {
                      const category = getCategoryById(tx.categoryId);
                      const Icon = category ? ICON_MAP[category.icon] : Wallet;
                      return (
                        <div key={tx.id} className={cn(
                          "flex items-center justify-between p-4 transition-colors hover:bg-white/5",
                          idx < items.length - 1 && "border-b border-white/5"
                        )}>
                          <div className="flex items-center gap-4">
                            <div
                              className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg"
                              style={{ backgroundColor: `${category?.color || '#3B82F6'}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color: category?.color || '#3B82F6' }} />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{tx.note || category?.name || 'Giao dịch'}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#94A3B8]">
                                  {getAccountById(tx.accountId)?.name || 'Tài khoản'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className={cn(
                            "font-bold text-base",
                            tx.type === "income" ? "text-[#22C55E]" : "text-[#EF4444]"
                          )}>
                            {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Accounts Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0F1635] p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Ví của tôi</h3>
              <Plus
                className="h-4 w-4 text-[#3B82F6] cursor-pointer hover:scale-110 transition-transform"
                onClick={() => router.push("/cai-dat")}
              />
            </div>

            <div className="space-y-4">
              {accounts.map((acc) => {
                const Icon = ICON_MAP[acc.icon] || Wallet;
                return (
                  <div key={acc.id} className="flex items-center justify-between group cursor-pointer" onClick={() => router.push("/cai-dat")}>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                        style={{ backgroundColor: `${acc.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: acc.color }} />
                      </div>
                      <span className="font-medium text-white group-hover:text-cyan-400 transition-colors">{acc.name}</span>
                    </div>
                    <p className="font-bold text-white">{formatMoney(acc.balance)}</p>
                  </div>
                );
              })}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4 text-[#3B82F6] text-xs hover:bg-white/5 rounded-xl"
              onClick={() => router.push("/cai-dat")}
            >
              Quản lý tài khoản
            </Button>
          </div>

          {/* AI Advisor Card */}
          <div className="group relative rounded-2xl border border-[#3B82F6]/30 bg-gradient-to-br from-[#1E293B] to-[#0B1E35] p-5 overflow-hidden transition-all hover:border-[#3B82F6]/50">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#3B82F6]/10 blur-2xl transition-all group-hover:bg-[#3B82F6]/20" />

            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3B82F6]/20 shadow-[0_4px_15px_rgba(59,130,246,0.2)]">
                <Sparkles className="h-6 w-6 text-[#3B82F6]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white flex items-center gap-2">
                  AI Advisor
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] uppercase tracking-tighter">Pro</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                  {monthlyStats.totalIncome > monthlyStats.totalExpense
                    ? `Tháng này bạn đã tiết kiệm được ${formatMoney(monthlyStats.balance)}. Nên trích 20% vào quỹ đầu tư Crypto.`
                    : "Chi tiêu vượt quá thu nhập! AI gợi ý bạn nên giảm 30% ngân sách 'Ăn uống' tuần này."}
                </p>
                <button
                  onClick={() => router.push("/phan-tich")}
                  className="mt-4 text-xs font-bold text-cyan-400 flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Xem chi tiết phân tích <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
