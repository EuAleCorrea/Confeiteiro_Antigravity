"use client";

import { useState, useEffect } from "react";
import { supabaseStorage } from "@/lib/supabase-storage";
import { AgendaSemanal, Pedido } from "@/lib/storage";
import { Loader2, LayoutGrid, Calendar as CalendarIcon, Search, ShoppingCart, Printer, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WeekGrid } from "@/components/producao/WeekGrid";
import { MonthCalendar } from "@/components/producao/MonthCalendar";
import { DayProductionList } from "@/components/producao/DayProductionList";
import Link from "next/link";
import { startOfWeek } from "date-fns";
import { generateProductionReport } from "@/lib/pdf-generator";

export default function ProductionDashboardPage() {
    // State
    const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'summary'>('calendar');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: new Date().toISOString().split('T')[0],
        end: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
    });
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Pedido[]>([]);
    const [agendas, setAgendas] = useState<AgendaSemanal[]>([]);
    const [loading, setLoading] = useState(true);

    // Derived state for WeekGrid (List View)
    // When switching to list view, we might want to start the week view from the selected date's week
    const weekStartDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Filter orders based on selected date for the Day List
        const dateStr = selectedDate.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => o.dataEntrega === dateStr)
            .sort((a, b) => a.horaEntrega.localeCompare(b.horaEntrega));
        setFilteredOrders(dayOrders);
    }, [selectedDate, orders]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedOrders, fetchedAgendas] = await Promise.all([
                supabaseStorage.getPedidos(),
                supabaseStorage.getAgendasSemanais()
            ]);
            setOrders(fetchedOrders as Pedido[]);
            setAgendas(fetchedAgendas);
        } catch (error) {
            console.error("Erro ao carregar dados de produção:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.20))] flex flex-col gap-6 max-w-[1600px] mx-auto animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Menu Button would go here if this was the full shell, but we are inside the page */}
                    <h1 className="text-2xl font-bold text-neutral-800">Planejamento de Produção</h1>
                    <div className="ml-auto md:hidden">
                        <Search className="text-neutral-400" />
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 bg-neutral-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'calendar'
                            ? 'bg-white text-neutral-800 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        <CalendarIcon size={16} />
                        Calendário
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list'
                            ? 'bg-white text-neutral-800 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        <LayoutGrid size={16} />
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('summary')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'summary'
                            ? 'bg-white text-neutral-800 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        <Printer size={16} />
                        Resumo
                    </button>
                </div>

                <div className="hidden md:block">
                    <Search className="text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors" />
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] flex-1">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-text-secondary font-medium">Carregando produção...</p>
                </div>
            ) : viewMode === 'calendar' ? (
                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
                    {/* Calendar Panel */}
                    <div className="md:col-span-5 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col">
                        <MonthCalendar
                            currentDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            orders={orders}
                        />

                        {/* Quick Stats or Legend could go here in empty space */}
                        <div className="mt-auto p-6 border-t border-neutral-50 bg-neutral-50/50">
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Legenda</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span>Concluídos</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span>Pendentes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Em Andamento</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Day Details Panel */}
                    <div className="md:col-span-7 lg:col-span-8 h-full min-h-[500px]">
                        <DayProductionList date={selectedDate} orders={filteredOrders} />
                    </div>
                </div>
            ) : viewMode === 'list' ? (
                <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    <WeekGrid
                        startDate={weekStartDate}
                        orders={orders}
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                            setSelectedDate(date);
                        }}
                        agendas={agendas}
                    />
                </div>
            ) : (
                <ProductionSummaryView
                    orders={orders}
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onRangeChange={(start, end) => setDateRange({ start, end })}
                />
            )}
        </div>
    );
}

// --- Internal Component for Summary ---
function ProductionSummaryView({ orders, startDate, endDate, onRangeChange }: {
    orders: Pedido[],
    startDate: string,
    endDate: string,
    onRangeChange: (s: string, e: string) => void
}) {
    // Filter orders
    const rangeOrders = orders.filter(o =>
        o.dataEntrega >= startDate && o.dataEntrega <= endDate && o.status !== 'Cancelado'
    );

    // Aggregate
    const summary = {
        massas: {} as Record<string, number>,
        recheios: {} as Record<string, number>,
        decoracoes: [] as string[]
    };

    rangeOrders.forEach(order => {
        order.itens.forEach(item => {
            // Massas
            if (item.saborMassa) {
                summary.massas[item.saborMassa] = (summary.massas[item.saborMassa] || 0) + item.quantidade;
            }
            // Recheios
            if (item.saborRecheio) {
                // Handle multiple fillings (split by " + ")
                const fillings = item.saborRecheio.split(" + ");
                fillings.forEach(f => {
                    summary.recheios[f] = (summary.recheios[f] || 0) + item.quantidade;
                });
            }
        });
    });

    return (
        <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-4">
                <div>
                    <h2 className="text-lg font-bold text-neutral-800">Resumo de Produção</h2>
                    <p className="text-sm text-neutral-500">Agrupado por insumos e processos</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onRangeChange(e.target.value, endDate)}
                        className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <span className="text-neutral-400">até</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onRangeChange(startDate, e.target.value)}
                        className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <Button variant="outline" onClick={() => generateProductionReport(startDate, endDate, rangeOrders)}>
                        <Printer size={16} className="mr-2" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Massas */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
                        <div className="w-2 h-6 bg-orange-400 rounded-full" />
                        Massas (Quantidade de itens)
                    </h3>
                    <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                        {Object.entries(summary.massas).length === 0 && <p className="text-sm text-neutral-400 italic">Nenhuma massa no período.</p>}
                        {Object.entries(summary.massas).map(([massa, qtd]) => (
                            <div key={massa} className="flex justify-between items-center text-sm border-b border-neutral-100 last:border-0 py-2">
                                <span>{massa}</span>
                                <span className="font-bold bg-white px-2 py-1 rounded shadow-sm">{qtd}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recheios */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
                        <div className="w-2 h-6 bg-pink-400 rounded-full" />
                        Recheios (Total)
                    </h3>
                    <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                        {Object.entries(summary.recheios).length === 0 && <p className="text-sm text-neutral-400 italic">Nenhum recheio no período.</p>}
                        {Object.entries(summary.recheios).map(([recheio, qtd]) => (
                            <div key={recheio} className="flex justify-between items-center text-sm border-b border-neutral-100 last:border-0 py-2">
                                <span>{recheio}</span>
                                <span className="font-bold bg-white px-2 py-1 rounded shadow-sm">{qtd}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="pt-4">
                <h3 className="font-bold text-neutral-800 mb-3">Pedidos no Período ({rangeOrders.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rangeOrders.map(order => (
                        <div key={order.id} className="p-3 border border-neutral-200 rounded-lg text-sm bg-neutral-50/50">
                            <div className="flex justify-between font-medium mb-1">
                                <span>#{order.numero} - {order.cliente.nome}</span>
                                <span className="text-xs text-neutral-500">{new Date(order.dataEntrega).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-neutral-600 truncate">{order.itens.map(i => i.nome).join(", ")}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helpers
function getMonday(d: Date) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}
