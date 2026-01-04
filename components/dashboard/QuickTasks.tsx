"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabaseStorage } from "@/lib/supabase-storage";
import Link from "next/link";
import { Check, Circle, ChefHat, CreditCard, ShoppingCart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickTask {
    id: string;
    tipo: "producao" | "pagamento" | "compra" | "lembrete";
    titulo: string;
    link: string;
    completed: boolean;
}

export function QuickTasks() {
    const [tasks, setTasks] = useState<QuickTask[]>([]);

    useEffect(() => {
        async function loadQuickTasks() {
            const [pedidos, ingredientes, contasReceber] = await Promise.all([
                supabaseStorage.getPedidos(),
                supabaseStorage.getIngredientes(),
                supabaseStorage.getContasReceber()
            ]);

            const quickTasks: QuickTask[] = [];

            // Pedidos aguardando produção
            pedidos
                .filter((p) => p.status === "Aguardando Produção")
                .slice(0, 2)
                .forEach((p) => {
                    quickTasks.push({
                        id: `prod-${p.id}`,
                        tipo: "producao",
                        titulo: `Iniciar produção: Pedido #${p.numero}`,
                        link: `/pedidos/${p.id}`,
                        completed: false,
                    });
                });

            // Pagamentos pendentes
            contasReceber
                .filter((c) => c.status === "pendente" || c.status === "parcial")
                .slice(0, 2)
                .forEach((c) => {
                    quickTasks.push({
                        id: `pag-${c.id}`,
                        tipo: "pagamento",
                        titulo: `Confirmar pagamento: ${c.cliente.nome}`,
                        link: `/financeiro/contas-receber`,
                        completed: false,
                    });
                });

            // Itens para comprar
            ingredientes
                .filter((i) => i.estoqueAtual <= i.estoqueMinimo)
                .slice(0, 2)
                .forEach((i) => {
                    quickTasks.push({
                        id: `compra-${i.id}`,
                        tipo: "compra",
                        titulo: `Comprar: ${i.nome}`,
                        link: `/estoque`,
                        completed: false,
                    });
                });

            setTasks(quickTasks.slice(0, 5));
        }
        loadQuickTasks();
    }, []);

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case "producao": return ChefHat;
            case "pagamento": return CreditCard;
            case "compra": return ShoppingCart;
            case "lembrete": return MessageSquare;
            default: return Circle;
        }
    };

    const toggleTask = (id: string) => {
        setTasks((prev) =>
            prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
        );
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">✅ Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {tasks.length === 0 ? (
                    <div className="py-6 text-center text-text-secondary">
                        <p className="text-sm">✨ Nenhuma tarefa pendente</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tasks.map((task) => {
                            const Icon = getIcon(task.tipo);
                            return (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                        task.completed
                                            ? "bg-success/5 border-success/20"
                                            : "bg-neutral-50 border-border hover:border-primary/30"
                                    )}
                                >
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={cn(
                                            "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                            task.completed
                                                ? "bg-success border-success text-white"
                                                : "border-border hover:border-primary"
                                        )}
                                    >
                                        {task.completed && <Check size={12} />}
                                    </button>
                                    <Icon size={16} className="text-text-secondary shrink-0" />
                                    <Link
                                        href={task.link}
                                        className={cn(
                                            "flex-1 text-sm truncate hover:text-primary transition-colors",
                                            task.completed ? "line-through text-text-secondary" : "text-text-primary"
                                        )}
                                    >
                                        {task.titulo}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
                <Link href="/producao" className="block mt-4">
                    <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary-dark">
                        Ver Todas as Tarefas →
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
