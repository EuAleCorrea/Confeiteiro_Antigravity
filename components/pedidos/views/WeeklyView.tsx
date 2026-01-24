"use client";

import { Pedido } from "@/lib/storage";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WeeklyViewProps {
    pedidos: Pedido[];
}

export function WeeklyView({ pedidos }: WeeklyViewProps) {
    const [startOfWeek, setStartOfWeek] = useState(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        return new Date(d.setDate(diff));
    });

    const changeWeek = (offset: number) => {
        const newDate = new Date(startOfWeek);
        newDate.setDate(newDate.getDate() + (offset * 7));
        setStartOfWeek(newDate);
    };

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    const getPedidosForDay = (date: Date) => {
        return pedidos.filter(p => new Date(p.dataEntrega).toDateString() === date.toDateString())
            .sort((a, b) => a.horaEntrega.localeCompare(b.horaEntrega));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-800">
                    Semana de {startOfWeek.toLocaleDateString()} a {days[6].toLocaleDateString()}
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => changeWeek(-1)} className="p-2 border rounded hover:bg-neutral-50"><ChevronLeft size={16} /></button>
                    <button onClick={() => changeWeek(0)} className="text-sm border px-3 rounded hover:bg-neutral-50">Hoje</button>
                    <button onClick={() => changeWeek(1)} className="p-2 border rounded hover:bg-neutral-50"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
                {days.map((day, idx) => {
                    const dayPedidos = getPedidosForDay(day);
                    const isToday = new Date().toDateString() === day.toDateString();

                    return (
                        <div key={idx} className={cn("min-w-[200px] w-full flex-1 flex flex-col bg-neutral-50 rounded-lg p-2 border", isToday ? "border-primary bg-orange-50/30" : "border-neutral-200")}>
                            <div className={cn("text-center mb-3 p-2 rounded", isToday ? "bg-primary text-white" : "bg-white text-neutral-700 border border-neutral-100")}>
                                <div className="text-xs font-bold uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                                <div className="text-xl font-bold">{day.getDate()}</div>
                            </div>

                            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                                {dayPedidos.map(p => (
                                    <Link key={p.id} href={`/pedidos/${p.id}`}>
                                        <div className={cn(
                                            "bg-white p-2 rounded shadow-sm border-l-4 hover:shadow-md transition-all",
                                            p.tipo === 'Entrega' ? "border-l-orange-500" : "border-l-blue-500"
                                        )}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm text-neutral-800 line-clamp-1">{p.cliente.nome}</span>
                                                <span className="text-[10px] text-neutral-500 font-medium bg-neutral-100 px-1 rounded">{p.tipo === 'Entrega' ? 'E' : 'R'}</span>
                                            </div>
                                            <div className="text-xs text-neutral-600 space-y-0.5">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={10} /> {p.horaEntrega}
                                                </div>
                                                <div className="line-clamp-2 italic text-[10px] text-neutral-500">
                                                    {p.itens.map(i => i.nome).join(', ')}
                                                </div>
                                            </div>

                                            <div className="mt-2 text-[10px]">
                                                <span className={cn("px-1.5 py-0.5 rounded",
                                                    p.status === 'Entregue' ? "bg-green-100 text-green-700" :
                                                        p.status === 'Em Produção' ? "bg-blue-100 text-blue-700" :
                                                            "bg-neutral-100 text-neutral-700"
                                                )}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

