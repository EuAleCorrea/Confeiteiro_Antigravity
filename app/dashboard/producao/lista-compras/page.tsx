"use client";

import { useState, useEffect } from "react";
import { storage, Pedido, Receita, Ingrediente, ConfigProducao } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";
import { ShoppingList } from "@/components/producao/ShoppingList";
import { calculateProduction, ProductionPlan } from "@/components/producao/calculations";

export default function ShoppingListPage() {
    // Default to current week start (Monday)
    const [startDate, setStartDate] = useState<Date>(getMonday(new Date()));
    const [plan, setPlan] = useState<ProductionPlan>({ massas: [], recheios: [], listaCompras: [] });

    useEffect(() => {
        loadData();
    }, [startDate]);

    const loadData = () => {
        const allOrders = storage.getPedidos();
        const receitas = storage.getReceitas();
        const ingredientes = storage.getIngredientes();
        const config = storage.getConfigProducao();

        // Filter by date range (start date + 7 days)
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const weekOrders = allOrders.filter(o => {
            const d = new Date(o.dataEntrega + 'T00:00:00');
            return d >= startDate && d < endDate;
        });

        const productionPlan = calculateProduction(weekOrders, receitas, ingredientes, config);
        setPlan(productionPlan);
    };

    // Date formatting
    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const endOfWeek = new Date(startDate);
    endOfWeek.setDate(startDate.getDate() + 6);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-10">
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/producao">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800">Lista de Compras</h1>
                        <p className="text-neutral-500 text-sm">
                            Período: {formatDate(startDate)} a {formatDate(endOfWeek)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer size={18} className="mr-2" /> Imprimir
                    </Button>
                </div>
            </div>

            <ShoppingList plan={plan} />
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

