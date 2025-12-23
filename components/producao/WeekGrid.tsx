import { Pedido } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProductionCard } from "./ProductionCard";

interface WeekGridProps {
    startDate: Date;
    orders: Pedido[];
    selectedDate?: Date;
    onSelectDate?: (date: Date) => void;
}

export function WeekGrid({ startDate, orders, selectedDate, onSelectDate }: WeekGridProps) {
    // Generate 7 days from startDate
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    // Helper to get orders for a day
    const getOrdersForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        return orders.filter(o => o.dataEntrega === dateStr).sort((a, b) => a.horaEntrega.localeCompare(b.horaEntrega));
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header: Days of Week */}
            <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/50 shrink-0">
                {days.map((day, i) => {
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                    return (
                        <div
                            key={i}
                            onClick={() => onSelectDate?.(day)}
                            className={cn(
                                "py-3 text-center border-r border-neutral-200 last:border-r-0 flex flex-col items-center justify-center relative cursor-pointer hover:bg-neutral-100/50 transition-colors",
                                isToday ? "bg-orange-50/50" : "",
                                isSelected ? "bg-pink-50/50 shadow-[inset_0_-2px_0_0_#db2777]" : "" // Visual highlight for selection
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
                                    "p-2 space-y-3 min-h-[500px] cursor-pointer transition-colors",
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
