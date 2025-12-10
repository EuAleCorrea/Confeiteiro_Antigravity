"use client";

import { useState, useEffect } from "react";
import { storage, Pedido } from "@/lib/storage";
import { ProductionCalendar } from "@/components/producao/ProductionCalendar";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [orders, setOrders] = useState<Pedido[]>([]);

    useEffect(() => {
        // Adjust start date to Monday of current week if needed, or keeping explicit controls.
        // For simplicity, let's start at "Today" or nearest Monday.
        const monday = getMonday(new Date());
        setStartDate(monday);

        loadOrders();
    }, []);

    const loadOrders = () => {
        // Load ALL future orders to map them correctly even if delivery is next week (tasks might be this week)
        // For optimization, load +/- 2 weeks.
        setOrders(storage.getPedidos());
    };

    const handleNextWeek = () => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 7);
        setStartDate(d);
    };

    const handlePrevWeek = () => {
        const d = new Date(startDate);
        d.setDate(d.getDate() - 7);
        setStartDate(d);
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/producao">
                        <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-neutral-800">Calendário de Tarefas</h1>
                </div>

                <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-neutral-200 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
                        <ChevronLeft size={20} />
                    </Button>
                    <span className="font-mono font-medium min-w-[200px] text-center">
                        {startDate.toLocaleDateString('pt-BR')} - {new Date(startDate.getTime() + 6 * 86400000).toLocaleDateString('pt-BR')}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>

            <ProductionCalendar orders={orders} startDate={startDate} />

            <div className="flex gap-4 text-xs text-neutral-500 mt-4 justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></span> Prep (Massas/Recheios)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></span> Montagem</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span> Decoração/Entrega</span>
            </div>
        </div>
    );
}

function getMonday(d: Date) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}
