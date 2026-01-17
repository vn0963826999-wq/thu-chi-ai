"use client";

import React, { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import {
    FileText,
    FileSpreadsheet,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
} from "lucide-react";
import { format, isWithinInterval, parseISO, isBefore } from "date-fns";
import { useFinanceStore, type Transaction } from "@/lib/store";
import { ICON_MAP } from "@/lib/icon-library";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Sub-components
import { LedgerFilters } from "./LedgerFilters";
import { LedgerSummary } from "./LedgerSummary";

const columnHelper = createColumnHelper<Transaction & { runningBalance: number }>();

export function TransactionLedger() {
    const { transactions, categories, accounts, deleteTransaction } = useFinanceStore();

    // Filters State
    const [dateRange, setDateRange] = useState({
        from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
    });
    const [accountFilter, setAccountFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Ledger Data with Running Balance
    const ledgerData = useMemo(() => {
        const accountTxs = accountFilter === "all"
            ? transactions
            : transactions.filter(t => t.accountId === accountFilter);

        const sortedTxs = [...accountTxs].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let currentBalance = 0;
        const processedData = sortedTxs.map(tx => {
            const amount = tx.type === "income" ? tx.amount : -tx.amount;
            currentBalance += amount;
            return { ...tx, runningBalance: currentBalance };
        });

        return processedData.filter(tx => {
            const txDate = parseISO(tx.date);
            const inDateRange = isWithinInterval(txDate, {
                start: parseISO(dateRange.from),
                end: parseISO(dateRange.to)
            });
            const matchesType = typeFilter === "all" || tx.type === typeFilter;
            const matchesSearch = tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                categories.find(c => c.id === tx.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase());

            return inDateRange && matchesType && matchesSearch;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, dateRange, accountFilter, typeFilter, searchTerm, categories]);

    // Summary Stats
    const stats = useMemo(() => {
        const income = ledgerData.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expense = ledgerData.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

        const fromDate = parseISO(dateRange.from);
        const txsBefore = transactions
            .filter(t => (accountFilter === "all" || t.accountId === accountFilter) && isBefore(parseISO(t.date), fromDate));
        const openingBal = txsBefore.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);

        return { opening: openingBal, income, expense, closing: openingBal + income - expense };
    }, [ledgerData, transactions, dateRange.from, accountFilter]);

    // Columns
    const columns = [
        columnHelper.accessor("date", {
            header: "Ngày",
            cell: info => <span className="text-gray-400">{format(parseISO(info.getValue()), "dd/MM/yyyy")}</span>,
        }),
        columnHelper.accessor("accountId", {
            header: "Tài khoản",
            cell: info => {
                const acc = accounts.find(a => a.id === info.getValue());
                return (
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><FileText className="h-3.5 w-3.5" /></div>
                        <span className="font-medium text-gray-200">{acc?.name || "N/A"}</span>
                    </div>
                );
            },
        }),
        columnHelper.accessor("type", {
            header: "Loại",
            cell: info => (
                <Badge className={cn("font-bold border-none", info.getValue() === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                    {info.getValue() === "income" ? "THU" : "CHI"}
                </Badge>
            ),
        }),
        columnHelper.accessor("categoryId", {
            header: "Danh mục",
            cell: info => {
                const cat = categories.find(c => c.id === info.getValue());
                const Icon = ICON_MAP[cat?.icon as keyof typeof ICON_MAP] || ICON_MAP.HelpCircle;
                return (
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/5 text-gray-400"><Icon className="h-3.5 w-3.5" /></div>
                        <span className="text-gray-300">{cat?.name || "Khác"}</span>
                    </div>
                );
            },
        }),
        columnHelper.accessor("amount", {
            header: "Số tiền",
            cell: info => {
                const isIncome = info.row.original.type === "income";
                return (
                    <span className={cn("font-mono font-bold text-lg", isIncome ? "text-[#22C55E]" : "text-[#EF4444]")}>
                        {isIncome ? "+" : "-"}{info.getValue().toLocaleString("vi-VN")} ₫
                    </span>
                );
            },
        }),
        columnHelper.accessor("runningBalance", {
            header: "Số dư TK",
            cell: info => <span className="font-mono text-cyan-400/80">{info.getValue().toLocaleString("vi-VN")} ₫</span>,
        }),
        columnHelper.accessor("note", {
            header: "Nội dung",
            cell: info => <span className="text-gray-500 truncate max-w-[150px] inline-block">{info.getValue() || "---"}</span>,
        }),
        {
            id: "actions",
            header: "Thao tác",
            cell: (info: any) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTransaction(info.row.original.id)} className="h-8 w-8 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
            ),
        }
    ];

    const table = useReactTable({
        data: ledgerData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    // Export Functions
    const exportExcel = () => {
        const data = ledgerData.map(t => ({
            Ngày: format(parseISO(t.date), "dd/MM/yyyy"),
            Tài_Khoản: accounts.find(a => a.id === t.accountId)?.name,
            Loại: t.type === "income" ? "Thu" : "Chi",
            Danh_Mục: categories.find(c => c.id === t.categoryId)?.name,
            Số_Tiền: t.amount,
            Số_Dư_Lũy_Kế: t.runningBalance,
            Ghi_Chú: t.note
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sổ Giao Dịch");
        XLSX.writeFile(wb, `So_Giao_Dich_${format(new Date(), "yyyyMMdd")}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("SO GIAO DICH CHI TIET", 14, 15);
        autoTable(doc, {
            head: [['Ngay', 'Tai khoan', 'Loai', 'Danh muc', 'So tien', 'So du']],
            body: ledgerData.map(t => [
                format(parseISO(t.date), "dd/MM/yyyy"),
                accounts.find(a => a.id === t.accountId)?.name || "",
                t.type === "income" ? "Thu" : "Chi",
                categories.find(c => c.id === t.categoryId)?.name || "",
                t.amount.toLocaleString(),
                t.runningBalance.toLocaleString()
            ]),
            startY: 20,
        });
        doc.save(`So_Giao_Dich_${format(new Date(), "yyyyMMdd")}.pdf`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Filter Bar */}
            <LedgerFilters
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                accountFilter={accountFilter}
                onAccountFilterChange={setAccountFilter}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                accounts={accounts}
            />

            {/* Summary Strip */}
            <LedgerSummary stats={stats} />

            {/* Main Table */}
            <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} className="text-gray-400 font-bold h-12">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-40 text-center text-gray-500 italic">
                                    Không có giao dịch nào trong khoảng thời gian này.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-white/10 bg-white/5">
                    <p className="text-sm text-gray-400">Hiển thị {ledgerData.length} kết quả</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="bg-transparent border-white/10 text-gray-400 hover:text-white">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="bg-transparent border-white/10 text-gray-400 hover:text-white">
                            Sau <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-3">
                    <Button onClick={exportExcel} variant="outline" className="h-11 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
                        <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                    </Button>
                    <Button onClick={exportPDF} variant="outline" className="h-11 border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">
                        <FileText className="h-4 w-4 mr-2" /> PDF
                    </Button>
                </div>

                <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 shadow-lg shadow-purple-500/20">
                    <MessageSquare className="h-4 w-4 mr-2" /> AI Chat Phân Tích
                </Button>
            </div>
        </div>
    );
}
