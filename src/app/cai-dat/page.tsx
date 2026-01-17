"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, TrendingUp, TrendingDown, Wallet, Palette, User, BrainCircuit, Key } from "lucide-react";
import { ICON_MAP, getIconNameVI } from "@/lib/icon-library";
import { IconPicker } from "@/components/features/IconPicker";
import { ColorPicker } from "@/components/features/ColorPicker";
import { useFinanceStore, type Category, type Account, type TransactionType, formatMoney } from "@/lib/store";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════
type ItemType = "thu" | "chi" | "taikhoan";

const CONFIG: Record<ItemType, { title: string; icon: string; color: string; IconComponent: typeof TrendingUp }> = {
    thu: { title: "Danh mục Thu", icon: "Wallet", color: "#22c55e", IconComponent: TrendingUp },
    chi: { title: "Danh mục Chi", icon: "ShoppingCart", color: "#ef4444", IconComponent: TrendingDown },
    taikhoan: { title: "Tài khoản / Quỹ", icon: "Banknote", color: "#3b82f6", IconComponent: Wallet },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function CaiDatPage() {
    // Get data from Zustand store
    const {
        categories,
        accounts,
        addCategory,
        deleteCategory,
        addAccount,
        deleteAccount,
    } = useFinanceStore();

    // Transform data for UI
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    // === STATE ===
    const [dialog, setDialog] = useState<{ open: boolean; type: ItemType; editId: string | null }>({
        open: false, type: "thu", editId: null
    });
    const [form, setForm] = useState({ ten: "", icon: "Wallet", mau: "#3b82f6", soDu: "" });
    const [saving, setSaving] = useState(false);

    // AI Key State
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);

    // Load AI Key on Mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedKey = localStorage.getItem("USER_GEMINI_API_KEY");
            if (savedKey) setApiKey(savedKey);
        }
    }, []);

    const saveApiKey = () => {
        if (!apiKey.trim()) {
            localStorage.removeItem("USER_GEMINI_API_KEY");
            toast.success("Đã xóa API Key");
            return;
        }
        localStorage.setItem("USER_GEMINI_API_KEY", apiKey.trim());
        toast.success("Đã lưu cấu hình AI thành công!");
    };

    // === DIALOG HANDLERS ===
    const openDialog = (type: ItemType, item?: Category | Account) => {
        setDialog({ open: true, type, editId: item?.id || null });
        if (item) {
            setForm({
                ten: item.name,
                icon: item.icon,
                mau: item.color,
                soDu: "balance" in item ? String(item.balance) : ""
            });
        } else {
            setForm({ ten: "", icon: CONFIG[type].icon, mau: CONFIG[type].color, soDu: "" });
        }
    };

    const closeDialog = () => setDialog(d => ({ ...d, open: false }));

    const saveItem = () => {
        if (!form.ten.trim()) {
            toast.error("Vui lòng nhập tên!");
            return;
        }

        const { type, editId } = dialog;
        setSaving(true);

        try {
            if (type === "taikhoan") {
                // Add account
                addAccount({
                    name: form.ten.trim(),
                    icon: form.icon,
                    color: form.mau,
                    initialBalance: Number(form.soDu) || 0
                });
                toast.success(`Đã thêm tài khoản: ${form.ten}`);
            } else {
                // Add category
                const categoryType: TransactionType = type === "thu" ? "income" : "expense";
                addCategory({
                    name: form.ten.trim(),
                    icon: form.icon,
                    color: form.mau,
                    type: categoryType
                });
                toast.success(`Đã thêm danh mục: ${form.ten}`);
            }
            closeDialog();
        } catch (error) {
            toast.error("Lỗi khi lưu!");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = (type: ItemType, id: string, name: string) => {
        if (type === "taikhoan") {
            deleteAccount(id);
            toast.success(`Đã xóa tài khoản: ${name}`);
        } else {
            deleteCategory(id);
            toast.success(`Đã xóa danh mục: ${name}`);
        }
    };

    // Helper to render item list
    const renderItems = (type: ItemType, items: (Category | Account)[]) => {
        const config = CONFIG[type];

        return items.length === 0 ? (
            <div className="py-8 text-center text-[#94A3B8]">
                <p className="text-sm">Chưa có mục nào</p>
                <button
                    className="mt-2 text-sm hover:underline"
                    style={{ color: config.color }}
                    onClick={() => openDialog(type)}
                >
                    + Thêm mới
                </button>
            </div>
        ) : (
            <div className="space-y-1">
                {items.map((item) => {
                    const Icon = ICON_MAP[item.icon] || Plus;
                    const isAccount = "balance" in item;
                    return (
                        <div
                            key={item.id}
                            className="group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5"
                        >
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                                style={{ backgroundColor: `${item.color}20` }}
                            >
                                <Icon className="h-5 w-5" style={{ color: item.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{item.name}</p>
                                {isAccount && (
                                    <p className="text-sm text-[#94A3B8]">
                                        {formatMoney((item as Account).balance)}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-lg hover:bg-[#EF4444]/20"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteItem(type, item.id, item.name); }}
                                    aria-label={`Xóa ${item.name}`}
                                >
                                    <Trash2 className="h-4 w-4 text-[#EF4444]" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // === RENDER ===
    return (
        <div className="flex flex-col gap-4 lg:gap-6 pb-20 lg:pb-0">
            <Header title="Cài đặt" />

            {/* Desktop Title */}
            <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
                <p className="text-[#94A3B8]">Quản lý danh mục và tài khoản</p>
            </div>

            {/* Config AI Section */}
            <div className="rounded-2xl border border-white/10 bg-[#0F1635] p-4 lg:p-5 mt-4 group hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <BrainCircuit className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Cấu hình AI (Gemini)</h3>
                        <p className="text-xs text-[#94A3B8]">Nhập Key riêng để dùng AI không giới hạn</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm text-[#94A3B8]">Google Gemini API Key</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    type={showKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Dán API Key vào đây (bắt đầu bằng AIza...)"
                                    className="pl-9 h-11 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-gray-600 focus:border-purple-500/50"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowKey(!showKey)}
                                className="h-11 px-3 border-white/10 bg-white/5 text-white hover:bg-white/10 w-16"
                            >
                                {showKey ? "Ẩn" : "Hiện"}
                            </Button>
                        </div>
                        <p className="text-[10px] text-gray-500">
                            * Key được lưu an toàn trên trình duyệt của bạn (Local Storage). <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-purple-400 hover:underline">Lấy Key miễn phí tại đây</a>
                        </p>
                    </div>
                    <Button
                        onClick={saveApiKey}
                        className="w-full h-11 rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
                    >
                        Lưu Cấu Hình AI
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-3 lg:p-4 text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-[#22C55E]">{incomeCategories.length}</p>
                    <p className="text-xs text-[#94A3B8]">Danh mục Thu</p>
                </div>
                <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 p-3 lg:p-4 text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-[#EF4444]">{expenseCategories.length}</p>
                    <p className="text-xs text-[#94A3B8]">Danh mục Chi</p>
                </div>
                <div className="rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/10 p-3 lg:p-4 text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-[#3B82F6]">{accounts.length}</p>
                    <p className="text-xs text-[#94A3B8]">Tài khoản</p>
                </div>
            </div>

            {/* Categories Grid - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {/* Income Categories */}
                <div className="rounded-2xl border border-white/10 bg-[#0F1635] overflow-hidden">
                    <div className="flex items-center justify-between px-4 lg:px-5 py-4 border-b border-white/5" style={{ backgroundColor: `${CONFIG.thu.color}10` }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${CONFIG.thu.color}20` }}>
                                <TrendingUp className="h-5 w-5" style={{ color: CONFIG.thu.color }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{CONFIG.thu.title}</h3>
                                <p className="text-xs text-[#94A3B8]">{incomeCategories.length} mục</p>
                            </div>
                        </div>
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: CONFIG.thu.color }}
                            onClick={() => openDialog("thu")}
                            aria-label="Thêm Danh mục Thu"
                        >
                            <Plus className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                    <div className="p-2">{renderItems("thu", incomeCategories)}</div>
                </div>

                {/* Expense Categories */}
                <div className="rounded-2xl border border-white/10 bg-[#0F1635] overflow-hidden">
                    <div className="flex items-center justify-between px-4 lg:px-5 py-4 border-b border-white/5" style={{ backgroundColor: `${CONFIG.chi.color}10` }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${CONFIG.chi.color}20` }}>
                                <TrendingDown className="h-5 w-5" style={{ color: CONFIG.chi.color }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{CONFIG.chi.title}</h3>
                                <p className="text-xs text-[#94A3B8]">{expenseCategories.length} mục</p>
                            </div>
                        </div>
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: CONFIG.chi.color }}
                            onClick={() => openDialog("chi")}
                            aria-label="Thêm Danh mục Chi"
                        >
                            <Plus className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                    <div className="p-2">{renderItems("chi", expenseCategories)}</div>
                </div>

                {/* Accounts */}
                <div className="rounded-2xl border border-white/10 bg-[#0F1635] overflow-hidden">
                    <div className="flex items-center justify-between px-4 lg:px-5 py-4 border-b border-white/5" style={{ backgroundColor: `${CONFIG.taikhoan.color}10` }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${CONFIG.taikhoan.color}20` }}>
                                <Wallet className="h-5 w-5" style={{ color: CONFIG.taikhoan.color }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{CONFIG.taikhoan.title}</h3>
                                <p className="text-xs text-[#94A3B8]">{accounts.length} mục</p>
                            </div>
                        </div>
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: CONFIG.taikhoan.color }}
                            onClick={() => openDialog("taikhoan")}
                            aria-label="Thêm Tài khoản"
                        >
                            <Plus className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                    <div className="p-2">{renderItems("taikhoan", accounts)}</div>
                </div>
            </div>

            {/* Additional Settings Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#0F1635] p-4 lg:p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/20">
                            <Palette className="h-5 w-5 text-[#8B5CF6]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Giao diện</h3>
                            <p className="text-xs text-[#94A3B8]">Tùy chỉnh màu sắc, theme</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
                        Tùy chỉnh giao diện
                    </Button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0F1635] p-4 lg:p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/20">
                            <User className="h-5 w-5 text-[#F59E0B]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Tài khoản</h3>
                            <p className="text-xs text-[#94A3B8]">Đồng bộ, sao lưu dữ liệu</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
                        Quản lý tài khoản
                    </Button>
                </div>
            </div>

            {/* Dialog - Updated with dark theme */}
            <Dialog open={dialog.open} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-w-[400px] gap-5 rounded-3xl border-white/10 bg-[#0F1635] p-6 sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">
                            {dialog.editId ? "Sửa" : "Thêm"} {CONFIG[dialog.type].title.toLowerCase()}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-[#94A3B8]">Tên</Label>
                            <Input
                                value={form.ten}
                                onChange={(e) => setForm({ ...form, ten: e.target.value })}
                                placeholder="Nhập tên..."
                                className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
                            />
                        </div>

                        {dialog.type === "taikhoan" && (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-[#94A3B8]">Số dư</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    value={form.soDu}
                                    onChange={(e) => setForm({ ...form, soDu: e.target.value })}
                                    placeholder="0"
                                    className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8]"
                                />
                            </div>
                        )}

                        <div className="h-px bg-white/10" />

                        <ColorPicker selectedColor={form.mau} onSelectColor={(mau) => setForm({ ...form, mau })} />

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="text-sm font-medium text-white">Biểu tượng</Label>
                                {form.icon && <span className="text-xs" style={{ color: form.mau }}>Đang chọn: {getIconNameVI(form.icon)}</span>}
                            </div>
                            <IconPicker selectedIcon={form.icon} onSelectIcon={(icon) => setForm({ ...form, icon })} color={form.mau} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={closeDialog}
                            className="h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                            disabled={saving}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={saveItem}
                            className="h-12 rounded-xl text-white shadow-lg transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: form.mau, boxShadow: `0 0 20px ${form.mau}40` }}
                            disabled={saving || !form.ten.trim()}
                        >
                            {saving ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
