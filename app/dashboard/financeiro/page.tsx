"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { storage, Transaction } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { FinancialCard } from "@/components/financeiro/FinancialCard";
import { RecentActivity } from "@/components/financeiro/RecentActivity";
import { PerformanceChart } from "@/components/financeiro/PerformanceChart";
import { startOfMonth, endOfMonth, isWithinInterval, subMonths, format, startOfWeek, endOfWeek, eachWeekOfInterval, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionModal } from "@/components/financeiro/TransactionModal";

export default function FinanceiroPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-neutral-500">Carregando finanças...</div>}>
            <FinanceiroContent />
        </Suspense>
    );
}

function FinanceiroContent() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Receita' | 'Despesa'>('Receita');
    const [summary, setSummary] = useState({
        income: 0,
        expenses: 0,
        profit: 0,
        balance: 0,
        incomeTrend: 0,
        expensesTrend: 0,
        profitTrend: 0
    });
    const [chartData, setChartData] = useState<{ label: string; value: number; isCurrent?: boolean }[]>([]);

    const searchParams = useSearchParams();

    useEffect(() => {
        loadData();
    }, []);

    // Handle FAB actions from query params
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'nova-receita') {
            setModalType('Receita');
            setModalOpen(true);
        } else if (action === 'nova-despesa') {
            setModalType('Despesa');
            setModalOpen(true);
        }
    }, [searchParams]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Using Supabase to get transactions
            const allTransactions = await supabaseStorage.getTransacoes();
            setTransactions(allTransactions as Transaction[]);
            calculateSummary(allTransactions as Transaction[]);
            generateChartData(allTransactions as Transaction[]);
        } catch (error) {
            console.error("Erro ao carregar transações:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (data: Transaction[]) => {
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const getTotals = (start: Date, end: Date) => {
            const periodTx = data.filter(t => isWithinInterval(new Date(t.data), { start, end }));
            const income = periodTx.filter(t => t.tipo === 'Receita').reduce((acc, t) => acc + t.valor, 0);
            const expenses = periodTx.filter(t => t.tipo === 'Despesa').reduce((acc, t) => acc + t.valor, 0);
            return { income, expenses, profit: income - expenses };
        };

        const current = getTotals(currentMonthStart, currentMonthEnd);
        const last = getTotals(lastMonthStart, lastMonthEnd);

        // Calculate trends
        const calcTrend = (curr: number, prev: number) => prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

        setSummary({
            income: current.income,
            expenses: current.expenses,
            profit: current.profit,
            balance: 0, // In a real app this would be cumulative, for now let's use profit logic or total balance
            incomeTrend: calcTrend(current.income, last.income),
            expensesTrend: calcTrend(current.expenses, last.expenses),
            profitTrend: calcTrend(current.profit, last.profit)
        });
    };

    const generateChartData = (data: Transaction[]) => {
        // Last 4 weeks
        const today = new Date();
        const start = subDays(today, 28); // approx 4 weeks

        const weeks = eachWeekOfInterval({ start, end: today });

        const chart = weeks.map((weekStart, idx) => {
            const weekEnd = endOfWeek(weekStart);
            const weekTx = data.filter(t => isWithinInterval(new Date(t.data), { start: weekStart, end: weekEnd }));
            const total = weekTx.filter(t => t.tipo === 'Receita').reduce((acc, t) => acc + t.valor, 0); // Show Revenue

            return {
                label: `Sem${idx + 1}`,
                value: total,
                isCurrent: idx === weeks.length - 1
            };
        });

        setChartData(chart);
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                        💰 Gestão Financeira
                    </h1>
                    <p className="text-neutral-500">Acompanhe suas finanças de perto.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                        {format(new Date(), "MMMM", { locale: ptBR })} ▼
                    </button>
                    <Link href="/dashboard/financeiro/fluxo-caixa">
                        <button className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-900 shadow-sm">
                            Ver Fluxo de Caixa →
                        </button>
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FinancialCard
                    title="Receita Mensal"
                    value={summary.income}
                    trend={summary.incomeTrend}
                    type="positive"
                />
                <FinancialCard
                    title="Despesas Mensais"
                    value={summary.expenses}
                    trend={summary.expensesTrend}
                    type="negative"
                />
                <FinancialCard
                    title="Lucro Líquido"
                    value={summary.profit}
                    trend={summary.profitTrend}
                    type="profit"
                />
            </div>

            {/* Quick Access Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Link href="/dashboard/financeiro/contas-receber" className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-colors group">
                    <p className="text-sm font-bold text-green-700 group-hover:text-green-800">💰 Contas a Receber</p>
                    <p className="text-xs text-green-600">Gerenciar recebimentos</p>
                </Link>
                <Link href="/dashboard/financeiro/contas-pagar" className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-4 transition-colors group">
                    <p className="text-sm font-bold text-red-700 group-hover:text-red-800">💸 Contas a Pagar</p>
                    <p className="text-xs text-red-600">Gerenciar pagamentos</p>
                </Link>
                <Link href="/dashboard/financeiro/fluxo-caixa" className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-colors group">
                    <p className="text-sm font-bold text-blue-700 group-hover:text-blue-800">📊 Fluxo de Caixa</p>
                    <p className="text-xs text-blue-600">Planilha mensal</p>
                </Link>
                <Link href="/dashboard/financeiro/previsao" className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl p-4 transition-colors group">
                    <p className="text-sm font-bold text-indigo-700 group-hover:text-indigo-800">🔮 Previsão</p>
                    <p className="text-xs text-indigo-600">Projeção de receitas</p>
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Link href="/dashboard/financeiro/dre" className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 transition-colors group">
                    <p className="text-sm font-bold text-purple-700 group-hover:text-purple-800">📈 DRE</p>
                    <p className="text-xs text-purple-600">Demonstrativo de Resultados</p>
                </Link>
                <Link href="/dashboard/financeiro/relatorios" className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-4 transition-colors group">
                    <p className="text-sm font-bold text-orange-700 group-hover:text-orange-800">📑 Relatórios</p>
                    <p className="text-xs text-orange-600">Centro de relatórios</p>
                </Link>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 opacity-50 cursor-not-allowed col-span-2">
                    <p className="text-sm font-bold text-neutral-500">🚀 Mais em breve...</p>
                    <p className="text-xs text-neutral-400">Metas, Análises avançadas</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section - Takes 2 cols */}
                <div className="lg:col-span-2 h-[400px]">
                    <PerformanceChart data={chartData} />
                </div>

                {/* Recent Activity - Takes 1 col */}
                <div className="h-[400px]">
                    <RecentActivity transactions={transactions.slice(0, 10)} />
                </div>
            </div>

            <TransactionModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    // Clear search params when closing
                    window.history.replaceState({}, '', window.location.pathname);
                }}
                type={modalType}
                onSuccess={loadData}
            />
        </div>
    );
}

