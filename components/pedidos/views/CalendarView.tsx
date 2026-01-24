"use client";

import { Pedido } from "@/lib/storage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
    pedidos: Pedido[];
}

export function CalendarView({ pedidos }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const getPedidosForDay = (day: number) => {
        return pedidos.filter(p => {
            const d = new Date(p.dataEntrega);
            return d.getDate() === day &&
                d.getMonth() === currentDate.getMonth() &&
                d.getFullYear() === currentDate.getFullYear();
        });
    };

    const days = [];
    // Empty cells for days before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="bg-neutral-50 border border-neutral-100 min-h-[100px]" />);
    }

    // Days with content
    for (let day = 1; day <= daysInMonth; day++) {
        const dayPedidos = getPedidosForDay(day);
        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

        days.push(
            <div key={day} className={cn("border border-neutral-200 min-h-[100px] p-2 bg-white hover:bg-neutral-50 transition-colors group relative", isToday && "bg-orange-50")}>
                <div className="flex justify-between items-start">
                    <span className={cn("text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center", isToday ? "bg-primary text-white" : "text-neutral-700")}>
                        {day}
                    </span>
                    {dayPedidos.length > 0 && <span className="text-xs font-bold text-neutral-500">{dayPedidos.length}</span>}
                </div>

                <div className="mt-2 space-y-1">
                    {dayPedidos.slice(0, 3).map(p => (
                        <Link key={p.id} href={`/pedidos/${p.id}`} className="block">
                            <div className={cn(
                                "text-[10px] truncate px-1 py-0.5 rounded border-l-2",
                                p.status === 'Entregue' ? "bg-green-50 border-green-500 text-green-700" :
                                    p.status === 'Em Produção' ? "bg-blue-50 border-blue-500 text-blue-700" :
                                        "bg-orange-50 border-orange-500 text-orange-700"
                            )}>
                                {p.cliente.nome}
                            </div>
                        </Link>
                    ))}
                    {dayPedidos.length > 3 && (
                        <div className="text-[10px] text-neutral-400 text-center font-medium">
                            + {dayPedidos.length - 3} mais
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border overflow-hidden bg-white">
            <div className="flex items-center justify-between p-4 bg-neutral-50 border-b border-border">
                <h2 className="text-lg font-bold capitalize text-neutral-800">
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-neutral-200 rounded"><ChevronLeft size={20} /></button>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-neutral-200 rounded"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center bg-neutral-100 border-b border-border text-sm font-medium text-neutral-600 py-2">
                <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SÁB</div>
            </div>

            <div className="grid grid-cols-7">
                {days}
            </div>
        </div>
    );
}

