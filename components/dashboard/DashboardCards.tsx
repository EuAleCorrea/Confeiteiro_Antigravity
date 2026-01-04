"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, ChefHat, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { supabaseStorage } from "@/lib/supabase-storage";
import { cn } from "@/lib/utils";

interface DashboardStats {
    pedidosHoje: { total: number; entregas: number; retiradas: number };
    faturamentoSemana: { valor: number; variacao: number };
    producaoPendente: number;
    alertas: number;
}

export function DashboardCards() {
    const [stats, setStats] = useState<DashboardStats>({
        pedidosHoje: { total: 0, entregas: 0, retiradas: 0 },
        faturamentoSemana: { valor: 0, variacao: 0 },
        producaoPendente: 0,
        alertas: 0,
    });

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];

        async function loadData() {
            try {
                const [pedidos, ingredientes, transacoes, contasReceber, contasPagar] = await Promise.all([
                    supabaseStorage.getPedidos(),
                    supabaseStorage.getIngredientes(),
                    supabaseStorage.getTransacoes(),
                    supabaseStorage.getContasReceber(),
                    supabaseStorage.getContasPagar()
                ]);

                // Pedidos hoje
                const pedidosHoje = pedidos.filter((p) => p.dataEntrega === today);
                const entregas = pedidosHoje.filter((p) => p.tipo === "Entrega").length;
                const retiradas = pedidosHoje.filter((p) => p.tipo === "Retirada").length;

                // Faturamento da semana
                const now = new Date();
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                const lastWeekStart = new Date(weekStart);
                lastWeekStart.setDate(lastWeekStart.getDate() - 7);

                const thisWeekRevenue = transacoes
                    .filter((t) => t.tipo === "Receita" && new Date(t.data) >= weekStart)
                    .reduce((sum, t) => sum + t.valor, 0);

                const lastWeekRevenue = transacoes
                    .filter((t) => t.tipo === "Receita" && new Date(t.data) >= lastWeekStart && new Date(t.data) < weekStart)
                    .reduce((sum, t) => sum + t.valor, 0);

                const variacao = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0;

                // Produção pendente
                const producaoPendente = pedidos.filter(
                    (p) => p.status === "Aguardando Produção" || p.status === "Em Produção"
                ).length;

                // Alertas
                // Use type assertion if properties missing in fetched type
                const lowStock = (ingredientes as any[]).filter((i) => i.estoqueAtual <= i.estoqueMinimo).length;
                const overdueReceivables = contasReceber.filter((c) => c.status === "atrasado").length;
                const overduePayables = contasPagar.filter((c) => c.status === "vencido").length;
                const alertas = lowStock + overdueReceivables + overduePayables;

                setStats({
                    pedidosHoje: { total: pedidosHoje.length, entregas, retiradas },
                    faturamentoSemana: { valor: thisWeekRevenue, variacao },
                    producaoPendente,
                    alertas,
                });
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
            }
        }
        loadData();
    }, []);

    const cards = [
        {
            title: "Pedidos Hoje",
            value: stats.pedidosHoje.total.toString(),
            subtitle: `${stats.pedidosHoje.entregas} entregas • ${stats.pedidosHoje.retiradas} retiradas`,
            icon: ShoppingBag,
            color: "bg-primary/10 text-primary",
        },
        {
            title: "Faturamento Semana",
            value: `R$ ${stats.faturamentoSemana.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            subtitle: stats.faturamentoSemana.variacao >= 0
                ? `+${stats.faturamentoSemana.variacao.toFixed(0)}% vs semana anterior`
                : `${stats.faturamentoSemana.variacao.toFixed(0)}% vs semana anterior`,
            icon: stats.faturamentoSemana.variacao >= 0 ? TrendingUp : TrendingDown,
            color: stats.faturamentoSemana.variacao >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error",
        },
        {
            title: "Produção Pendente",
            value: stats.producaoPendente.toString(),
            subtitle: "pedidos",
            icon: ChefHat,
            color: "bg-warning/10 text-warning",
        },
        {
            title: "Alertas",
            value: stats.alertas.toString(),
            subtitle: stats.alertas > 0 ? "itens requerem atenção" : "tudo em ordem",
            icon: AlertTriangle,
            color: stats.alertas > 0 ? "bg-error/10 text-error" : "bg-success/10 text-success",
        },
    ];

    return (
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => (
                <Card key={i} className="overflow-hidden">
                    <CardContent className="p-3 md:p-5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
                                <p className="text-xs md:text-sm font-medium text-text-secondary truncate">{card.title}</p>
                                <p className="text-lg md:text-2xl font-bold text-text-primary">{card.value}</p>
                                <p className="text-[10px] md:text-xs text-text-secondary truncate">{card.subtitle}</p>
                            </div>
                            <div className={cn("p-2 md:p-3 rounded-xl flex-shrink-0 ml-2", card.color)}>
                                <card.icon size={18} className="md:w-[22px] md:h-[22px]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
