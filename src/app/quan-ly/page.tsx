"use client";

import React, { useState } from "react";
import {
    Plus,
    PlusCircle,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Sparkles,
    Copy,
    Trash2,
    Calendar,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import { useFinanceStore, type Debt, formatMoney, formatDate } from "@/lib/store";
import { aiService } from "@/lib/ai-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TransactionLedger } from "@/components/features/ledger/TransactionLedger";
import { AddDebtDialog } from "@/components/features/ledger/AddDebtDialog";
import { AddRecurringDialog } from "@/components/features/ledger/AddRecurringDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICON_MAP } from "@/lib/icon-library";
import { cn } from "@/lib/utils";

// Frequency label mapping
const FREQUENCY_LABELS: Record<string, string> = {
    daily: "Hàng ngày",
    weekly: "Hàng tuần",
    monthly: "Hàng tháng",
    yearly: "Hàng năm",
};

export default function QuanLyPage() {
    const {
        debts,
        recurringTransactions,
        updateDebtStatus,
        deleteDebt,
        deleteRecurring,
        toggleRecurring,
        categories,
        accounts,
    } = useFinanceStore();

    const [generatingReminder, setGeneratingReminder] = useState<string | null>(null);
    const [debtDialogOpen, setDebtDialogOpen] = useState(false);
    const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);

    // AI logic for Debt Reminder
    const handleGenerateReminder = async (debt: Debt) => {
        setGeneratingReminder(debt.id);
        try {
            const message = await aiService.generateDebtReminder(debt);

            toast.custom((t) => (
                <div className="bg-[#1E293B] border border-cyan-500/30 p-4 rounded-2xl shadow-2xl w-[350px]">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold">
                        <Sparkles className="h-4 w-4" /> AI Gợi ý tin nhắn
                    </div>
                    <p className="text-gray-300 text-sm italic mb-4">"{message}"</p>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.dismiss(t)}
                            className="text-gray-400"
                        >
                            Đóng
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(message);
                                toast.success("Đã copy tin nhắn!");
                                toast.dismiss(t);
                            }}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white"
                        >
                            <Copy className="h-4 w-4 mr-2" /> Sao chép
                        </Button>
                    </div>
                </div>
            ), { duration: 10000 });
        } catch (error) {
            toast.error("Lỗi AI khi tạo tin nhắn.");
        } finally {
            setGeneratingReminder(null);
        }
    };

    return (
        <div className="min-h-screen pb-24 lg:pb-0 px-4 pt-4 lg:px-8 lg:pt-8 bg-[#0B0E23] flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Quản Lý & Sổ Cú</h1>
                    <p className="text-[#94A3B8]">Theo dõi giao dịch chi tiết và công nợ AI</p>
                </div>
            </div>

            <Tabs defaultValue="ledger" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-auto flex gap-1 w-full max-w-md">
                    <TabsTrigger
                        value="ledger"
                        className="flex-1 py-2.5 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold transition-all text-sm"
                    >
                        Sổ Giao Dịch
                    </TabsTrigger>
                    <TabsTrigger
                        value="debts"
                        className="flex-1 py-2.5 rounded-xl data-[state=active]:bg-yellow-600 data-[state=active]:text-white font-bold transition-all text-sm"
                    >
                        Công Nợ ({debts.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="recurring"
                        className="flex-1 py-2.5 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold transition-all text-sm"
                    >
                        Định Kỳ ({recurringTransactions.length})
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Ledger */}
                <TabsContent value="ledger" className="mt-0 outline-none">
                    <TransactionLedger />
                </TabsContent>

                {/* Tab: Debts */}
                <TabsContent value="debts" className="mt-0 outline-none space-y-4">
                    {/* Add Debt Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setDebtDialogOpen(true)}
                            className="h-11 px-6 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold hover:scale-105 transition-transform"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Thêm công nợ
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {debts.length > 0 ? debts.map((debt) => (
                            <div key={debt.id} className={cn(
                                "p-5 rounded-3xl bg-white/5 border hover:border-white/20 transition-all flex flex-col shadow-xl",
                                debt.status === 'paid' ? "border-emerald-500/30 opacity-60" : "border-white/10"
                            )}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg",
                                            debt.type === 'loan' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                        )}>
                                            {debt.type === 'loan' ? <ArrowUpRight /> : <ArrowDownRight />}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{debt.name}</h3>
                                            <p className="text-gray-400 text-xs">
                                                {debt.type === 'loan' ? 'Cho vay' : 'Đi vay'} • Hạn: {debt.dueDate ? formatDate(debt.dueDate) : 'Không có'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                                        onClick={() => deleteDebt(debt.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="mb-4">
                                    <p className={cn("text-2xl font-bold font-mono", debt.type === 'loan' ? "text-emerald-400" : "text-rose-400")}>
                                        {formatMoney(debt.amount)}
                                    </p>
                                    {debt.note && <p className="text-gray-500 text-xs mt-1 italic">"{debt.note}"</p>}
                                </div>

                                <div className="mt-auto flex gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "flex-1 h-11 rounded-xl border-white/10",
                                            debt.status === 'paid' ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400"
                                        )}
                                        onClick={() => updateDebtStatus(debt.id, debt.status === 'paid' ? 'pending' : 'paid')}
                                    >
                                        {debt.status === 'paid' ? "✓ Đã xong" : "Tất toán"}
                                    </Button>
                                    <Button
                                        onClick={() => handleGenerateReminder(debt)}
                                        disabled={generatingReminder === debt.id || debt.status === 'paid'}
                                        className="flex-1 h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold disabled:opacity-50"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Nhắc Nợ
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                    <ArrowUpRight className="h-8 w-8 text-yellow-400" />
                                </div>
                                <p className="text-gray-400 mb-4">Chưa có công nợ nào</p>
                                <Button
                                    onClick={() => setDebtDialogOpen(true)}
                                    className="bg-yellow-600 hover:bg-yellow-500 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm công nợ đầu tiên
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Tab: Recurring */}
                <TabsContent value="recurring" className="mt-0 outline-none space-y-4">
                    {/* Add Recurring Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setRecurringDialogOpen(true)}
                            className="h-11 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:scale-105 transition-transform"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Thêm định kỳ
                        </Button>
                    </div>

                    {recurringTransactions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recurringTransactions.map((rec) => {
                                const category = categories.find(c => c.id === rec.categoryId);
                                const account = accounts.find(a => a.id === rec.accountId);
                                const CategoryIcon = category ? ICON_MAP[category.icon] || RefreshCw : RefreshCw;

                                return (
                                    <div key={rec.id} className={cn(
                                        "p-5 rounded-3xl bg-white/5 border transition-all flex flex-col shadow-xl",
                                        rec.isActive ? "border-purple-500/30" : "border-white/10 opacity-50"
                                    )}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                                    style={{ backgroundColor: `${category?.color || '#8B5CF6'}20` }}
                                                >
                                                    <CategoryIcon className="h-5 w-5" style={{ color: category?.color || '#8B5CF6' }} />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold">{rec.name}</h3>
                                                    <p className="text-gray-400 text-xs">
                                                        {FREQUENCY_LABELS[rec.frequency]} • {account?.name || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                                                onClick={() => deleteRecurring(rec.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="mb-4">
                                            <p className={cn(
                                                "text-2xl font-bold font-mono",
                                                rec.type === 'income' ? "text-emerald-400" : "text-rose-400"
                                            )}>
                                                {rec.type === 'income' ? '+' : '-'}{formatMoney(rec.amount)}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-gray-500 text-xs">
                                                <Calendar className="h-3 w-3" />
                                                Tiếp theo: {formatDate(rec.nextRunDate)}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4">
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-11 rounded-xl border-white/10 flex items-center justify-center gap-2",
                                                    rec.isActive ? "text-purple-400" : "text-gray-500"
                                                )}
                                                onClick={() => toggleRecurring(rec.id)}
                                            >
                                                {rec.isActive ? (
                                                    <>
                                                        <ToggleRight className="h-5 w-5" /> Đang bật
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="h-5 w-5" /> Đã tắt
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-10 rounded-3xl bg-white/5 border border-white/10 text-center flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                                <RefreshCw className="h-10 w-10 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Giao dịch định kỳ</h3>
                            <p className="text-gray-400 max-w-md mx-auto mb-8">
                                Tự động ghi nhận các khoản thu chi lặp lại như tiền điện, tiền nhà, lương hàng tháng.
                            </p>
                            <Button
                                onClick={() => setRecurringDialogOpen(true)}
                                className="bg-purple-600 hover:bg-purple-500 text-white h-12 px-8 rounded-xl font-bold"
                            >
                                <PlusCircle className="h-5 w-5 mr-2" /> THIẾT LẬP NGAY
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <AddDebtDialog open={debtDialogOpen} onOpenChange={setDebtDialogOpen} />
            <AddRecurringDialog open={recurringDialogOpen} onOpenChange={setRecurringDialogOpen} />
        </div>
    );
}
