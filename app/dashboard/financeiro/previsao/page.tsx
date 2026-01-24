"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Calendar, TrendingUp, Receipt, CreditCard, Info } from "lucide-react";
import { storage, ContaReceber } from "@/lib/storage";
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ForecastItem {
    id: string;
    tipo: 'orcamento' | 'pedido' | 'conta';
    cliente: string;
    descricao: string;
    valor: number;
    dataPrevisao: string;
}

export default function PrevisaoPage() {
    const [orcamentos, setOrcamentos] = useState<any[]>([]);
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | '2weeks' | 'month'>('week');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // Load data from storage
        const allOrcamentos = storage.getOrcamentos().filter(o => o.status === 'Aprovado');
        const allPedidos = storage.getPedidos().filter(p =>
            p.status !== 'Entregue' && p.status !== 'Cancelado'
        );
        const allContas = storage.getContasReceber().filter(c =>
            c.status === 'pendente' || c.status === 'parcial'
        );

        setOrcamentos(allOrcamentos);
        setPedidos(allPedidos);
        setContasReceber(allContas);
    };

    // Calculate forecast by period
    const forecast = useMemo(() => {
        const now = new Date();

        const periods = {
            week: { start: now, end: addWeeks(now, 1), label: 'Próxima Semana' },
            '2weeks': { start: now, end: addWeeks(now, 2), label: 'Próximas 2 Semanas' },
            month: { start: startOfMonth(addMonths(now, 1)), end: endOfMonth(addMonths(now, 1)), label: format(addMonths(now, 1), "MMMM yyyy", { locale: ptBR }) }
        };

        const getItemsInPeriod = (period: { start: Date; end: Date }) => {
            const items: ForecastItem[] = [];

            // Orçamentos aprovados
            orcamentos.forEach(o => {
                const dataEntrega = o.dataEntrega ? new Date(o.dataEntrega) : null;
                if (dataEntrega && isWithinInterval(dataEntrega, period)) {
                    items.push({
                        id: o.id,
                        tipo: 'orcamento',
                        cliente: o.cliente?.nome || 'Cliente',
                        descricao: `Orç #${o.numero}`,
                        valor: o.valorTotal || 0,
                        dataPrevisao: o.dataEntrega
                    });
                }
            });

            // Pedidos confirmados
            pedidos.forEach(p => {
                const dataEntrega = p.dataEntrega ? new Date(p.dataEntrega) : null;
                if (dataEntrega && isWithinInterval(dataEntrega, period)) {
                    items.push({
                        id: p.id,
                        tipo: 'pedido',
                        cliente: p.cliente?.nome || 'Cliente',
                        descricao: p.produto?.nome || 'Pedido',
                        valor: p.valorTotal || 0,
                        dataPrevisao: p.dataEntrega
                    });
                }
            });

            // Contas a receber pendentes
            contasReceber.forEach(c => {
                const dataVenc = new Date(c.dataVencimento);
                if (isWithinInterval(dataVenc, period)) {
                    items.push({
                        id: c.id,
                        tipo: 'conta',
                        cliente: c.cliente.nome,
                        descricao: c.descricao,
                        valor: c.saldoRestante,
                        dataPrevisao: c.dataVencimento
                    });
                }
            });

            return items;
        };

        const weekItems = getItemsInPeriod(periods.week);
        const twoWeekItems = getItemsInPeriod(periods['2weeks']);
        const monthItems = getItemsInPeriod(periods.month);

        return {
            week: {
                items: weekItems,
                total: weekItems.reduce((acc, i) => acc + i.valor, 0),
                label: periods.week.label,
                dateRange: `${format(periods.week.start, 'dd/MM')} - ${format(periods.week.end, 'dd/MM')}`
            },
            '2weeks': {
                items: twoWeekItems,
                total: twoWeekItems.reduce((acc, i) => acc + i.valor, 0),
                label: periods['2weeks'].label,
                dateRange: `${format(periods['2weeks'].start, 'dd/MM')} - ${format(periods['2weeks'].end, 'dd/MM')}`
            },
            month: {
                items: monthItems,
                total: monthItems.reduce((acc, i) => acc + i.valor, 0),
                label: periods.month.label,
                dateRange: format(periods.month.start, "MMMM 'de' yyyy", { locale: ptBR })
            }
        };
    }, [orcamentos, pedidos, contasReceber]);

    const selectedForecast = forecast[selectedPeriod];

    const getTypeIcon = (tipo: ForecastItem['tipo']) => {
        switch (tipo) {
            case 'orcamento': return <Receipt className="w-4 h-4 text-blue-500" />;
            case 'pedido': return <CreditCard className="w-4 h-4 text-green-500" />;
            case 'conta': return <TrendingUp className="w-4 h-4 text-orange-500" />;
        }
    };

    const getTypeLabel = (tipo: ForecastItem['tipo']) => {
        switch (tipo) {
            case 'orcamento': return 'Orçamento';
            case 'pedido': return 'Pedido';
            case 'conta': return 'Conta a Receber';
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/financeiro" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800">📊 Previsão de Receitas</h1>
                        <p className="text-sm text-neutral-500">Projeção baseada em pedidos, orçamentos e contas</p>
                    </div>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                    <RefreshCw className="w-4 h-4" /> Atualizar
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-blue-800">Como calculamos a previsão</p>
                    <p className="text-xs text-blue-600 mt-1">
                        Baseado em: Orçamentos aprovados • Pedidos confirmados • Contas a receber pendentes
                    </p>
                </div>
            </div>

            {/* Forecast Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {(['week', '2weeks', 'month'] as const).map(period => (
                    <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`bg-white rounded-xl p-5 border-2 transition-all text-left ${selectedPeriod === period
                                ? 'border-orange-500 ring-2 ring-orange-100'
                                : 'border-neutral-100 hover:border-neutral-200'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs font-medium text-neutral-500 uppercase">{forecast[period].label}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mb-3">{forecast[period].dateRange}</p>
                        <p className="text-2xl font-bold text-neutral-800">
                            R$ {forecast[period].total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">
                            {forecast[period].items.length} itens
                        </p>
                    </button>
                ))}
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                    <h2 className="font-bold text-neutral-800">Detalhamento: {selectedForecast.label}</h2>
                    <p className="text-xs text-neutral-500">{selectedForecast.dateRange}</p>
                </div>

                {selectedForecast.items.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhuma receita prevista para este período</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase">Tipo</th>
                                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase">Cliente</th>
                                <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase">Descrição</th>
                                <th className="text-right p-4 text-xs font-semibold text-neutral-500 uppercase">Valor</th>
                                <th className="text-center p-4 text-xs font-semibold text-neutral-500 uppercase">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedForecast.items.map(item => (
                                <tr key={item.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100">
                                            {getTypeIcon(item.tipo)}
                                            {getTypeLabel(item.tipo)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-neutral-800">{item.cliente}</td>
                                    <td className="p-4 text-sm text-neutral-600">{item.descricao}</td>
                                    <td className="p-4 text-sm font-bold text-green-600 text-right">
                                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4 text-sm text-neutral-500 text-center">
                                        {format(new Date(item.dataPrevisao), 'dd/MM')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-neutral-50">
                            <tr>
                                <td colSpan={3} className="p-4 text-sm font-bold text-neutral-800">TOTAL PREVISTO</td>
                                <td className="p-4 text-lg font-bold text-green-600 text-right">
                                    R$ {selectedForecast.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>
        </div>
    );
}

