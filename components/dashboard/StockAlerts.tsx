"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { storage, Ingrediente, Adereco } from "@/lib/storage";
import Link from "next/link";
import { AlertTriangle, AlertCircle, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockAlert {
    id: string;
    nome: string;
    quantidade: string;
    nivel: "critico" | "baixo";
    tipo: "ingrediente" | "adereco";
}

export function StockAlerts() {
    const [alerts, setAlerts] = useState<StockAlert[]>([]);

    useEffect(() => {
        // Get ingredient alerts
        const ingredientes = storage.getIngredientes();
        const ingredientAlerts: StockAlert[] = ingredientes
            .filter((i) => i.estoqueAtual <= i.estoqueMinimo)
            .map((i) => ({
                id: i.id,
                nome: i.nome,
                quantidade: `${i.estoqueAtual}${i.unidade}`,
                nivel: (i.estoqueAtual <= i.estoqueMinimo * 0.5 ? "critico" : "baixo") as "critico" | "baixo",
                tipo: "ingrediente" as const,
            }));

        // Get adereço alerts
        const aderecos = storage.getAderecosComEstoqueBaixo();
        const aderecoAlerts: StockAlert[] = aderecos.map((a) => ({
            id: a.id,
            nome: a.nome,
            quantidade: `${a.estoqueAtual} ${a.unidade}`,
            nivel: (a.estoqueAtual <= a.estoqueMinimo * 0.5 ? "critico" : "baixo") as "critico" | "baixo",
            tipo: "adereco" as const,
        }));

        // Combine and sort (critical first, then by tipo)
        const combined = [...ingredientAlerts, ...aderecoAlerts]
            .sort((a, b) => {
                if (a.nivel !== b.nivel) return a.nivel === "critico" ? -1 : 1;
                return a.tipo === "adereco" ? -1 : 1; // Adereços first within same level
            })
            .slice(0, 6);

        setAlerts(combined);
    }, []);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Alertas de Estoque</CardTitle>
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
                                key={`${alert.tipo}-${alert.id}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-border"
                            >
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    alert.nivel === "critico" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                                )}>
                                    {alert.nivel === "critico" ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-text-primary truncate">{alert.nome}</p>
                                        {alert.tipo === "adereco" && (
                                            <Sparkles size={12} className="text-primary flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-text-secondary">
                                        {alert.tipo === "adereco" ? "Adereço" : "Ingrediente"} · {alert.nivel === "critico" ? "Crítico" : "Baixo"}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-text-primary">{alert.quantidade}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2 mt-4">
                    <Link href="/estoque" className="flex-1">
                        <Button variant="ghost" className="w-full text-sm text-text-secondary hover:text-primary">
                            <Package size={14} className="mr-1" /> Estoque
                        </Button>
                    </Link>
                    <Link href="/aderecos" className="flex-1">
                        <Button variant="ghost" className="w-full text-sm text-text-secondary hover:text-primary">
                            <Sparkles size={14} className="mr-1" /> Adereços
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

