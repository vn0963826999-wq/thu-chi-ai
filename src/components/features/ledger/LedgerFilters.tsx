"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Account } from "@/lib/store";

interface LedgerFiltersProps {
    dateRange: { from: string; to: string };
    onDateRangeChange: (range: { from: string; to: string }) => void;
    accountFilter: string;
    onAccountFilterChange: (value: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    accounts: Account[];
}

export function LedgerFilters({
    dateRange,
    onDateRangeChange,
    accountFilter,
    onAccountFilterChange,
    searchTerm,
    onSearchChange,
    accounts,
}: LedgerFiltersProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Từ ngày</label>
                <Input
                    type="date"
                    value={dateRange.from}
                    onChange={e => onDateRangeChange({ ...dateRange, from: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Đến ngày</label>
                <Input
                    type="date"
                    value={dateRange.to}
                    onChange={e => onDateRangeChange({ ...dateRange, to: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Tài khoản</label>
                <select
                    value={accountFilter}
                    onChange={e => onAccountFilterChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all" className="bg-[#0B0E23]">Tất cả tài khoản</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id} className="bg-[#0B0E23]">{acc.name}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Tìm kiếm</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Nội dung/Danh mục..."
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-white"
                    />
                </div>
            </div>
            <div className="flex items-end">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20">
                    <Filter className="h-4 w-4 mr-2" /> Lọc
                </Button>
            </div>
        </div>
    );
}
