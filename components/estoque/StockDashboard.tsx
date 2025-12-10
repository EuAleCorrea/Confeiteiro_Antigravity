"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Package, AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";
import { storage, Ingrediente } from "@/lib/storage";

export function StockDashboard() {
    const [stats, setStats] = useState({
        totalItens: 0,
        valorTotal: 0,
        itensAlerta: 0,
        itensFalta: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        const ingredientes = storage.getIngredientes();

        let totalVal = 0;
        let alerta = 0;
        let falta = 0;

        ingredientes.forEach(ing => {
            // Calculate value if not stored (fallback logic)
            const val = (ing.estoqueAtual || 0) * (ing.custoMedio || ing.custoUnitario || 0);
            totalVal += val;

            if (ing.estoqueAtual === 0) {
                falta++;
            } else if (ing.estoqueAtual <= ing.estoqueMinimo) {
                alerta++;
            }
        });

        setStats({
            totalItens: ingredientes.length,
            valorTotal: totalVal,
            itensAlerta: alerta,
            itensFalta: falta
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-500">Total de Itens</CardTitle>
                    <Package className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalItens}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-500">Valor em Estoque</CardTitle>
                    <div className="text-green-600 font-bold text-xs bg-green-100 px-2 py-0.5 rounded">R$</div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-neutral-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.valorTotal)}
                    </div>
                </CardContent>
            </Card>

            <Card className={stats.itensAlerta > 0 ? "border-yellow-400 bg-yellow-50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-700">Itens em Alerta</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-800">{stats.itensAlerta}</div>
                    <p className="text-xs text-yellow-600 mt-1">Abaixo do mínimo</p>
                </CardContent>
            </Card>

            <Card className={stats.itensFalta > 0 ? "border-red-400 bg-red-50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-700">Itens em Falta</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-800">{stats.itensFalta}</div>
                    <p className="text-xs text-red-600 mt-1">Estoque zerado</p>
                </CardContent>
            </Card>
        </div>
    );
}
