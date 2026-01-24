"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Download, FileSpreadsheet } from "lucide-react";
import { storage, CashFlowCategory, CashFlowMonthData } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { cn } from "@/lib/utils";
import { eachMonthOfInterval, endOfYear, format, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FluxoCaixaPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [categories, setCategories] = useState<CashFlowCategory[]>([]);
    const [monthData, setMonthData] = useState<Record<string, Record<string, number>>>({}); // "YYYY-MM": { "catId": val }
    const [loading, setLoading] = useState(true);

    const months = eachMonthOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 0, 1))
    });

    useEffect(() => {
        loadData();
    }, [year]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load Categories - assuming static or from storage for now, ideally Supabase
            const cats = storage.getFinCategorias();
            setCategories(cats);

            // Load Transactions from Supabase
            const transactions = await supabaseStorage.getTransacoes();

            // Build the map based on actual transactions
            const map: Record<string, Record<string, number>> = {};

            transactions.forEach(t => {
                const date = new Date(t.data);
                if (date.getFullYear() !== year) return; // Filter by selected year

                const monthStr = format(date, 'yyyy-MM');
                if (!map[monthStr]) map[monthStr] = {};

                const currentVal = map[monthStr][t.categoriaId] || 0;

                // If Income, add. If Expense, subtract is handled by display logic? 
                // Usually Revenue is positive, Expenses positive but subtracted in total.
                // We store absolute values here and categorize by ID.
                map[monthStr][t.categoriaId] = currentVal + (Number(t.valor) || 0);
            });

            setMonthData(map);
        } catch (error) {
            console.error("Erro ao carregar fluxo de caixa:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleValueChange = (monthStr: string, catId: string, value: string) => {
        // Direct editing is disabled in this version because data comes from individual transactions.
        // To support editing, we would need to create "Manual Adjustment" transactions behind the scenes.
        // For now, let's alert the user.
        alert("Para alterar valores, registre uma nova Receita ou Despesa na tela principal.");
    };

    // Helper to get value safely
    const getValue = (monthStr: string, catId: string) => {
        return monthData[monthStr]?.[catId] || 0;
    };

    // Format currency for input default value
    // We actually want raw number for inputs usually, but maybe formatted on blur?
    // Let's stick to simple input type="number" or text. Text allows formatted display if focusing logic exists.
    // For MVP, number input is safer.

    // Calculation Helpers
    const calculateTotal = (monthStr: string, type: 'Receita' | 'DespesaVariavel' | 'DespesaFixa') => {
        const typeCats = categories.filter(c => c.tipo === type);
        let sum = 0;
        typeCats.forEach(c => {
            sum += getValue(monthStr, c.id);
        });
        return sum;
    };

    const calculateBalance = (monthStr: string) => {
        const income = calculateTotal(monthStr, 'Receita');
        const expenses = calculateTotal(monthStr, 'DespesaVariavel') + calculateTotal(monthStr, 'DespesaFixa');
        return income - expenses;
    };

    if (loading) return <div className="p-8">Carregando...</div>;

    const renderSection = (title: string, type: 'Receita' | 'DespesaVariavel' | 'DespesaFixa', bgColor: string) => {
        const typeCats = categories.filter(c => c.tipo === type);

        return (
            <div className="mb-6">
                <div className={cn("sticky left-0 bg-white z-10 p-2 font-bold border-b border-neutral-200 uppercase text-xs tracking-wider", bgColor)}>
                    {title}
                </div>
                {/* Rows */}
                {typeCats.map(cat => (
                    <div key={cat.id} className="flex hover:bg-neutral-50 group">
                        <div className="sticky left-0 bg-white z-10 w-[200px] min-w-[200px] p-2 border-r border-b border-neutral-100 text-sm font-medium text-neutral-700 flex items-center group-hover:bg-neutral-50 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                            {cat.nome}
                        </div>
                        {months.map(m => {
                            const mStr = format(m, 'yyyy-MM');
                            const val = getValue(mStr, cat.id);

                            return (
                                <div key={mStr} className="w-[100px] min-w-[100px] border-r border-b border-neutral-100 last:border-r-0">
                                    <input
                                        type="number"
                                        className="w-full h-full px-2 py-2 bg-transparent text-right text-sm outline-none focus:bg-blue-50 focus:text-blue-700 transition-colors"
                                        value={val === 0 ? '' : val}
                                        placeholder="0,00"
                                        onChange={(e) => handleValueChange(mStr, cat.id, e.target.value)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
                {/* Subtotal Row */}
                <div className="flex bg-neutral-50 font-bold border-t border-b border-neutral-200">
                    <div className="sticky left-0 bg-neutral-50 z-10 w-[200px] min-w-[200px] p-2 border-r border-neutral-200 text-sm text-neutral-800 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                        TOTAL {title.split(' ')[0]}
                    </div>
                    {months.map(m => {
                        const mStr = format(m, 'yyyy-MM');
                        const total = calculateTotal(mStr, type);
                        return (
                            <div key={mStr} className="w-[100px] min-w-[100px] px-2 py-2 text-right text-sm border-r border-neutral-200 text-neutral-800">
                                {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 h-screen flex flex-col overflow-hidden bg-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/financeiro" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-800">Fluxo de Caixa Mensal</h1>
                        <p className="text-sm text-neutral-500">Planejamento e acompanhamento anual</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                        <button onClick={() => setYear(year - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors text-neutral-600 font-bold">‹</button>
                        <span className="px-3 text-sm font-bold text-neutral-800">{year}</span>
                        <button onClick={() => setYear(year + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors text-neutral-600 font-bold">›</button>
                    </div>

                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                        <FileSpreadsheet className="w-4 h-4" /> Importar
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-900">
                        <Download className="w-4 h-4" /> Exportar
                    </button>
                </div>
            </div>

            {/* Main Spreadsheet Area */}
            <div className="flex-1 overflow-auto border border-neutral-200 rounded-xl relative shadow-sm">
                <div className="min-w-max">
                    {/* Header Month Row */}
                    <div className="flex bg-neutral-100 sticky top-0 z-20 border-b border-neutral-200 shadow-sm">
                        <div className="sticky left-0 bg-neutral-100 z-30 w-[200px] min-w-[200px] p-3 text-xs font-bold text-neutral-500 uppercase tracking-wider border-r border-neutral-200">
                            Categoria
                        </div>
                        {months.map(m => (
                            <div key={m.toString()} className="w-[100px] min-w-[100px] p-3 text-center text-sm font-bold text-neutral-700 uppercase border-r border-neutral-200 last:border-r-0">
                                {format(m, 'MMM-yy', { locale: ptBR })}
                            </div>
                        ))}
                    </div>

                    {/* CONTENT */}
                    <div className="bg-white">
                        {renderSection("1 - RENDAS", "Receita", "text-green-600 bg-green-50")}
                        {renderSection("2 - GASTOS VARIÁVEIS", "DespesaVariavel", "text-red-600 bg-red-50")}
                        {renderSection("3 - GASTOS FIXOS", "DespesaFixa", "text-red-600 bg-red-50")}

                        {/* FINAL SUMMARY */}
                        <div className="mt-8 border-t-2 border-neutral-800">
                            <div className="flex bg-blue-50 font-bold">
                                <div className="sticky left-0 bg-blue-50 z-10 w-[200px] min-w-[200px] p-4 border-r border-neutral-200 text-sm text-blue-900 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] uppercase tracking-tight">
                                    SALDO FIM DO MÊS
                                </div>
                                {months.map(m => {
                                    const mStr = format(m, 'yyyy-MM');
                                    const balance = calculateBalance(mStr);
                                    return (
                                        <div key={mStr} className={cn(
                                            "w-[100px] min-w-[100px] p-4 text-right text-sm border-r border-blue-100 font-bold",
                                            balance >= 0 ? "text-green-700" : "text-red-600"
                                        )}>
                                            {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

