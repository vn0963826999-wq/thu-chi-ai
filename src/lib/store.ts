import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type TransactionType = 'income' | 'expense' | 'transfer';
export type DebtType = 'loan' | 'borrow';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Debt {
    id: string;
    name: string;
    amount: number;
    type: DebtType;
    dueDate?: string;
    status: 'pending' | 'paid';
    note?: string;
    createdAt: string;
}

export interface RecurringTransaction {
    id: string;
    name: string;
    amount: number;
    type: TransactionType;
    categoryId: string;
    accountId: string;
    frequency: RecurringFrequency;
    nextRunDate: string;
    note?: string;
    isActive: boolean;
}

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    categoryId: string;
    accountId: string;
    date: string; // ISO string YYYY-MM-DD
    note?: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
}

export interface Account {
    id: string;
    name: string;
    icon: string;
    color: string;
    balance: number;
}

export interface TransactionInput {
    amount: number;
    type: TransactionType;
    categoryId: string;
    accountId: string;
    toAccountId?: string; // For transfer
    date: string;
    note?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

interface FinanceStore {
    // State
    transactions: Transaction[];
    categories: Category[];
    accounts: Account[];
    debts: Debt[];
    recurringTransactions: RecurringTransaction[];
    selectedDate: string; // ISO string
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    fetchInitialData: () => Promise<void>;
    setSelectedDate: (date: Date) => void;

    // Transaction Actions
    addTransaction: (input: TransactionInput) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    // Category & Account Management
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    addAccount: (account: Omit<Account, 'id' | 'balance'> & { initialBalance?: number }) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;

    // Debt Management
    addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
    updateDebtStatus: (id: string, status: 'pending' | 'paid') => void;
    deleteDebt: (id: string) => void;

    // Recurring Management
    addRecurring: (recurring: Omit<RecurringTransaction, 'id'>) => void;
    deleteRecurring: (id: string) => void;
    toggleRecurring: (id: string) => void;

    // Computed / Getters
    getStats: () => { totalIncome: number; totalExpense: number; balance: number };
    getMonthlyStats: (date: Date) => { totalIncome: number; totalExpense: number; balance: number };
    getChartData: (date: Date) => { day: string; income: number; expense: number }[];
    getCategoryById: (id: string) => Category | undefined;
    getAccountById: (id: string) => Account | undefined;
    getCategoriesByType: (type: TransactionType) => Category[];
    getDashboardStats: () => { balance: number; income: number; expense: number };
    getRecentTransactions: (limit: number) => Transaction[];
    getMonthlyChartData: () => { month: string; income: number; expense: number }[];
    getCategoryBreakdown: () => { id: string; name: string; value: number; color: string; icon: string; percent: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE WITH SUPABASE
// ═══════════════════════════════════════════════════════════════════════════

export const useFinanceStore = create<FinanceStore>((set, get) => ({
    // Initial State
    transactions: [],
    categories: [],
    accounts: [],
    debts: [],
    recurringTransactions: [],
    selectedDate: new Date().toISOString(),
    isLoading: false,
    isInitialized: false,

    // Set Selected Date
    setSelectedDate: (date: Date) => set({ selectedDate: date.toISOString() }),

    // ═══════════════════════════════════════════════════════════════════════════
    // DATA FETCHING
    // ═══════════════════════════════════════════════════════════════════════════
    fetchInitialData: async () => {
        const supabase = createClient();
        set({ isLoading: true });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('User not logged in');
                set({ isLoading: false });
                return;
            }

            // Fetch in parallel
            const [accRes, catRes, txRes] = await Promise.all([
                supabase.from('accounts').select('*'),
                supabase.from('categories').select('*'),
                supabase.from('transactions').select('*').order('date', { ascending: false })
            ]);

            if (accRes.error) throw accRes.error;
            if (catRes.error) throw catRes.error;
            if (txRes.error) throw txRes.error;

            // Map Snake_case DB to CamelCase Store
            const accounts: Account[] = accRes.data.map((a: any) => ({
                id: a.id,
                name: a.name,
                icon: a.icon,
                color: a.color,
                balance: Number(a.balance) // Numeric comes as string/number
            }));

            const categories: Category[] = catRes.data.map((c: any) => ({
                id: c.id,
                name: c.name,
                icon: c.icon,
                color: c.color,
                type: c.type
            }));

            const transactions: Transaction[] = txRes.data.map((t: any) => ({
                id: t.id,
                amount: Number(t.amount),
                type: t.type,
                categoryId: t.category_id,
                accountId: t.account_id,
                date: t.date,
                note: t.note,
                createdAt: t.created_at
            }));

            set({ transactions, categories, accounts, isInitialized: true });
        } catch (error) {
            console.error('Error fetching data:', error);
            // toast.error('Lỗi tải dữ liệu. Vui lòng thử lại.');
        } finally {
            set({ isLoading: false });
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    addTransaction: async (input) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error('Vui lòng đăng nhập để lưu dữ liệu.');
            return;
        }

        const optimisticId = `temp-${Date.now()}`;
        const newTx: Transaction = {
            id: optimisticId,
            ...input,
            createdAt: new Date().toISOString()
        };

        // Optimistic Update
        const previousState = get();
        set(state => ({
            transactions: [newTx, ...state.transactions],
            accounts: state.accounts.map(acc => {
                if (acc.id === input.accountId) {
                    const change = input.type === 'income' ? input.amount : -input.amount;
                    return { ...acc, balance: acc.balance + change };
                }
                return acc;
            })
        }));

        try {
            // DB Insert
            const { data, error } = await supabase.from('transactions').insert({
                user_id: user.id,
                account_id: input.accountId,
                category_id: input.categoryId,
                amount: input.amount,
                type: input.type,
                date: input.date,
                note: input.note
            }).select().single();

            if (error) throw error;

            // Update Account Balance in DB (Should use RPC for atomicity, but simple update for now)
            const account = get().accounts.find(a => a.id === input.accountId);
            if (account) {
                await supabase.from('accounts')
                    .update({ balance: account.balance }) // The balance was already optimistically updated in Store
                    .eq('id', account.id);
            }

            // Replace optimistic ID with real ID
            set(state => ({
                transactions: state.transactions.map(t => t.id === optimisticId ? { ...t, id: data.id } : t)
            }));

            toast.success('Đã lưu giao dịch!');
        } catch (error) {
            console.error('Add transaction error:', error);
            toast.error('Lỗi lưu giao dịch. Đang hoàn tác...');
            set(previousState); // Rollback
        }
    },

    deleteTransaction: async (id) => {
        const supabase = createClient();
        const previousState = get();
        const tx = previousState.transactions.find(t => t.id === id);
        if (!tx) return;

        // Optimistic Delete
        set(state => ({
            transactions: state.transactions.filter(t => t.id !== id),
            accounts: state.accounts.map(acc => {
                if (acc.id === tx.accountId) {
                    const change = tx.type === 'income' ? -tx.amount : tx.amount; // Reverse logic
                    return { ...acc, balance: acc.balance + change };
                }
                return acc;
            })
        }));

        try {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) throw error;

            // Sync Balance
            const account = get().accounts.find(a => a.id === tx.accountId);
            if (account) {
                await supabase.from('accounts').update({ balance: account.balance }).eq('id', account.id);
            }

            toast.success('Đã xóa giao dịch');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Lỗi xóa dữ liệu');
            set(previousState);
        }
    },

    addCategory: async (category) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.from('categories').insert({
            user_id: user.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            type: category.type
        }).select().single();

        if (error) {
            toast.error('Lỗi thêm danh mục');
            return;
        }

        set(state => ({
            categories: [...state.categories, { ...category, id: data.id }]
        }));
    },

    deleteCategory: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            toast.error('Không thể xóa danh mục này');
            return;
        }
        set(state => ({
            categories: state.categories.filter(c => c.id !== id)
        }));
    },

    addAccount: async (account) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.from('accounts').insert({
            user_id: user.id,
            name: account.name,
            icon: account.icon,
            color: account.color,
            balance: account.initialBalance || 0
        }).select().single();

        if (error) {
            toast.error('Lỗi thêm tài khoản');
            return;
        }

        set(state => ({
            accounts: [...state.accounts, {
                id: data.id,
                name: data.name,
                icon: data.icon,
                color: data.color,
                balance: Number(data.balance)
            }]
        }));
    },

    deleteAccount: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('accounts').delete().eq('id', id);
        if (error) {
            toast.error('Lỗi xóa tài khoản');
            return;
        }
        set(state => ({
            accounts: state.accounts.filter(a => a.id !== id)
        }));
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // DEBT MANAGEMENT (Local State Only)
    // ═══════════════════════════════════════════════════════════════════════════

    addDebt: (debt) => {
        const newDebt: Debt = {
            ...debt,
            id: `debt-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        set(state => ({ debts: [...state.debts, newDebt] }));
        toast.success(`Đã thêm công nợ: ${debt.name}`);
    },

    updateDebtStatus: (id, status) => {
        set(state => ({
            debts: state.debts.map(d => d.id === id ? { ...d, status } : d)
        }));
        toast.success(status === 'paid' ? 'Đã tất toán!' : 'Đã mở lại công nợ');
    },

    deleteDebt: (id) => {
        set(state => ({ debts: state.debts.filter(d => d.id !== id) }));
        toast.success('Đã xóa công nợ');
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // RECURRING MANAGEMENT (Local State Only)
    // ═══════════════════════════════════════════════════════════════════════════

    addRecurring: (recurring) => {
        const newRecurring: RecurringTransaction = {
            ...recurring,
            id: `rec-${Date.now()}`,
        };
        set(state => ({ recurringTransactions: [...state.recurringTransactions, newRecurring] }));
        toast.success(`Đã thêm giao dịch định kỳ: ${recurring.name}`);
    },

    deleteRecurring: (id) => {
        set(state => ({ recurringTransactions: state.recurringTransactions.filter(r => r.id !== id) }));
        toast.success('Đã xóa giao dịch định kỳ');
    },

    toggleRecurring: (id) => {
        set(state => ({
            recurringTransactions: state.recurringTransactions.map(r =>
                r.id === id ? { ...r, isActive: !r.isActive } : r
            )
        }));
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPUTED (Giữ nguyên logic tính toán Client-side cho nhanh)
    // ═══════════════════════════════════════════════════════════════════════════

    getStats: () => {
        const { transactions } = get();
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
        };
    },

    getMonthlyStats: (date: Date) => {
        const { transactions } = get();
        const targetYear = date.getFullYear();
        const targetMonth = date.getMonth();

        const monthlyTransactions = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
        });

        const totalIncome = monthlyTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = monthlyTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
        };
    },

    getChartData: (date: Date) => {
        const { transactions } = get();
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const daysInMonth = end.getDate();

        const chartData = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayTransactions = transactions.filter(t => t.date === currentDayStr);

            const income = dayTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            const expense = dayTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            chartData.push({
                day: String(i).padStart(2, '0'),
                income,
                expense,
            });
        }
        return chartData;
    },

    getCategoryById: (id: string) => get().categories.find((c) => c.id === id),
    getAccountById: (id: string) => get().accounts.find((a) => a.id === id),
    getCategoriesByType: (type: TransactionType) => get().categories.filter((c) => c.type === type),

    getDashboardStats: () => {
        const { transactions, accounts } = get();
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const balance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        const monthlyTx = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        const income = monthlyTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = monthlyTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return { balance, income, expense };
    },

    getRecentTransactions: (limit: number) => {
        const { transactions } = get();
        return [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    },

    getMonthlyChartData: () => {
        const { transactions } = get();
        const now = new Date();
        const result = [];

        for (let i = 5; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth();

            const monthTx = transactions.filter((t) => {
                const d = new Date(t.date);
                return d.getFullYear() === year && d.getMonth() === month;
            });

            const income = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            result.push({
                month: `T${month + 1}`,
                income,
                expense,
            });
        }
        return result;
    },

    getCategoryBreakdown: () => {
        const { transactions, categories } = get();
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const monthlyExpenses = transactions.filter((t) => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        const totalExpense = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
        const categoryTotals: Record<string, number> = {};

        monthlyExpenses.forEach((t) => {
            categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
        });

        return Object.entries(categoryTotals)
            .map(([catId, value]) => {
                const cat = categories.find((c) => c.id === catId);
                return {
                    id: catId,
                    name: cat?.name || 'Khác',
                    value,
                    color: cat?.color || '#6B7280',
                    icon: cat?.icon || 'MoreHorizontal',
                    percent: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0,
                };
            })
            .sort((a, b) => b.value - a.value);
    },
}));

// Helpers
export function formatMoney(amount: number): string {
    return Math.abs(amount).toLocaleString('vi-VN') + ' ₫';
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
