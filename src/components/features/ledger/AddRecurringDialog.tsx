"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    RefreshCw,
    TrendingUp,
    TrendingDown,
    CalendarDays,
} from "lucide-react";
import {
    useFinanceStore,
    type TransactionType,
    type RecurringFrequency,
} from "@/lib/store";
import { ICON_MAP } from "@/lib/icon-library";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddRecurringDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type FormData = {
    name: string;
    amount: string;
    type: TransactionType;
    categoryId: string;
    accountId: string;
    frequency: RecurringFrequency;
    nextRunDate: string;
    note: string;
};

const FREQUENCY_OPTIONS: { value: RecurringFrequency; label: string }[] = [
    { value: "daily", label: "Hàng ngày" },
    { value: "weekly", label: "Hàng tuần" },
    { value: "monthly", label: "Hàng tháng" },
    { value: "yearly", label: "Hàng năm" },
];

export function AddRecurringDialog({ open, onOpenChange }: AddRecurringDialogProps) {
    const { addRecurring, categories, accounts } = useFinanceStore();

    const getDefaultDate = () => {
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        return now.toISOString().split("T")[0];
    };

    const [form, setForm] = useState<FormData>({
        name: "",
        amount: "",
        type: "expense",
        categoryId: "",
        accountId: "",
        frequency: "monthly",
        nextRunDate: getDefaultDate(),
        note: "",
    });
    const [saving, setSaving] = useState(false);

    const filteredCategories = categories.filter((cat) => cat.type === form.type);

    const handleSubmit = async () => {
        // Validation
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên giao dịch!");
            return;
        }
        if (!form.amount || Number(form.amount) <= 0) {
            toast.error("Vui lòng nhập số tiền hợp lệ!");
            return;
        }
        if (!form.categoryId) {
            toast.error("Vui lòng chọn danh mục!");
            return;
        }
        if (!form.accountId) {
            toast.error("Vui lòng chọn tài khoản!");
            return;
        }
        if (!form.nextRunDate) {
            toast.error("Vui lòng chọn ngày bắt đầu!");
            return;
        }

        setSaving(true);

        try {
            addRecurring({
                name: form.name.trim(),
                amount: Number(form.amount),
                type: form.type,
                categoryId: form.categoryId,
                accountId: form.accountId,
                frequency: form.frequency,
                nextRunDate: form.nextRunDate,
                note: form.note.trim() || undefined,
                isActive: true,
            });

            toast.success(`Đã tạo giao dịch định kỳ: ${form.name}`);
            handleClose();
        } catch (error) {
            toast.error("Lỗi khi tạo giao dịch định kỳ!");
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setForm({
            name: "",
            amount: "",
            type: "expense",
            categoryId: "",
            accountId: "",
            frequency: "monthly",
            nextRunDate: getDefaultDate(),
            note: "",
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-[460px] max-h-[90vh] overflow-y-auto gap-5 rounded-3xl border-white/10 bg-[#0F1635] p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/20">
                            <RefreshCw className="h-5 w-5 text-purple-400" />
                        </div>
                        Tạo giao dịch định kỳ
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Transaction Type Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            Loại giao dịch
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setForm({ ...form, type: "income", categoryId: "" })}
                                className={cn(
                                    "h-14 rounded-2xl border-2 transition-all duration-200",
                                    form.type === "income"
                                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                                        : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                <TrendingUp className="h-5 w-5 mr-2" />
                                Thu nhập
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setForm({ ...form, type: "expense", categoryId: "" })}
                                className={cn(
                                    "h-14 rounded-2xl border-2 transition-all duration-200",
                                    form.type === "expense"
                                        ? "border-rose-500 bg-rose-500/20 text-rose-400"
                                        : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                <TrendingDown className="h-5 w-5 mr-2" />
                                Chi tiêu
                            </Button>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            Tên giao dịch
                        </Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Ví dụ: Tiền điện, Lương tháng..."
                            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-purple-500/20"
                        />
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            Số tiền (VNĐ)
                        </Label>
                        <Input
                            type="number"
                            inputMode="numeric"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0"
                            className="h-12 rounded-xl border-white/10 bg-white/5 text-white text-lg font-mono placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-purple-500/20"
                        />
                    </div>

                    {/* Category Select */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            Danh mục
                        </Label>
                        <Select
                            value={form.categoryId}
                            onValueChange={(value) => setForm({ ...form, categoryId: value })}
                        >
                            <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 text-white focus:ring-purple-500/20">
                                <SelectValue placeholder="Chọn danh mục..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-white/10 bg-[#1E293B]">
                                {filteredCategories.map((cat) => {
                                    const Icon = ICON_MAP[cat.icon] || RefreshCw;
                                    return (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id}
                                            className="text-white focus:bg-white/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" style={{ color: cat.color }} />
                                                {cat.name}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Account Select */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            Tài khoản
                        </Label>
                        <Select
                            value={form.accountId}
                            onValueChange={(value) => setForm({ ...form, accountId: value })}
                        >
                            <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 text-white focus:ring-purple-500/20">
                                <SelectValue placeholder="Chọn tài khoản..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-white/10 bg-[#1E293B]">
                                {accounts.map((acc) => {
                                    const Icon = ICON_MAP[acc.icon] || RefreshCw;
                                    return (
                                        <SelectItem
                                            key={acc.id}
                                            value={acc.id}
                                            className="text-white focus:bg-white/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" style={{ color: acc.color }} />
                                                {acc.name}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Frequency Select */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            Tần suất
                        </Label>
                        <Select
                            value={form.frequency}
                            onValueChange={(value: RecurringFrequency) =>
                                setForm({ ...form, frequency: value })
                            }
                        >
                            <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 text-white focus:ring-purple-500/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-white/10 bg-[#1E293B]">
                                {FREQUENCY_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                        className="text-white focus:bg-white/10"
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Next Run Date */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            <CalendarDays className="h-3 w-3 inline mr-1" />
                            Ngày bắt đầu
                        </Label>
                        <Input
                            type="date"
                            value={form.nextRunDate}
                            onChange={(e) => setForm({ ...form, nextRunDate: e.target.value })}
                            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-purple-500/20"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                        disabled={saving}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving || !form.name.trim() || !form.amount || !form.categoryId || !form.accountId}
                        className="h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold transition-all duration-200 hover:scale-105"
                    >
                        {saving ? "Đang lưu..." : "Tạo định kỳ"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
