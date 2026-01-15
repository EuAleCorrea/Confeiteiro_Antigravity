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

    // Circular layout configuration
    const radius = 120; // distance from center in pixels
    const startAngle = -30; // start angle (degrees from vertical, negative = right of vertical)
    const endAngle = 120; // end angle (degrees, going counterclockwise)
    const totalAngle = endAngle - startAngle;
    const angleStep = totalAngle / (actions.length - 1);

    const getPosition = (index: number) => {
        const angleDeg = startAngle + (index * angleStep);
        const angleRad = (angleDeg * Math.PI) / 180;
        // x positive = left, y positive = up
        const x = Math.sin(angleRad) * radius;
        const y = Math.cos(angleRad) * radius;
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

            {/* FAB Container - WEB: middle right, MOBILE: bottom right */}
            <div className="fixed right-4 md:right-6 z-50 bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
                {/* Action buttons in circular layout */}
                {actions.map((action, index) => {
                    const pos = getPosition(index);
                    return (
                        <div
                            key={index}
                            className={cn(
                                "absolute flex items-center gap-3 transition-all duration-300 ease-out",
                                isOpen
                                    ? "opacity-100 pointer-events-auto"
                                    : "opacity-0 pointer-events-none"
                            )}
                            style={{
                                // Position from center of main FAB
                                left: isOpen ? `${28 - pos.x - 24}px` : "4px",
                                top: isOpen ? `${28 - pos.y - 24}px` : "4px",
                                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                                transform: isOpen ? "scale(1)" : "scale(0.3)",
                            }}
                        >
                            {/* Label - positioned to the left of button */}
                            <span
                                className={cn(
                                    "bg-surface px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-text-primary whitespace-nowrap transition-all duration-300",
                                    isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                                )}
                                style={{ transitionDelay: isOpen ? `${index * 50 + 100}ms` : "0ms" }}
                            >
                                {action.label}
                            </span>
                            {/* Button */}
                            {action.href ? (
                                <Link
                                    href={action.href}
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 shrink-0",
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
                                        "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 shrink-0",
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
