"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { OrderForm } from "@/components/pedidos/OrderForm";
import Link from "next/link";
import { Plus, Calendar, ShoppingBag, ChefHat, AlertTriangle, FileText } from "lucide-react";
import { supabaseStorage } from "@/lib/supabase-storage";

export function QuickActions() {
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [showTuesdayAlert, setShowTuesdayAlert] = useState(false);
    const [weeklyOrdersCount, setWeeklyOrdersCount] = useState(0);

    useEffect(() => {
        // Check if today is Tuesday after 18h
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, 2=Tue...
        const hour = now.getHours();

        // Show alert on Tuesday after 18h or nearby (Mon after 18h as reminder)
        if ((dayOfWeek === 2 && hour >= 17) || (dayOfWeek === 1 && hour >= 18)) {
            setShowTuesdayAlert(true);
        }

        // Count orders for this week
        async function countWeeklyOrders() {
            const pedidos = await supabaseStorage.getPedidos();
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            const weekOrders = pedidos.filter(p => {
                // Ensure dataEntrega is a Date object or valid string
                const deliveryDate = new Date(p.dataEntrega);
                return deliveryDate >= startOfWeek && deliveryDate <= endOfWeek;
            });
            setWeeklyOrdersCount(weekOrders.length);
        }
        countWeeklyOrders();
    }, []);

    const actions = [
        {
            icon: FileText,
            label: "Novo Orçamento",
            href: "/orcamentos/novo",
            color: "bg-primary text-white hover:bg-primary-dark",
            isLink: true
        },
        {
            icon: Calendar,
            label: "Ver Agenda",
            href: "/agenda",
            color: "bg-blue-500 text-white hover:bg-blue-600",
            isLink: true
        },
        {
            icon: ShoppingBag,
            label: `Pedidos Semana (${weeklyOrdersCount})`,
            href: "/pedidos",
            color: "bg-orange-500 text-white hover:bg-orange-600",
            isLink: true
        },
        {
            icon: ChefHat,
            label: "Ir para Produção",
            href: "/producao",
            color: "bg-green-600 text-white hover:bg-green-700",
            isLink: true
        },
    ];

    return (
        <>
            <Card className="bg-gradient-to-br from-primary/5 to-orange-50 border-primary/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        🚀 Ações Rápidas
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                    {/* Tuesday Alert */}
                    {showTuesdayAlert && (
                        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl text-warning-darker">
                            <AlertTriangle size={18} />
                            <span className="text-sm font-medium">⏰ Lembrete: Fechar agenda às 18h!</span>
                        </div>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        {actions.map((action) => (
                            <Link key={action.label} href={action.href}>
                                <button className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${action.color}`}>
                                    <action.icon size={18} />
                                    <span className="truncate">{action.label}</span>
                                </button>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* New Order Modal */}
            <Dialog
                isOpen={isNewOrderOpen}
                onClose={() => setIsNewOrderOpen(false)}
                title="Novo Pedido"
                className="max-w-4xl"
            >
                <OrderForm
                    onClose={() => setIsNewOrderOpen(false)}
                    onSave={() => setIsNewOrderOpen(false)}
                />
            </Dialog>
        </>
    );
}

