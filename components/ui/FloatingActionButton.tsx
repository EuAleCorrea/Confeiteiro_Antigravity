"use client";

import { useState } from "react";
import { Plus, X, FileText, DollarSign, TrendingDown, Package, ClipboardList } from "lucide-react";
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
        label: "Novo Pedido",
        href: "/pedidos/novo",
        color: "bg-primary",
    },
    {
        icon: DollarSign,
        label: "Registrar Receita",
        href: "/financeiro?action=nova-receita",
        color: "bg-success",
    },
    {
        icon: TrendingDown,
        label: "Registrar Despesa",
        href: "/financeiro?action=nova-despesa",
        color: "bg-warning",
    },
    {
        icon: Package,
        label: "Entrada de Estoque",
        href: "/estoque?action=entrada",
        color: "bg-info",
    },
    {
        icon: ClipboardList,
        label: "Nova Tarefa",
        onClick: () => { },
        color: "bg-purple-500",
    },
];

interface FloatingActionButtonProps {
    actions?: FABAction[];
}

export function FloatingActionButton({ actions = defaultActions }: FloatingActionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col-reverse items-end gap-3 pb-safe">
            {/* Action buttons */}
            <div
                className={cn(
                    "flex flex-col-reverse gap-2 transition-all duration-300",
                    isOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-4 pointer-events-none"
                )}
            >
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3"
                        style={{
                            transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                        }}
                    >
                        <span className="bg-surface px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-text-primary whitespace-nowrap">
                            {action.label}
                        </span>
                        {action.href ? (
                            <Link
                                href={action.href}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110",
                                    action.color || "bg-primary"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                <action.icon size={22} />
                            </Link>
                        ) : (
                            <button
                                onClick={() => {
                                    action.onClick?.();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110",
                                    action.color || "bg-primary"
                                )}
                            >
                                <action.icon size={22} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Main FAB button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300",
                    "bg-gradient-to-br from-primary to-primary-dark",
                    "hover:shadow-2xl hover:scale-105",
                    isOpen && "rotate-45"
                )}
            >
                {isOpen ? <X size={26} /> : <Plus size={26} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 -z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
