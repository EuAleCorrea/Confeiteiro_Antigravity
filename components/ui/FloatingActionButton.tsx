"use client";

import { useState } from "react";
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
        href: "/orcamentos/novo",
        color: "bg-primary",
    },
    {
        icon: Calendar,
        label: "Ver Agenda",
        href: "/agenda",
        color: "bg-blue-500",
    },
    {
        icon: ShoppingBag,
        label: "Novo Pedido",
        href: "/pedidos",
        color: "bg-orange-500",
    },
    {
        icon: ChefHat,
        label: "Produção",
        href: "/producao",
        color: "bg-green-600",
    },
    {
        icon: DollarSign,
        label: "Registrar Receita",
        href: "/financeiro?action=nova-receita",
        color: "bg-success",
    },
    {
        icon: Package,
        label: "Entrada de Estoque",
        href: "/estoque?action=entrada",
        color: "bg-info",
    },
];

interface FloatingActionButtonProps {
    actions?: FABAction[];
}

export function FloatingActionButton({ actions = defaultActions }: FloatingActionButtonProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Hide on specific pages where it might obstruct UI or is redundant
    if (pathname?.startsWith('/estoque') || pathname?.startsWith('/orcamentos')) return null;

    // Calculate circular positions for each action
    // Fan spread: from straight up (0°) to left (-90°)
    const totalAngle = 90; // degrees to spread
    const startAngle = 0; // start from top (12 o'clock)
    const radius = 90; // distance from center in pixels
    const angleStep = totalAngle / (actions.length - 1);

    const getPosition = (index: number) => {
        // Calculate angle for this item (in degrees, going counterclockwise from top)
        const angleDeg = startAngle + (index * angleStep);
        // Convert to radians
        const angleRad = (angleDeg * Math.PI) / 180;
        // Calculate x,y offsets (negative y for up, negative x for left)
        const x = -Math.sin(angleRad) * radius;
        const y = -Math.cos(angleRad) * radius;
        return { x, y };
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 pb-safe">
                {/* Action buttons in circular layout */}
                {actions.map((action, index) => {
                    const pos = getPosition(index);
                    return (
                        <div
                            key={index}
                            className={cn(
                                "absolute flex items-center gap-2 transition-all duration-300",
                                isOpen
                                    ? "opacity-100 pointer-events-auto"
                                    : "opacity-0 pointer-events-none"
                            )}
                            style={{
                                // Position relative to center of main FAB
                                bottom: `calc(28px + ${isOpen ? -pos.y : 0}px)`,
                                right: `calc(28px + ${isOpen ? -pos.x : 0}px)`,
                                transitionDelay: isOpen ? `${index * 40}ms` : "0ms",
                                transform: `translate(50%, 50%) scale(${isOpen ? 1 : 0.5})`,
                            }}
                        >
                            {/* Label */}
                            <span className="bg-surface px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-text-primary whitespace-nowrap">
                                {action.label}
                            </span>
                            {/* Button */}
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
                    );
                })}

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
            </div>
        </>
    );
}
