"use client";

import { useState, useEffect } from "react";
import { Plus, X, FileText, DollarSign, Package, Calendar, ShoppingBag, ChefHat } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FABAction {
    icon: typeof Plus;
    label: string;
    href?: string;
    onClick?: () => void;
    color?: string;
}

const defaultActions: FABAction[] = [
    {
        icon: FileText,
        label: "Novo Orçamento",
        href: "/dashboard/orcamentos/novo",
        color: "bg-primary",
    },
    {
        icon: ShoppingBag,
        label: "Novo Pedido",
        href: "/dashboard/pedidos", // Idealmente abriria modal se houver query param, ou vai pra lista
        color: "bg-orange-500",
    },
    {
        icon: Calendar,
        label: "Ver Agenda",
        href: "/dashboard/agenda",
        color: "bg-blue-500",
    },
    {
        icon: ChefHat,
        label: "Produção",
        href: "/dashboard/producao",
        color: "bg-green-600",
    },
    {
        icon: DollarSign,
        label: "Nova Receita",
        href: "/dashboard/financeiro", // Ajustar para abrir modal de receita se possível via URL
        color: "bg-success",
    },
    {
        icon: Package,
        label: "Entrada Estoque",
        href: "/dashboard/estoque", // Ajustar para abrir modal de estoque se possível via URL
        color: "bg-info",
    },
];

interface FloatingActionButtonProps {
    actions?: FABAction[];
}

export function FloatingActionButton({ actions = defaultActions }: FloatingActionButtonProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Evita hidratação incorreta
    useEffect(() => {
        setMounted(true);
    }, []);

    // Hide on specific pages where it might obstruct UI or is redundant
    if (!mounted) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* FAB Container - Bottom Right */}
            <div className="fixed right-6 bottom-24 md:bottom-10 z-50 flex flex-col items-end gap-4 pointer-events-none">

                {/* Action Buttons Stack */}
                <div className="flex flex-col items-end gap-3 mb-2">
                    {actions.map((action, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-3 transition-all duration-300 ease-out transform",
                                isOpen
                                    ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
                                    : "opacity-0 translate-y-10 pointer-events-none scale-75 h-0 overflow-hidden"
                            )}
                            style={{
                                transitionDelay: isOpen ? `${(actions.length - 1 - index) * 50}ms` : "0ms"
                            }}
                        >
                            {/* Label */}
                            <span className="bg-surface text-text-primary px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap border border-border/50">
                                {action.label}
                            </span>

                            {/* Button */}
                            {action.href ? (
                                <Link
                                    href={action.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95",
                                        action.color || "bg-primary"
                                    )}
                                >
                                    <action.icon size={20} />
                                </Link>
                            ) : (
                                <button
                                    onClick={() => {
                                        action.onClick?.();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95",
                                        action.color || "bg-primary"
                                    )}
                                >
                                    <action.icon size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Main Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 pointer-events-auto",
                        "bg-gradient-to-br from-primary to-primary-dark hover:shadow-2xl hover:scale-105 active:scale-95",
                        isOpen && "rotate-45 bg-error"
                    )}
                    aria-label={isOpen ? "Fechar menu" : "Abrir menu de ações rápidas"}
                >
                    <Plus size={28} />
                </button>
            </div>
        </>
    );
}

