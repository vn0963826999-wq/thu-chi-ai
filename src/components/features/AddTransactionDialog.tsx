"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Plus, Calendar, MessageSquare, Wallet, ArrowRightLeft,
    Receipt, Scan, ChevronDown, Sparkles, FolderOpen,
    TrendingUp, TrendingDown, Building2, Smartphone, PiggyBank, Bitcoin,
    Utensils, Car, ShoppingCart, Heart, Gamepad2, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinanceStore, type TransactionType } from "@/lib/store";
import { ICON_MAP } from "@/lib/icon-library";
import { cn } from "@/lib/utils";
import { aiService } from "@/lib/ai-service";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY: Convert number to Vietnamese text
// ═══════════════════════════════════════════════════════════════════════════

const ONES = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const readThreeDigits = (num: number, showZeroHundred: boolean): string => {
    const hundred = Math.floor(num / 100);
    const ten = Math.floor((num % 100) / 10);
    const one = num % 10;

    let result = "";
    if (hundred > 0) result += ONES[hundred] + " trăm ";
    else if (showZeroHundred) result += "không trăm ";

    if (ten === 0 && one > 0 && (hundred > 0 || showZeroHundred)) result += "lẻ ";
    else if (ten === 1) result += "mười ";
    else if (ten > 1) result += ONES[ten] + " mươi ";

    if (one === 1 && ten > 1) result += "mốt";
    else if (one === 5 && ten > 0) result += "lăm";
    else if (one > 0) result += ONES[one];

    return result.trim();
};

const readMoneyToVietnamese = (amount: number): string => {
    if (amount === 0) return "Không đồng";

    const units = ["", "nghìn", "triệu", "tỷ"];
    let result = "";
    let unitIndex = 0;

    while (amount > 0) {
        const threeDigits = amount % 1000;
        if (threeDigits > 0) {
            const part = readThreeDigits(threeDigits, unitIndex > 0 && amount >= 1000);
            result = part + " " + units[unitIndex] + " " + result;
        }
        amount = Math.floor(amount / 1000);
        unitIndex++;
    }

    return result.trim().replace(/\s+/g, " ") + " đồng";
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

type DialogTransactionType = "expense" | "income" | "transfer";

const transactionSchema = z.object({
    amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
    categoryId: z.string().optional(),
    accountId: z.string().min(1, "Vui lòng chọn tài khoản"),
    toAccountId: z.string().optional(),
    date: z.string().min(1, "Vui lòng chọn ngày"),
    note: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultTab?: DialogTransactionType;
    children?: React.ReactNode; // Custom trigger
}

export function AddTransactionDialog({
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    defaultTab = "expense",
    children
}: AddTransactionDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const [type, setType] = useState<DialogTransactionType>(defaultTab);
    const [amountValue, setAmountValue] = useState(0);
    const [amountDisplay, setAmountDisplay] = useState("");
    const [ocrMode, setOcrMode] = useState("gemini");
    const [isScanning, setIsScanning] = useState(false);

    const { categories, accounts, addTransaction, getCategoriesByType } = useFinanceStore();

    // Reset loop or Sync defaultTab when opening
    useEffect(() => {
        if (open) {
            setType(defaultTab);
        }
    }, [open, defaultTab]);

    // Filter categories based on type
    const filteredCategories = type === "transfer"
        ? []
        : getCategoriesByType(type === "expense" ? "expense" : "income");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            note: "",
        },
    });

    const selectedAccountId = watch("accountId");

    // Handle AI Scan
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        const scanPromise = aiService.scanReceipt(file);

        toast.promise(scanPromise, {
            loading: 'AI đang đọc hóa đơn...',
            success: (data) => {
                setValue("amount", data.amount);
                setAmountValue(data.amount);
                setAmountDisplay(data.amount.toLocaleString("vi-VN"));
                setValue("note", data.note || "");
                if (data.category) setValue("categoryId", data.category);
                setIsScanning(false);
                return 'Đã quét xong! Vui lòng kiểm tra lại thông tin.';
            },
            error: (err) => {
                setIsScanning(false);
                return err.message || 'Lỗi khi quét hóa đơn';
            },
        });
    };

    const triggerFileSelect = () => {
        document.getElementById("receipt-upload")?.click();
    };

    // Update amount in form when amountValue changes
    useEffect(() => {
        setValue("amount", amountValue);
    }, [amountValue, setValue]);

    // Handle amount input change
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        const numValue = parseInt(value) || 0;
        setAmountValue(numValue);
        setAmountDisplay(numValue.toLocaleString("vi-VN"));
    };

    // Add zeros to amount
    const addZeros = (zeros: string) => {
        const newValue = parseInt(amountValue.toString() + zeros) || 0;
        setAmountValue(newValue);
        setAmountDisplay(newValue.toLocaleString("vi-VN"));
    };

    // Reset form when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (setOpen) setOpen(newOpen);
        if (newOpen) {
            reset({
                date: format(new Date(), "yyyy-MM-dd"),
                note: "",
            });
            setAmountValue(0);
            setAmountDisplay("");
            // Don't reset type here, let the effect handle it or keep current
        }
    };

    // Submit handler
    const onSubmit = (data: TransactionFormData) => {
        if (type === "transfer") {
            // TODO: Implement transfer logic
            console.log("Transfer:", data);
        } else {
            addTransaction({
                ...data,
                categoryId: data.categoryId || "",
                type: type === "expense" ? "expense" : "income",
            });
        }
        if (setOpen) setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {children ? (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button className="md:col-span-1 h-16 lg:h-20 flex-col gap-2 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#3B82F6] text-white hover:opacity-90 shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300 hover:scale-[1.02]">
                        <Plus className="h-6 w-6" />
                        <span className="text-sm font-bold">Thêm Thu Chi</span>
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="max-w-2xl gap-0 rounded-3xl border-white/10 bg-[#0B0E23] p-0 overflow-hidden">
                <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <DialogHeader className="bg-gradient-to-r from-[#1E3A5F] to-[#0F1635] px-6 py-5 border-b border-white/10">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        {isScanning && <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />}
                        Thêm Giao dịch
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* 3-Tab Switcher */}
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-white/5">
                        <button
                            type="button"
                            onClick={() => setType("expense")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200",
                                type === "expense"
                                    ? "bg-[#EF4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                            )}
                        >
                            <TrendingDown className="h-4 w-4" />
                            Chi tiêu
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("income")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200",
                                type === "income"
                                    ? "bg-[#22C55E] text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                            )}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Thu nhập
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("transfer")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200",
                                type === "transfer"
                                    ? "bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                            )}
                        >
                            <ArrowRightLeft className="h-4 w-4" />
                            Chuyển khoản
                        </button>
                    </div>

                    {/* Form Grid - 2 columns */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm text-[#94A3B8]">Tài khoản</Label>
                            <select
                                {...register("accountId")}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#3B82F6] outline-none"
                            >
                                <option value="" className="bg-[#0B0E23]">Chọn tài khoản...</option>
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id} className="bg-[#0B0E23]">
                                        {acc.name} - {acc.balance.toLocaleString("vi-VN")} ₫
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            {type === "transfer" ? (
                                <>
                                    <Label className="text-sm text-[#94A3B8]">Đến tài khoản</Label>
                                    <select
                                        {...register("toAccountId")}
                                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                                    >
                                        <option value="" className="bg-[#0B0E23]">Chọn tài khoản đích...</option>
                                        {accounts.filter(a => a.id !== selectedAccountId).map((acc) => (
                                            <option key={acc.id} value={acc.id} className="bg-[#0B0E23]">
                                                {acc.name}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <>
                                    <Label className="text-sm text-[#94A3B8]">Danh mục</Label>
                                    <select
                                        {...register("categoryId")}
                                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                                    >
                                        <option value="" className="bg-[#0B0E23]">Chọn danh mục...</option>
                                        {filteredCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id} className="bg-[#0B0E23]">
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-[#94A3B8]">Ngày giao dịch</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                                <Input
                                    type="date"
                                    {...register("date")}
                                    className="h-12 pl-12 rounded-xl border-white/10 bg-white/5 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-[#94A3B8]">Chế độ OCR</Label>
                            <div className="flex h-12 items-center px-4 rounded-xl bg-white/5 border border-white/10 text-cyan-400 gap-2 font-medium">
                                <Sparkles className="h-4 w-4" /> Gemini AI Vision
                            </div>
                        </div>
                    </div>

                    {/* Amount Input Section */}
                    <div className="space-y-2">
                        <Label className="text-sm text-[#94A3B8]">Số tiền</Label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={amountDisplay}
                                    onChange={handleAmountChange}
                                    placeholder="0"
                                    className={cn(
                                        "h-16 rounded-xl border-white/10 bg-white/5 text-4xl font-bold",
                                        type === "expense" ? "text-[#EF4444]" : type === "income" ? "text-[#22C55E]" : "text-[#3B82F6]"
                                    )}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#94A3B8]">₫</span>
                            </div>
                            <div className="flex gap-1">
                                <Button type="button" variant="outline" onClick={() => addZeros("000")} className="h-12 px-4 rounded-xl border-white/10 bg-white/5 text-white">+000</Button>
                            </div>
                        </div>
                        <p className="text-sm text-[#94A3B8] italic">
                            {amountValue > 0 ? readMoneyToVietnamese(amountValue) : "Nhập số tiền..."}
                        </p>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label className="text-sm text-[#94A3B8]">Ghi chú</Label>
                        <textarea
                            {...register("note")}
                            placeholder="Nhập ghi chú hoặc AI sẽ điền giúp bạn..."
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#94A3B8]/50 focus:border-[#3B82F6] outline-none resize-none"
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={triggerFileSelect}
                                disabled={isScanning}
                                className="h-11 rounded-xl border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            >
                                <Scan className="h-4 w-4 mr-2" />
                                {isScanning ? "Đang quét..." : "Scan Hóa đơn"}
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen && setOpen(false)}
                                className="h-11 px-6 rounded-xl text-[#94A3B8]"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isScanning}
                                className={cn(
                                    "h-11 px-8 rounded-xl font-semibold text-white",
                                    type === "expense" ? "bg-[#EF4444]" : type === "income" ? "bg-[#22C55E]" : "bg-[#3B82F6]"
                                )}
                            >
                                {isSubmitting ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

