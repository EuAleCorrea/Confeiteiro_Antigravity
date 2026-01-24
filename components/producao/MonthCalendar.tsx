import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pedido } from "@/lib/storage";

interface MonthCalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    orders: Pedido[];
}

export function MonthCalendar({ currentDate, onDateSelect, orders }: MonthCalendarProps) {
    const [viewDate, setViewDate] = useState(currentDate);

    const firstDayOfMonth = startOfMonth(viewDate);
    const lastDayOfMonth = endOfMonth(viewDate);
    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

    // Fill in empty days at start of month
    const startDayOfWeek = getDay(firstDayOfMonth);
    const emptyDays = Array.from({ length: startDayOfWeek });

    const nextMonth = () => setViewDate(addMonths(viewDate, 1));
    const prevMonth = () => setViewDate(subMonths(viewDate, 1));

    // Helper to check for orders on a specific day
    const getDayStatus = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => o.dataEntrega === dateStr);

        if (dayOrders.length === 0) return null;

        // Logic:
        // Green: All completed
        // Blue: Any in progress
        // Yellow: Any pending
        // Priority: Pending (needs action) > In Progress > Completed

        const hasPending = dayOrders.some(o => o.status === 'Pagamento Pendente' || o.status === 'Aguardando Produção');
        const hasInProgress = dayOrders.some(o => o.status === 'Em Produção');

        if (hasPending) return 'yellow';
        if (hasInProgress) return 'blue';
        return 'green'; // Assume completed if not pending or in progress
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded-full transition-colors">
                    <ChevronLeft size={20} className="text-neutral-500" />
                </button>
                <h2 className="text-lg font-bold text-neutral-800 capitalize">
                    {format(viewDate, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <button onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded-full transition-colors">
                    <ChevronRight size={20} className="text-neutral-500" />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-2 text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-xs font-medium text-neutral-400 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {daysInMonth.map((day) => {
                    const isSelected = isSameDay(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const status = getDayStatus(day);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDateSelect(day)}
                            className={cn(
                                "flex flex-col items-center justify-center h-10 w-10 mx-auto rounded-full text-sm transition-all relative",
                                isSelected ? "bg-orange-100 text-orange-700 font-bold" : "hover:bg-neutral-50 text-neutral-600",
                                isToday && !isSelected && "text-orange-500 font-bold"
                            )}
                        >
                            <span>{format(day, "d")}</span>

                            {/* Status Dot */}
                            {status && (
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full absolute bottom-1",
                                    status === 'green' && "bg-green-500",
                                    status === 'yellow' && "bg-yellow-500",
                                    status === 'blue' && "bg-blue-500"
                                )} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

