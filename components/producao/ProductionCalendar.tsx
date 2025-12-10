"use client";

import { useState } from "react";
import { Pedido, storage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProductionTask {
    id: string;
    type: 'Massa' | 'Recheio' | 'Montagem' | 'Decoracao';
    description: string;
    orderId: string;
    clientName: string;
    deadline: string; // Time of delivery
}

export function ProductionCalendar({ orders, startDate }: { orders: Pedido[], startDate: Date }) {
    // Generate tasks based on orders
    // Rule of thumb defaults:
    // - Massas/Recheios: 2 days before
    // - Montagem: 1 day before
    // - Decoracao: Same day (morning) or 0 days before

    const tasksByDate: Record<string, ProductionTask[]> = {};
    const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    // Initialize days
    days.forEach(d => {
        const key = d.toISOString().split('T')[0];
        tasksByDate[key] = [];
    });

    orders.forEach(order => {
        const deliveryDate = new Date(order.dataEntrega + 'T00:00:00');

        // Helper to add task
        const addTask = (date: Date, type: ProductionTask['type'], desc: string) => {
            const key = date.toISOString().split('T')[0];
            if (tasksByDate[key]) {
                tasksByDate[key].push({
                    id: `${order.id}-${type}-${Math.random()}`,
                    type,
                    description: desc,
                    orderId: order.id,
                    clientName: order.cliente.nome,
                    deadline: order.horaEntrega
                });
            }
        };

        const d0 = deliveryDate;
        const dMinus1 = addDays(deliveryDate, -1);
        const dMinus2 = addDays(deliveryDate, -2);

        // Decoration (D-0)
        addTask(d0, 'Decoracao', `Decorar Bolo (${order.itens[0]?.nome})`);

        // Assembly (D-1)
        addTask(dMinus1, 'Montagem', `Montar Bolo (${order.itens[0]?.saborMassa}/${order.itens[0]?.saborRecheio})`);

        // Prep (D-2) - Only if not a simple order? Assuming all cakes need prep.
        order.itens.forEach(item => {
            addTask(dMinus2, 'Massa', `Fazer Massa: ${item.saborMassa}`);
            addTask(dMinus2, 'Recheio', `Fazer Recheio: ${item.saborRecheio}`);
        });
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[1000px] overflow-x-auto pb-4">
            {days.map(day => {
                const dateKey = day.toISOString().split('T')[0];
                const dayTasks = tasksByDate[dateKey] || [];
                const isToday = isSameDay(day, new Date());

                return (
                    <div key={dateKey} className={cn("flex flex-col gap-2 min-w-[200px] md:min-w-0")}>
                        <div className={cn(
                            "p-2 rounded-t-lg text-center border-b-2",
                            isToday ? "bg-orange-100 border-orange-500" : "bg-neutral-100 border-neutral-300"
                        )}>
                            <div className="text-xs uppercase font-bold text-neutral-500">{format(day, 'EEE', { locale: ptBR })}</div>
                            <div className={cn("text-lg font-bold", isToday ? "text-orange-800" : "text-neutral-800")}>
                                {format(day, 'dd/MM')}
                            </div>
                        </div>

                        <div className="bg-neutral-50/50 rounded-b-lg p-2 min-h-[200px] space-y-2 border border-t-0 border-neutral-200">
                            {dayTasks.length === 0 && (
                                <div className="text-center text-xs text-neutral-400 italic py-4">Sem tarefas</div>
                            )}
                            {dayTasks.map(task => (
                                <div key={task.id} className={cn(
                                    "p-2 rounded border text-xs shadow-sm flex flex-col gap-1",
                                    task.type === 'Decoracao' && "bg-green-50 border-green-200",
                                    task.type === 'Montagem' && "bg-blue-50 border-blue-200",
                                    (task.type === 'Massa' || task.type === 'Recheio') && "bg-yellow-50 border-yellow-200"
                                )}>
                                    <div className="flex justify-between items-center font-bold">
                                        <span className="truncate max-w-[80%]">{task.type}</span>
                                        <span className="text-[10px] bg-white/50 px-1 rounded">{task.deadline}</span>
                                    </div>
                                    <p className="line-clamp-2 leading-tight">{task.description}</p>
                                    <div className="text-[10px] text-neutral-500 truncate">{task.clientName}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
