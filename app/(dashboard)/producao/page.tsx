"use client";

import { useState, useEffect } from "react";
import { storage, Pedido } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { WeekGrid } from "@/components/producao/WeekGrid";
import { MonthCalendar } from "@/components/producao/MonthCalendar";
import { DayProductionList } from "@/components/producao/DayProductionList";
import { LayoutGrid, Calendar as CalendarIcon, Search, ShoppingCart, Printer, Settings } from "lucide-react";
import Link from "next/link";
import { startOfWeek } from "date-fns";

export default function ProductionDashboardPage() {
    // State
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Pedido[]>([]);

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

    const loadData = () => {
        const allOrders = storage.getPedidos();
        setOrders(allOrders);
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
                        Lista de Pedidos
                    </button>
                </div>

                <div className="hidden md:block">
                    <Search className="text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors" />
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'calendar' ? (
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
            ) : (
                <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    <WeekGrid
                        startDate={weekStartDate}
                        orders={orders}
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                            setSelectedDate(date);
                            // Optional: switch to calendar view if desired, but user just asked to select
                            // setViewMode('calendar'); 
                        }}
                    />
                </div>
            )}
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
