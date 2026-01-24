"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabaseStorage } from "@/lib/supabase-storage";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClipboardList, ChefHat, CheckCircle } from "lucide-react";

export function OrdersSection() {
    const [counts, setCounts] = useState({ aFazer: 0, emProducao: 0, prontos: 0 });

    useEffect(() => {
        async function loadPedidos() {
            const pedidos = await supabaseStorage.getPedidos();

            setCounts({
                aFazer: pedidos.filter((p) =>
                    p.status === "Pagamento Pendente" || p.status === "Aguardando Produção"
                ).length,
                emProducao: pedidos.filter((p) => p.status === "Em Produção").length,
                prontos: pedidos.filter((p) =>
                    p.status === "Pronto" || p.status === "Saiu para Entrega"
                ).length,
            });
        }
        loadPedidos();
    }, []);

    const items = [
        { label: "A Fazer", count: counts.aFazer, icon: ClipboardList, color: "text-warning bg-warning/10" },
        { label: "Em Prod.", count: counts.emProducao, icon: ChefHat, color: "text-info bg-info/10" },
        { label: "Prontos", count: counts.prontos, icon: CheckCircle, color: "text-success bg-success/10" },
    ];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-3">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-50 border border-border"
                        >
                            <div className={cn("p-2 rounded-lg mb-2", item.color)}>
                                <item.icon size={20} />
                            </div>
                            <span className="text-2xl font-bold text-text-primary">{item.count}</span>
                            <span className="text-xs text-text-secondary">{item.label}</span>
                        </div>
                    ))}
                </div>
                <Link href="/dashboard/pedidos" className="block mt-4">
                    <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary-dark">
                        Ver Todos os Pedidos →
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

