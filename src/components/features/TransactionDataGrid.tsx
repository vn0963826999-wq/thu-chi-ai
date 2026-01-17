"use client";

import React, { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
    ArrowUpDown,
    Trash2,
    Edit
} from "lucide-react";
import { useFinanceStore, formatMoney, formatDate, Transaction } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

const columnHelper = createColumnHelper<Transaction>();

export function TransactionDataGrid() {
    const { transactions, getCategoryById, getAccountById, deleteTransaction } = useFinanceStore();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const columns = useMemo(() => [
        columnHelper.accessor("date", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent text-gray-400"
                >
                    Ngày
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: info => <span className="text-gray-300">{formatDate(info.getValue())}</span>,
        }),
        columnHelper.accessor("categoryId", {
            header: "Danh mục",
            cell: info => {
                const category = getCategoryById(info.getValue());
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category?.color }}
                        />
                        <span className="text-gray-200">{category?.name}</span>
                    </div>
                );
            },
        }),
        columnHelper.accessor("amount", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent text-gray-400"
                >
                    Số tiền
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: info => {
                const isIncome = info.row.original.type === "income";
                return (
                    <span className={isIncome ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                        {isIncome ? "+" : "-"}{info.getValue().toLocaleString('vi-VN')} ₫
                    </span>
                );
            },
        }),
        columnHelper.accessor("accountId", {
            header: "Tài khoản",
            cell: info => <span className="text-gray-400">{getAccountById(info.getValue())?.name}</span>,
        }),
        columnHelper.accessor("note", {
            header: "Ghi chú",
            cell: info => (
                <span className="text-gray-400 truncate max-w-[150px] inline-block">
                    {info.getValue() || "-"}
                </span>
            ),
        }),
        columnHelper.display({
            id: "actions",
            cell: info => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/5">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1c2e] border-white/10 text-gray-200">
                        <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            onClick={() => deleteTransaction(info.row.original.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }),
    ], [getCategoryById, getAccountById, deleteTransaction]);

    const table = useReactTable({
        data: transactions,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Filters Area */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Tìm giao dịch..."
                        value={globalFilter ?? ""}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-gray-200 placeholder:text-gray-500 focus:border-cyan-500/50"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10">
                                <Filter className="mr-2 h-4 w-4" /> Lọc loại
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1a1c2e] border-white/10 text-gray-200">
                            <DropdownMenuItem onClick={() => setColumnFilters([])}>Tất cả</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => table.getColumn("type")?.setFilterValue("income")}>Thu nhập</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => table.getColumn("type")?.setFilterValue("expense")}>Chi tiêu</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-xl border border-white/10 bg-[#16182c]/60 backdrop-blur-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-white/10">
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} className="text-gray-400 font-medium h-12">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    className="border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                                    Không tìm thấy giao dịch nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-gray-400">
                    Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="bg-white/5 border-white/10 text-gray-300 disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="bg-white/5 border-white/10 text-gray-300 disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
