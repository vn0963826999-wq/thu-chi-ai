"use client";

import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
    title: string;
    onAddClick?: () => void;
    showAddButton?: boolean;
    rightContent?: ReactNode;
    className?: string;
};

export function Header({
    title,
    onAddClick,
    showAddButton = false,
    rightContent,
    className,
}: HeaderProps) {
    return (
        <header
            className={cn(
                // Fixed top-0, transparent + blur, hidden on desktop
                "lg:hidden fixed top-0 left-0 right-0 z-40",
                "border-b border-white/10 bg-[#0B0E23]/80 backdrop-blur-xl",
                className
            )}
        >
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                {/* Tiêu đề - chữ đậm */}
                <h1 className="text-lg font-bold">{title}</h1>

                {/* Nút thêm mới (nếu có) */}
                {showAddButton && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={onAddClick}
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                )}

                {/* Nội dung bên phải tùy chỉnh */}
                {rightContent}
            </div>
        </header>
    );
}
