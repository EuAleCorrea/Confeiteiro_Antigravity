"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabaseStorage } from "@/lib/supabase-storage";
import Link from "next/link";
import { Clock, MapPin, Truck, Store } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaItem {
    id: string;
    hora: string;
    tipo: "Entrega" | "Retirada";
    cliente: string;
    produto: string;
    endereco?: string;
}

export function DailyAgenda() {
    const [items, setItems] = useState<AgendaItem[]>([]);
    const [todayStr, setTodayStr] = useState("");

    useEffect(() => {
        const today = new Date();
        const todayISO = today.toISOString().split("T")[0];
        setTodayStr(format(today, "dd/MM/yyyy", { locale: ptBR }));

        async function loadAgenda() {
            const pedidos = await supabaseStorage.getPedidos();

            const todayOrders = pedidos
                .filter((p) =>
                    p.dataEntrega === todayISO &&
                    p.status !== "Entregue" &&
                    p.status !== "Cancelado"
                )
                .sort((a, b) => a.horaEntrega.localeCompare(b.horaEntrega))
                .slice(0, 4)
                .map((p) => ({
                    id: p.id,
                    hora: p.horaEntrega,
                    tipo: p.tipo,
                    cliente: p.cliente.nome,
                    produto: p.itens[0]?.nome || "Pedido",
                    endereco: p.tipo === "Entrega" && p.entrega.endereco
                        ? `${p.entrega.endereco.rua}, ${p.entrega.endereco.numero}`
                        : undefined,
                }));

            setItems(todayOrders);
        }
        loadAgenda();
    }, []);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    📅 Agenda de Hoje
                    <span className="text-xs font-normal text-text-secondary">- {todayStr}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {items.length === 0 ? (
                    <div className="py-6 text-center text-text-secondary">
                        <p className="text-sm">Nenhuma entrega ou retirada hoje</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <Link key={item.id} href={`/pedidos/${item.id}`}>
                                <div className="flex gap-3 p-3 rounded-xl bg-neutral-50 border border-border hover:border-primary/30 transition-colors">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            {item.tipo === "Entrega" ? <Truck size={16} /> : <Store size={16} />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={12} className="text-text-secondary" />
                                            <span className="text-xs font-medium text-text-secondary">{item.hora}</span>
                                            <span className="text-xs text-text-secondary">•</span>
                                            <span className="text-xs text-text-secondary">{item.tipo}</span>
                                        </div>
                                        <p className="text-sm font-medium text-text-primary truncate">{item.cliente}</p>
                                        <p className="text-xs text-text-secondary truncate">{item.produto}</p>
                                        {item.endereco && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <MapPin size={10} className="text-text-secondary shrink-0" />
                                                <span className="text-xs text-text-secondary truncate">{item.endereco}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                <Link href="/dashboard/agenda" className="block mt-4">
                    <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary-dark">
                        Ver Agenda Completa →
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

