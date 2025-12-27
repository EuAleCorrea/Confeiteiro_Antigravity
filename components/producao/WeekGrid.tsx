import { useState } from "react";
import { Pedido } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, addWeeks, subWeeks, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProductionCard } from "./ProductionCard";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface WeekGridProps {
    startDate: Date;
    orders: Pedido[];
    selectedDate?: Date;
    onSelectDate?: (date: Date) => void;
}

export function WeekGrid({ startDate: initialStartDate, orders, selectedDate, onSelectDate }: WeekGridProps) {
    const [weekStart, setWeekStart] = useState<Date>(initialStartDate);

    // Generate 7 days from weekStart
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Helper to get orders for a day
    const getOrdersForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        return orders.filter(o => o.dataEntrega === dateStr).sort((a, b) => a.horaEntrega.localeCompare(b.horaEntrega));
    };

    // Navigation
    const goToPreviousWeek = () => setWeekStart(subWeeks(weekStart, 1));
    const goToNextWeek = () => setWeekStart(addWeeks(weekStart, 1));
    const goToCurrentWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Week summary
    const weekOrders = days.flatMap(d => getOrdersForDay(d));
    const totalItems = weekOrders.reduce((sum, o) => sum + o.itens.length, 0);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Week Navigation Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/5 to-orange-50 border-b border-neutral-200 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousWeek}
                        className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                        title="Semana anterior"
                    >
                        <ChevronLeft size={20} className="text-neutral-600" />
                    </button>
                    <button
                        onClick={goToCurrentWeek}
                        className="px-3 py-1.5 rounded-lg bg-white shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                    >
                        <Calendar size={16} />
                        Hoje
                    </button>
                    <button
                        onClick={goToNextWeek}
                        className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                        title="Próxima semana"
                    >
                        <ChevronRight size={20} className="text-neutral-600" />
                    </button>
                </div>

                <div className="text-center">
                    <h3 className="font-bold text-neutral-800">
                        {format(days[0], "dd 'de' MMMM", { locale: ptBR })} - {format(days[6], "dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <p className="text-xs text-neutral-500">{format(days[0], 'yyyy', { locale: ptBR })}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-neutral-500">Pedidos: </span>
                        <span className="font-bold text-primary">{weekOrders.length}</span>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-neutral-500">Itens: </span>
                        <span className="font-bold text-orange-600">{totalItems}</span>
                    </div>
                </div>
            </div>

            {/* Header: Days of Week */}
            <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/50 shrink-0">
                {days.map((day, i) => {
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const dayOrders = getOrdersForDay(day);

                    return (
                        <div
                            key={i}
                            onClick={() => onSelectDate?.(day)}
                            className={cn(
                                "py-3 text-center border-r border-neutral-200 last:border-r-0 flex flex-col items-center justify-center relative cursor-pointer hover:bg-neutral-100/50 transition-colors",
                                isToday ? "bg-orange-50/50" : "",
                                isSelected ? "bg-pink-50/50 shadow-[inset_0_-2px_0_0_#db2777]" : ""
                            )}
                        >
                            <div className={cn(
                                "text-[10px] font-bold uppercase tracking-widest mb-0.5",
                                isSelected ? "text-pink-600" : "text-neutral-400"
                            )}>
                                {format(day, 'EEE', { locale: ptBR }).replace('.', '')}
                            </div>
                            <div className={cn(
                                "text-sm font-bold",
                                isToday ? "text-orange-600" : (isSelected ? "text-pink-700" : "text-neutral-700")
                            )}>
                                {format(day, 'dd/MM')}
                            </div>
                            {/* Order count badge */}
                            {dayOrders.length > 0 && (
                                <div className={cn(
                                    "mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    isToday ? "bg-orange-200 text-orange-700" : "bg-primary/20 text-primary"
                                )}>
                                    {dayOrders.length} {dayOrders.length === 1 ? 'pedido' : 'pedidos'}
                                </div>
                            )}
                            {isToday && !isSelected && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-400" />}
                        </div>
                    );
                })}
            </div>

            {/* Body: Columns */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="grid grid-cols-7 min-h-full divide-x divide-neutral-200">
                    {days.map((day, i) => {
                        const dayOrders = getOrdersForDay(day);
                        const isToday = isSameDay(day, new Date());
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                        return (
                            <div
                                key={i}
                                onClick={() => onSelectDate?.(day)}
                                className={cn(
                                    "p-2 space-y-3 min-h-[400px] cursor-pointer transition-colors",
                                    isToday ? (isSelected ? "bg-orange-50/30" : "bg-orange-50/10") : (isSelected ? "bg-pink-50/10" : "bg-neutral-50/30")
                                )}
                            >
                                {dayOrders.length === 0 ? (
                                    <div className="h-24 flex flex-col items-center justify-center text-neutral-300 mt-4 rounded-lg border-2 border-dashed border-neutral-100">
                                        <span className="text-xs italic">Sem pedidos</span>
                                    </div>
                                ) : (
                                    dayOrders.map((order) => (
                                        <div key={order.id} className="group">
                                            <ProductionCard order={order} />
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
