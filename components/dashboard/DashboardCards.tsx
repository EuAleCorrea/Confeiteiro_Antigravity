"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, ChefHat, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { storage, Pedido, Ingrediente, ContaReceber, Transaction } from "@/lib/storage";
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
        const pedidos = storage.getPedidos();
        const ingredientes = storage.getIngredientes();
        const transacoes = storage.getTransacoes();
        const contasReceber = storage.getContasReceber();
        const contasPagar = storage.getContasPagar();

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
        const lowStock = ingredientes.filter((i) => i.estoqueAtual <= i.estoqueMinimo).length;
        const overdueReceivables = contasReceber.filter((c) => c.status === "atrasado").length;
        const overduePayables = contasPagar.filter((c) => c.status === "vencido").length;
        const alertas = lowStock + overdueReceivables + overduePayables;

        setStats({
            pedidosHoje: { total: pedidosHoje.length, entregas, retiradas },
            faturamentoSemana: { valor: thisWeekRevenue, variacao },
            producaoPendente,
            alertas,
        });
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => (
                <Card key={i} className="overflow-hidden">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-text-secondary">{card.title}</p>
                                <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                                <p className="text-xs text-text-secondary">{card.subtitle}</p>
                            </div>
                            <div className={cn("p-3 rounded-xl", card.color)}>
                                <card.icon size={22} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
