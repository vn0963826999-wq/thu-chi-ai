"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/lib/store";
import { format, addMonths, subMonths } from "date-fns";
import { vi } from "date-fns/locale";

// ═══════════════════════════════════════════════════════════════════════════
// MONTH FILTER COMPONENT
// Lọc dữ liệu theo tháng/năm với phong cách Glassmorphism
// ═══════════════════════════════════════════════════════════════════════════

export function MonthFilter() {
    const { selectedDate, setSelectedDate } = useFinanceStore();
    const date = new Date(selectedDate);

    const handlePrevMonth = () => {
        setSelectedDate(subMonths(date, 1));
    };

    const handleNextMonth = () => {
        setSelectedDate(addMonths(date, 1));
    };

    const handleCurrentMonth = () => {
        setSelectedDate(new Date());
    };

    return (
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-9 w-9 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            <button
                onClick={handleCurrentMonth}
                className="px-3 py-1 flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
                <Calendar className="h-4 w-4" />
                <span className="capitalize">
                    Tháng {format(date, "MM/yyyy", { locale: vi })}
                </span>
            </button>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-9 w-9 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10"
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    );
}
