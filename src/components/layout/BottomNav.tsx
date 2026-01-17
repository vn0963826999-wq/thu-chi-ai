"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, ClipboardList, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// Navigation items
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

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0B0E23]/90 backdrop-blur-xl">
            {/* Height 64px */}
            <div className="mx-auto flex h-16 max-w-md items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-4 py-2 text-xs cursor-pointer transition-all duration-200",
                                isActive
                                    ? "text-[#22C55E] font-semibold"
                                    : "text-[#94A3B8] hover:text-white"
                            )}
                        >
                            <div className={cn(
                                "relative",
                                isActive && "drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                            )}>
                                <Icon
                                    className={cn(
                                        "h-6 w-6 transition-all duration-200",
                                        isActive ? "text-[#22C55E]" : "text-[#94A3B8]"
                                    )}
                                />
                            </div>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Safe area for iPhone notch */}
            <div className="h-safe-area-inset-bottom bg-[#0B0E23]" />
        </nav>
    );
}
