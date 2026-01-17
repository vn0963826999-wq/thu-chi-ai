"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, ClipboardList, Settings, Wallet, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navItems = [
    {
        href: "/",
        label: "Thu Chi",
        icon: Home,
    },
    {
        href: "/phan-tich",
        label: "Phân tích",
        icon: PieChart,
    },
    {
        href: "/quan-ly",
        label: "Quản lý",
        icon: ClipboardList,
    },
    {
        href: "/cai-dat",
        label: "Cài đặt",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
        setShowLoginDialog(false);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <>
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-white/10 bg-[#0B0E23]">
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/20">
                        <Wallet className="h-5 w-5 text-[#22C55E]" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white">Thu Chi AI</h1>
                        <p className="text-xs text-[#94A3B8]">Quản lý tài chính</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                                    isActive
                                        ? "bg-[#22C55E]/10 text-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                                        : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]")} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer - Login/Logout */}
                <div className="border-t border-white/10 p-4">
                    {isLoggedIn ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B82F6]/20">
                                    <span className="text-sm font-bold text-[#3B82F6]">U</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">Người dùng</p>
                                    <p className="text-xs text-[#94A3B8]">user@email.com</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="w-full h-11 rounded-xl border-white/10 bg-white/5 text-[#94A3B8] hover:bg-[#EF4444]/10 hover:text-[#EF4444] hover:border-[#EF4444]/30"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Đăng xuất
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => setShowLoginDialog(true)}
                            className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90"
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            Đăng nhập
                        </Button>
                    )}
                </div>
            </aside>

            {/* Login Dialog */}
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent className="max-w-[400px] rounded-3xl border-white/10 bg-[#0F1635] p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white text-center">Đăng nhập</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label className="text-sm text-[#94A3B8]">Email</Label>
                            <Input
                                type="email"
                                placeholder="Nhập email..."
                                className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-[#94A3B8]">Mật khẩu</Label>
                            <Input
                                type="password"
                                placeholder="Nhập mật khẩu..."
                                className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#94A3B8]"
                            />
                        </div>
                        <Button
                            onClick={handleLogin}
                            className="w-full h-12 rounded-xl bg-[#22C55E] text-white hover:bg-[#22C55E]/90 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        >
                            Đăng nhập
                        </Button>
                        <p className="text-center text-sm text-[#94A3B8]">
                            Chưa có tài khoản? <button className="text-[#3B82F6] hover:underline">Đăng ký</button>
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
