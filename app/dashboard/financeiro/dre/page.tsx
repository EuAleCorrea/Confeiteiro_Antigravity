"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Download, BarChart2, ChevronDown } from "lucide-react";
import { supabaseStorage } from "@/lib/supabase-storage";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Transaction } from "@/lib/storage";

interface DREData {
    receitaBruta: number;
    impostos: number;
    receitaLiquida: number;
    custosVariaveis: { categoria: string; valor: number }[];
    totalCustosVariaveis: number;
    margemContribuicao: number;
    despesasFixas: { categoria: string; valor: number }[];
    totalDespesasFixas: number;
    resultadoOperacional: number;
    lucroLiquido: number;
}

export default function DREPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [showComparison, setShowComparison] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await supabaseStorage.getTransacoes();
            setTransactions(data as Transaction[]);
        } catch (error) {
            console.error("Erro ao carregar transações para DRE:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDRE = (month: Date): DREData => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);

        const monthTx = transactions.filter(t =>
            isWithinInterval(new Date(t.data), { start, end })
        );

        // Receitas
        const receitas = monthTx.filter(t => t.tipo === 'Receita');
        const receitaBruta = receitas.reduce((acc, t) => acc + t.valor, 0);

        // Categorizar despesas
        const despesas = monthTx.filter(t => t.tipo === 'Despesa');

        // Custos Variáveis (categorias: Ingredientes, Embalagens, Entregas, Insumos)
        const custosVariaveisNomes = ['Ingredientes', 'Embalagens', 'Entregas', 'Insumos', 'Insumos Gerais', 'Compras'];
        const custosVariaveis: { [key: string]: number } = {};

        despesas.forEach(d => {
            if (custosVariaveisNomes.some(c => d.categoriaNome?.includes(c))) {
                const cat = d.categoriaNome || 'Outros';
                custosVariaveis[cat] = (custosVariaveis[cat] || 0) + d.valor;
            }
        });

        const custosVariaveisArr = Object.entries(custosVariaveis).map(([categoria, valor]) => ({ categoria, valor }));
        const totalCustosVariaveis = custosVariaveisArr.reduce((acc, c) => acc + c.valor, 0);

        // Despesas Fixas (tudo que não é custo variável)
        const despesasFixas: { [key: string]: number } = {};

        despesas.forEach(d => {
            if (!custosVariaveisNomes.some(c => d.categoriaNome?.includes(c))) {
                const cat = d.categoriaNome || 'Outros';
                despesasFixas[cat] = (despesasFixas[cat] || 0) + d.valor;
            }
        });

        const despesasFixasArr = Object.entries(despesasFixas).map(([categoria, valor]) => ({ categoria, valor }));
        const totalDespesasFixas = despesasFixasArr.reduce((acc, c) => acc + c.valor, 0);

        // Cálculos
        const impostos = 0; // Simplificado
        const receitaLiquida = receitaBruta - impostos;
        const margemContribuicao = receitaLiquida - totalCustosVariaveis;
        const resultadoOperacional = margemContribuicao - totalDespesasFixas;
        const lucroLiquido = resultadoOperacional;

        return {
            receitaBruta,
            impostos,
            receitaLiquida,
            custosVariaveis: custosVariaveisArr,
            totalCustosVariaveis,
            margemContribuicao,
            despesasFixas: despesasFixasArr,
            totalDespesasFixas,
            resultadoOperacional,
            lucroLiquido
        };
    };

    const currentDRE = useMemo(() => calculateDRE(selectedMonth), [transactions, selectedMonth]);
    const previousDRE = useMemo(() => calculateDRE(subMonths(selectedMonth, 1)), [transactions, selectedMonth]);

    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    const formatPercent = (value: number, base: number) => base === 0 ? '0%' : `${Math.round((value / base) * 100)}%`;

    const calcVariation = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    // Month selector options
    const monthOptions = Array.from({ length: 12 }, (_, i) => subMonths(new Date(), i));

    return (
        <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/financeiro" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800">📈 DRE - Demonstrativo de Resultados</h1>
                        <p className="text-sm text-neutral-500">Análise de receitas, custos e lucro</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <select
                            className="appearance-none px-4 py-2 pr-8 bg-white border border-neutral-200 rounded-lg text-sm font-medium cursor-pointer"
                            value={selectedMonth.toISOString()}
                            onChange={e => setSelectedMonth(new Date(e.target.value))}
                        >
                            {monthOptions.map((m, i) => (
                                <option key={i} value={m.toISOString()}>
                                    {format(m, "MMMM yyyy", { locale: ptBR })}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            showComparison ? "bg-orange-100 text-orange-700" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        )}
                    >
                        <BarChart2 className="w-4 h-4" /> Comparar
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-900"
                    >
                        <Download className="w-4 h-4" /> Exportar
                    </button>
                </div>
            </div>

            {/* DRE Table */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden print:shadow-none print:border-none">
                <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 p-4 text-white">
                    <h2 className="text-lg font-bold">DRE - {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}</h2>
                </div>

                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase w-1/2">Descrição</th>
                            <th className="text-right p-4 text-xs font-semibold text-neutral-500 uppercase">Valor</th>
                            <th className="text-right p-4 text-xs font-semibold text-neutral-500 uppercase">%</th>
                            {showComparison && (
                                <>
                                    <th className="text-right p-4 text-xs font-semibold text-neutral-500 uppercase">Mês Ant.</th>
                                    <th className="text-right p-4 text-xs font-semibold text-neutral-500 uppercase">Var.</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {/* RECEITAS */}
                        <tr className="bg-green-50 border-b border-green-100">
                            <td colSpan={showComparison ? 5 : 3} className="p-3 text-sm font-bold text-green-800">1. RECEITAS OPERACIONAIS</td>
                        </tr>
                        <tr className="border-b border-neutral-50">
                            <td className="p-4 pl-8 text-sm text-neutral-700">Receita Bruta</td>
                            <td className="p-4 text-sm font-medium text-neutral-800 text-right">{formatCurrency(currentDRE.receitaBruta)}</td>
                            <td className="p-4 text-sm text-neutral-400 text-right">100%</td>
                            {showComparison && (
                                <>
                                    <td className="p-4 text-sm text-neutral-500 text-right">{formatCurrency(previousDRE.receitaBruta)}</td>
                                    <td className={cn("p-4 text-sm font-medium text-right", calcVariation(currentDRE.receitaBruta, previousDRE.receitaBruta) >= 0 ? "text-green-600" : "text-red-600")}>
                                        {calcVariation(currentDRE.receitaBruta, previousDRE.receitaBruta) >= 0 ? '+' : ''}{calcVariation(currentDRE.receitaBruta, previousDRE.receitaBruta)}%
                                    </td>
                                </>
                            )}
                        </tr>
                        <tr className="border-b border-neutral-50">
                            <td className="p-4 pl-8 text-sm text-neutral-700">(-) Impostos</td>
                            <td className="p-4 text-sm text-red-600 text-right">{formatCurrency(currentDRE.impostos)}</td>
                            <td className="p-4 text-sm text-neutral-400 text-right">{formatPercent(currentDRE.impostos, currentDRE.receitaBruta)}</td>
                            {showComparison && <><td></td><td></td></>}
                        </tr>
                        <tr className="bg-green-100/50 border-b border-green-200">
                            <td className="p-4 text-sm font-bold text-green-800">(=) RECEITA LÍQUIDA</td>
                            <td className="p-4 text-sm font-bold text-green-800 text-right">{formatCurrency(currentDRE.receitaLiquida)}</td>
                            <td className="p-4 text-sm text-green-600 text-right">100%</td>
                            {showComparison && (
                                <>
                                    <td className="p-4 text-sm text-neutral-500 text-right">{formatCurrency(previousDRE.receitaLiquida)}</td>
                                    <td className={cn("p-4 text-sm font-medium text-right", calcVariation(currentDRE.receitaLiquida, previousDRE.receitaLiquida) >= 0 ? "text-green-600" : "text-red-600")}>
                                        {calcVariation(currentDRE.receitaLiquida, previousDRE.receitaLiquida) >= 0 ? '+' : ''}{calcVariation(currentDRE.receitaLiquida, previousDRE.receitaLiquida)}%
                                    </td>
                                </>
                            )}
                        </tr>

                        {/* CUSTOS VARIÁVEIS */}
                        <tr className="bg-red-50 border-b border-red-100">
                            <td colSpan={showComparison ? 5 : 3} className="p-3 text-sm font-bold text-red-800">2. CUSTOS VARIÁVEIS</td>
                        </tr>
                        {currentDRE.custosVariaveis.map((c, i) => (
                            <tr key={i} className="border-b border-neutral-50">
                                <td className="p-4 pl-8 text-sm text-neutral-700">{c.categoria}</td>
                                <td className="p-4 text-sm text-red-600 text-right">{formatCurrency(c.valor)}</td>
                                <td className="p-4 text-sm text-neutral-400 text-right">{formatPercent(c.valor, currentDRE.receitaLiquida)}</td>
                                {showComparison && <><td></td><td></td></>}
                            </tr>
                        ))}
                        {currentDRE.custosVariaveis.length === 0 && (
                            <tr className="border-b border-neutral-50">
                                <td className="p-4 pl-8 text-sm text-neutral-400 italic">Nenhum custo variável registrado</td>
                                <td className="p-4 text-sm text-neutral-400 text-right">-</td>
                                <td></td>
                                {showComparison && <><td></td><td></td></>}
                            </tr>
                        )}
                        <tr className="bg-red-100/50 border-b border-red-200">
                            <td className="p-4 text-sm font-bold text-red-800">(=) TOTAL CUSTOS VARIÁVEIS</td>
                            <td className="p-4 text-sm font-bold text-red-800 text-right">{formatCurrency(currentDRE.totalCustosVariaveis)}</td>
                            <td className="p-4 text-sm text-red-600 text-right">{formatPercent(currentDRE.totalCustosVariaveis, currentDRE.receitaLiquida)}</td>
                            {showComparison && (
                                <>
                                    <td className="p-4 text-sm text-neutral-500 text-right">{formatCurrency(previousDRE.totalCustosVariaveis)}</td>
                                    <td className={cn("p-4 text-sm font-medium text-right", calcVariation(currentDRE.totalCustosVariaveis, previousDRE.totalCustosVariaveis) <= 0 ? "text-green-600" : "text-red-600")}>
                                        {calcVariation(currentDRE.totalCustosVariaveis, previousDRE.totalCustosVariaveis) >= 0 ? '+' : ''}{calcVariation(currentDRE.totalCustosVariaveis, previousDRE.totalCustosVariaveis)}%
                                    </td>
                                </>
                            )}
                        </tr>

                        {/* MARGEM DE CONTRIBUIÇÃO */}
                        <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="p-4 text-sm font-bold text-blue-800">(=) MARGEM DE CONTRIBUIÇÃO</td>
                            <td className="p-4 text-sm font-bold text-blue-800 text-right">{formatCurrency(currentDRE.margemContribuicao)}</td>
                            <td className="p-4 text-sm text-blue-600 text-right">{formatPercent(currentDRE.margemContribuicao, currentDRE.receitaLiquida)}</td>
                            {showComparison && (
                                <>
                                    <td className="p-4 text-sm text-neutral-500 text-right">{formatCurrency(previousDRE.margemContribuicao)}</td>
                                    <td className={cn("p-4 text-sm font-medium text-right", calcVariation(currentDRE.margemContribuicao, previousDRE.margemContribuicao) >= 0 ? "text-green-600" : "text-red-600")}>
                                        {calcVariation(currentDRE.margemContribuicao, previousDRE.margemContribuicao) >= 0 ? '+' : ''}{calcVariation(currentDRE.margemContribuicao, previousDRE.margemContribuicao)}%
                                    </td>
                                </>
                            )}
                        </tr>

                        {/* DESPESAS FIXAS */}
                        <tr className="bg-orange-50 border-b border-orange-100">
                            <td colSpan={showComparison ? 5 : 3} className="p-3 text-sm font-bold text-orange-800">3. DESPESAS FIXAS</td>
                        </tr>
                        {currentDRE.despesasFixas.map((d, i) => (
                            <tr key={i} className="border-b border-neutral-50">
                                <td className="p-4 pl-8 text-sm text-neutral-700">{d.categoria}</td>
                                <td className="p-4 text-sm text-red-600 text-right">{formatCurrency(d.valor)}</td>
                                <td className="p-4 text-sm text-neutral-400 text-right">{formatPercent(d.valor, currentDRE.receitaLiquida)}</td>
                                {showComparison && <><td></td><td></td></>}
                            </tr>
                        ))}
                        {currentDRE.despesasFixas.length === 0 && (
                            <tr className="border-b border-neutral-50">
                                <td className="p-4 pl-8 text-sm text-neutral-400 italic">Nenhuma despesa fixa registrada</td>
                                <td className="p-4 text-sm text-neutral-400 text-right">-</td>
                                <td></td>
                                {showComparison && <><td></td><td></td></>}
                            </tr>
                        )}
                        <tr className="bg-orange-100/50 border-b border-orange-200">
                            <td className="p-4 text-sm font-bold text-orange-800">(=) TOTAL DESPESAS FIXAS</td>
                            <td className="p-4 text-sm font-bold text-orange-800 text-right">{formatCurrency(currentDRE.totalDespesasFixas)}</td>
                            <td className="p-4 text-sm text-orange-600 text-right">{formatPercent(currentDRE.totalDespesasFixas, currentDRE.receitaLiquida)}</td>
                            {showComparison && (
                                <>
                                    <td className="p-4 text-sm text-neutral-500 text-right">{formatCurrency(previousDRE.totalDespesasFixas)}</td>
                                    <td className={cn("p-4 text-sm font-medium text-right", calcVariation(currentDRE.totalDespesasFixas, previousDRE.totalDespesasFixas) <= 0 ? "text-green-600" : "text-red-600")}>
                                        {calcVariation(currentDRE.totalDespesasFixas, previousDRE.totalDespesasFixas) >= 0 ? '+' : ''}{calcVariation(currentDRE.totalDespesasFixas, previousDRE.totalDespesasFixas)}%
                                    </td>
                                </>
                            )}
                        </tr>

                        {/* RESULTADO */}
                        <tr className={cn("border-b-2", currentDRE.lucroLiquido >= 0 ? "bg-green-100" : "bg-red-100")}>
                            <td className={cn("p-4 text-base font-bold", currentDRE.lucroLiquido >= 0 ? "text-green-800" : "text-red-800")}>(=) LUCRO LÍQUIDO</td>
                            <td className={cn("p-4 text-lg font-bold text-right", currentDRE.lucroLiquido >= 0 ? "text-green-800" : "text-red-800")}>{formatCurrency(currentDRE.lucroLiquido)}</td>
                            <td className={cn("p-4 text-sm font-bold text-right", currentDRE.lucroLiquido >= 0 ? "text-green-600" : "text-red-600")}>{formatPercent(currentDRE.lucroLiquido, currentDRE.receitaLiquida)}</td>
                            {showComparison && (
                                <>
                                    <td className="p-4 text-sm text-neutral-600 text-right">{formatCurrency(previousDRE.lucroLiquido)}</td>
                                    <td className={cn("p-4 text-sm font-bold text-right", calcVariation(currentDRE.lucroLiquido, previousDRE.lucroLiquido) >= 0 ? "text-green-600" : "text-red-600")}>
                                        {calcVariation(currentDRE.lucroLiquido, previousDRE.lucroLiquido) >= 0 ? '+' : ''}{calcVariation(currentDRE.lucroLiquido, previousDRE.lucroLiquido)}%
                                    </td>
                                </>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .bg-white.rounded-xl, .bg-white.rounded-xl * { visibility: visible; }
                    .bg-white.rounded-xl { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    );
}

