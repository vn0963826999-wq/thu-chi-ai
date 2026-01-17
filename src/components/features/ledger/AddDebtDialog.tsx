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
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, ArrowDownRight, CalendarDays, User, Coins } from "lucide-react";
import { useFinanceStore, type DebtType } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddDebtDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type FormData = {
    name: string;
    amount: string;
    type: DebtType;
    dueDate: string;
    note: string;
};

const INITIAL_FORM: FormData = {
    name: "",
    amount: "",
    type: "loan",
    dueDate: "",
    note: "",
};

export function AddDebtDialog({ open, onOpenChange }: AddDebtDialogProps) {
    const { addDebt } = useFinanceStore();
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên người!");
            return;
        }
        if (!form.amount || Number(form.amount) <= 0) {
            toast.error("Vui lòng nhập số tiền hợp lệ!");
            return;
        }

        setSaving(true);

        try {
            addDebt({
                name: form.name.trim(),
                amount: Number(form.amount),
                type: form.type,
                dueDate: form.dueDate || undefined,
                note: form.note.trim() || undefined,
                status: "pending",
            });

            toast.success(`Đã thêm công nợ: ${form.name}`);
            setForm(INITIAL_FORM);
            onOpenChange(false);
        } catch (error) {
            toast.error("Lỗi khi thêm công nợ!");
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setForm(INITIAL_FORM);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-[420px] gap-5 rounded-3xl border-white/10 bg-[#0F1635] p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-yellow-500/20">
                            <Coins className="h-5 w-5 text-yellow-400" />
                        </div>
                        Thêm công nợ mới
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Debt Type Selector */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            Loại công nợ
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setForm({ ...form, type: "loan" })}
                                className={cn(
                                    "h-14 rounded-2xl border-2 transition-all duration-200",
                                    form.type === "loan"
                                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                                        : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                <ArrowUpRight className="h-5 w-5 mr-2" />
                                Cho vay
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setForm({ ...form, type: "borrow" })}
                                className={cn(
                                    "h-14 rounded-2xl border-2 transition-all duration-200",
                                    form.type === "borrow"
                                        ? "border-rose-500 bg-rose-500/20 text-rose-400"
                                        : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                <ArrowDownRight className="h-5 w-5 mr-2" />
                                Đi vay
                            </Button>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            <User className="h-3 w-3 inline mr-1" />
                            Tên người
                        </Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Ví dụ: Anh Nam, Chị Lan..."
                            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8] focus:border-yellow-500 focus:ring-yellow-500/20"
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
                            className="h-12 rounded-xl border-white/10 bg-white/5 text-white text-lg font-mono placeholder:text-[#94A3B8] focus:border-yellow-500 focus:ring-yellow-500/20"
                        />
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            <CalendarDays className="h-3 w-3 inline mr-1" />
                            Ngày hạn (tùy chọn)
                        </Label>
                        <Input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8] focus:border-yellow-500 focus:ring-yellow-500/20"
                        />
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-[#94A3B8]">
                            Ghi chú (tùy chọn)
                        </Label>
                        <Textarea
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            placeholder="Thêm ghi chú..."
                            rows={2}
                            className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8] focus:border-yellow-500 focus:ring-yellow-500/20 resize-none"
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
                        disabled={saving || !form.name.trim() || !form.amount}
                        className={cn(
                            "h-12 rounded-xl text-white font-bold transition-all duration-200 hover:scale-105",
                            form.type === "loan"
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                                : "bg-gradient-to-r from-rose-600 to-pink-600"
                        )}
                    >
                        {saving ? "Đang lưu..." : "Thêm công nợ"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
