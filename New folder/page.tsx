"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, TrendingUp, TrendingDown, Wallet, Settings2, Palette, User } from "lucide-react";
import { ICON_MAP, getIconNameVI } from "@/lib/icon-library";
import { IconPicker } from "@/components/features/IconPicker";
import { ColorPicker } from "@/components/features/ColorPicker";
import type { DanhMuc, TaiKhoan } from "@/types";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG & INITIAL DATA
// ═══════════════════════════════════════════════════════════════════════════
type ItemType = "thu" | "chi" | "taikhoan";

const CONFIG: Record<ItemType, { title: string; icon: string; color: string; IconComponent: typeof TrendingUp }> = {
    thu: { title: "Danh mục Thu", icon: "Wallet", color: "#22c55e", IconComponent: TrendingUp },
    chi: { title: "Danh mục Chi", icon: "ShoppingCart", color: "#ef4444", IconComponent: TrendingDown },
    taikhoan: { title: "Tài khoản / Quỹ", icon: "Banknote", color: "#3b82f6", IconComponent: Wallet },
};

const MOCK_DATA = {
    thu: [
        { id: "thu-1", ten: "Lương", icon: "Wallet", mau: "#22c55e" },
        { id: "thu-2", ten: "Thưởng", icon: "Gift", mau: "#10b981" },
        { id: "thu-3", ten: "Đầu tư", icon: "TrendingUp", mau: "#14b8a6" },
    ] as DanhMuc[],
    chi: [
        { id: "chi-1", ten: "Ăn uống", icon: "Utensils", mau: "#ef4444" },
        { id: "chi-2", ten: "Di chuyển", icon: "Car", mau: "#f97316" },
        { id: "chi-3", ten: "Mua sắm", icon: "ShoppingCart", mau: "#eab308" },
        { id: "chi-4", ten: "Hóa đơn", icon: "Receipt", mau: "#ec4899" },
        { id: "chi-5", ten: "Giải trí", icon: "Gamepad2", mau: "#a855f7" },
    ] as DanhMuc[],
    taikhoan: [
        { id: "tk-1", ten: "Tiền mặt", icon: "Banknote", mau: "#22c55e", soDu: 5000000 },
        { id: "tk-2", ten: "Ngân hàng", icon: "Building2", mau: "#3b82f6", soDu: 15000000 },
        { id: "tk-3", ten: "Ví MoMo", icon: "Smartphone", mau: "#ec4899", soDu: 2000000 },
    ] as TaiKhoan[],
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function CaiDatPage() {
    // === STATE ===
    const [data, setData] = useState(MOCK_DATA);
    const [dialog, setDialog] = useState<{ open: boolean; type: ItemType; editId: string | null }>({
        open: false, type: "thu", editId: null
    });
    const [form, setForm] = useState({ ten: "", icon: "Wallet", mau: "#3b82f6", soDu: "" });
    const [saving, setSaving] = useState(false);

    // === DIALOG HANDLERS ===
    const openDialog = (type: ItemType, item?: DanhMuc | TaiKhoan) => {
        setDialog({ open: true, type, editId: item?.id || null });
        if (item) {
            setForm({ ten: item.ten, icon: item.icon, mau: item.mau, soDu: "soDu" in item ? String(item.soDu) : "" });
        } else {
            setForm({ ten: "", icon: CONFIG[type].icon, mau: CONFIG[type].color, soDu: "" });
        }
    };

    const closeDialog = () => setDialog(d => ({ ...d, open: false }));

    const saveItem = () => {
        if (!form.ten.trim()) return;
        const { type, editId } = dialog;

        setData(prev => {
            const list = [...prev[type]];
            const item = type === "taikhoan"
                ? { id: editId || `tk-${Date.now()}`, ten: form.ten, icon: form.icon, mau: form.mau, soDu: Number(form.soDu) || 0 }
                : { id: editId || `${type}-${Date.now()}`, ten: form.ten, icon: form.icon, mau: form.mau };

            if (editId) {
                const idx = list.findIndex(i => i.id === editId);
                if (idx >= 0) list[idx] = item as typeof list[0];
            } else {
                list.push(item as typeof list[0]);
            }
            return { ...prev, [type]: list };
        });
        closeDialog();
    };

    const deleteItem = (type: ItemType, id: string) => {
        setData(prev => ({ ...prev, [type]: prev[type].filter(i => i.id !== id) }));
    };

    // === RENDER ===
    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            <Header title="Cài đặt" />

            {/* Desktop Title */}
            <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
                <p className="text-[#94A3B8]">Quản lý danh mục và tài khoản</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[#22C55E]/20 bg-[#22C55E]/10 p-3 lg:p-4 text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-[#22C55E]">{data.thu.length}</p>
                    <p className="text-xs text-[#94A3B8]">Danh mục Thu</p>
                </div>
                <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 p-3 lg:p-4 text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-[#EF4444]">{data.chi.length}</p>
                    <p className="text-xs text-[#94A3B8]">Danh mục Chi</p>
                </div>
                <div className="rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/10 p-3 lg:p-4 text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-[#3B82F6]">{data.taikhoan.length}</p>
                    <p className="text-xs text-[#94A3B8]">Tài khoản</p>
                </div>
            </div>

            {/* Categories Grid - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {(["thu", "chi", "taikhoan"] as ItemType[]).map((type) => {
                    const config = CONFIG[type];
                    const HeaderIcon = config.IconComponent;

                    return (
                        <div key={type} className="rounded-2xl border border-white/10 bg-[#0F1635] overflow-hidden">
                            {/* Card Header */}
                            <div className="flex items-center justify-between px-4 lg:px-5 py-4 border-b border-white/5" style={{ backgroundColor: `${config.color}10` }}>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${config.color}20` }}>
                                        <HeaderIcon className="h-5 w-5" style={{ color: config.color }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{config.title}</h3>
                                        <p className="text-xs text-[#94A3B8]">{data[type].length} mục</p>
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    className="h-10 w-10 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
                                    style={{ backgroundColor: config.color }}
                                    onClick={() => openDialog(type)}
                                    aria-label={`Thêm ${config.title}`}
                                >
                                    <Plus className="h-5 w-5 text-white" />
                                </Button>
                            </div>

                            {/* Card Body - Items List */}
                            <div className="p-2">
                                {data[type].length === 0 ? (
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
                                        {data[type].map((item) => {
                                            const Icon = ICON_MAP[item.icon] || Plus;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5"
                                                >
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                                                        style={{ backgroundColor: `${item.mau}20` }}
                                                    >
                                                        <Icon className="h-5 w-5" style={{ color: item.mau }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-white truncate">{item.ten}</p>
                                                        {"soDu" in item && (
                                                            <p className="text-sm text-[#94A3B8]">
                                                                {(item as TaiKhoan).soDu.toLocaleString("vi-VN")} ₫
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-9 w-9 rounded-lg hover:bg-white/10"
                                                            onClick={(e) => { e.stopPropagation(); openDialog(type, item); }}
                                                            aria-label={`Sửa ${item.ten}`}
                                                        >
                                                            <Pencil className="h-4 w-4 text-[#94A3B8]" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-9 w-9 rounded-lg hover:bg-[#EF4444]/20"
                                                            onClick={(e) => { e.stopPropagation(); deleteItem(type, item.id); }}
                                                            aria-label={`Xóa ${item.ten}`}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-[#EF4444]" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
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
