"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { storage, Ingrediente } from "@/lib/storage";
import Link from "next/link";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockAlert {
    id: string;
    nome: string;
    quantidade: string;
    nivel: "critico" | "baixo";
}

export function StockAlerts() {
    const [alerts, setAlerts] = useState<StockAlert[]>([]);

    useEffect(() => {
        const ingredientes = storage.getIngredientes();

        const lowStock = ingredientes
            .filter((i) => i.estoqueAtual <= i.estoqueMinimo)
            .map((i) => ({
                id: i.id,
                nome: i.nome,
                quantidade: `${i.estoqueAtual}${i.unidade}`,
                nivel: (i.estoqueAtual <= i.estoqueMinimo * 0.5 ? "critico" : "baixo") as "critico" | "baixo",
            }))
            .sort((a, b) => a.nivel === "critico" ? -1 : 1)
            .slice(0, 5);

        setAlerts(lowStock);
    }, []);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Alerta de Estoque</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {alerts.length === 0 ? (
                    <div className="py-6 text-center text-text-secondary">
                        <p className="text-sm">✅ Estoque em dia</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-border"
                            >
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    alert.nivel === "critico" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                                )}>
                                    {alert.nivel === "critico" ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{alert.nome}</p>
                                    <p className="text-xs text-text-secondary">
                                        Nível {alert.nivel === "critico" ? "crítico" : "baixo"}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-text-primary">{alert.quantidade}</span>
                            </div>
                        ))}
                    </div>
                )}
                <Link href="/estoque" className="block mt-4">
                    <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary-dark">
                        Ver Estoque Completo →
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
