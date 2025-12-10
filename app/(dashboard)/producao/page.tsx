"use client";

import { useState, useEffect } from "react";
import { storage, Pedido, Receita, Ingrediente, ConfigProducao } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChevronLeft, ChevronRight, Settings, Printer, Download, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { WeekGrid } from "@/components/producao/WeekGrid";
import { DoughCalculator } from "@/components/producao/DoughCalculator";
import { FillingCalculator } from "@/components/producao/FillingCalculator";
import { calculateProduction, ProductionPlan } from "@/components/producao/calculations";

export default function ProductionDashboardPage() {
    // Stage 5 Implementation
    // Default to current week start (Monday)
    const [startDate, setStartDate] = useState<Date>(getMonday(new Date()));
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [plan, setPlan] = useState<ProductionPlan>({ massas: [], recheios: [], listaCompras: [] });

    // Stats
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalDiscs, setTotalDiscs] = useState(0);
    const [totalFillingKg, setTotalFillingKg] = useState(0);

    useEffect(() => {
        loadData();
    }, [startDate]);

    const loadData = () => {
        const allOrders = storage.getPedidos();
        const receitas = storage.getReceitas();
        const ingredientes = storage.getIngredientes();
        const config = storage.getConfigProducao();

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const weekOrders = allOrders.filter(o => {
            const d = new Date(o.dataEntrega + 'T00:00:00');
            return d >= startDate && d < endDate;
        });

        setOrders(weekOrders);
        setTotalOrders(weekOrders.length);

        const productionPlan = calculateProduction(weekOrders, receitas, ingredientes, config);
        setPlan(productionPlan);

        // Update stats
        let totalDiscsCount = 0;
        productionPlan.massas.forEach(m => {
            m.detalhes.forEach(d => totalDiscsCount += d.qtdDiscos);
        });
        setTotalDiscs(totalDiscsCount);

        let totalFilling = 0;
        productionPlan.recheios.forEach(r => totalFilling += r.totalPesoGramas);
        setTotalFillingKg(totalFilling / 1000);
    };

    const changeWeek = (offset: number) => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + (offset * 7));
        setStartDate(newDate);
    };

    // Date formatting
    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const endOfWeek = new Date(startDate);
    endOfWeek.setDate(startDate.getDate() + 6);

    return (
        <div className="space-y-8 animate-in fade-in max-w-[1600px] mx-auto">
            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800">Planejamento de Produção</h1>
                    <p className="text-neutral-500">Gestão técnica de pedidos, massas e ingredientes</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/producao/lista-compras">
                        <Button variant="outline">
                            <ShoppingCart size={18} className="mr-2" /> Lista de Compras
                        </Button>
                    </Link>
                    <Link href="/producao/print">
                        <Button variant="outline">
                            <Printer size={18} className="mr-2" /> Fichas Técnicas
                        </Button>
                    </Link>
                    <Link href="/producao/configuracoes">
                        <Button variant="ghost" size="icon" title="Configurações">
                            <Settings size={20} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Week Selector */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)}>
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="text-center">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Período</div>
                        <div className="text-lg font-bold text-neutral-800">
                            {formatDate(startDate)} a {formatDate(endOfWeek)}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => changeWeek(1)}>
                        <ChevronRight size={20} />
                    </Button>
                </div>

                <div className="flex gap-8 text-center text-sm">
                    <div>
                        <div className="text-neutral-500">Pedidos Confirmados</div>
                        <div className="font-bold text-xl">{totalOrders}</div>
                    </div>
                    <div className="w-px bg-neutral-200 h-10"></div>
                    <div>
                        <div className="text-neutral-500">Total Discos</div>
                        <div className="font-bold text-xl">{totalDiscs}</div>
                    </div>
                    <div className="w-px bg-neutral-200 h-10"></div>
                    <div>
                        <div className="text-neutral-500">Total Recheio</div>
                        <div className="font-bold text-xl">{totalFillingKg.toFixed(1)}kg</div>
                    </div>
                </div>
            </div>

            {/* Main Visual Grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Panorama Semanal</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <WeekGrid startDate={startDate} orders={orders} />
                </CardContent>
            </Card>

            {/* Calculators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DoughCalculator plan={plan} />
                <FillingCalculator plan={plan} />
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
