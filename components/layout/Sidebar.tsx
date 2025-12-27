"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    ShoppingBag,
    ChefHat,
    Package,
    DollarSign,
    Calendar,
    Users,
    Settings,
    X,
    UserCircle,
    Utensils,
    Truck,
    Sliders,
    PanelLeftClose,
    PanelLeft,
    HelpCircle,
    Sparkles
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

// Menu organizado pelo fluxo natural de trabalho
const menuGroups = [
    {
        title: "Principal",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/" },
            { icon: Calendar, label: "Agenda", href: "/agenda" },
            { icon: FileText, label: "Orçamentos", href: "/orcamentos" },
            { icon: ShoppingBag, label: "Pedidos", href: "/pedidos" },
            { icon: ChefHat, label: "Produção", href: "/producao" },
        ]
    },
    {
        title: "Cadastros",
        items: [
            { icon: UserCircle, label: "Clientes", href: "/clientes" },
            { icon: Utensils, label: "Produtos", href: "/produtos" },
            { icon: Sparkles, label: "Adereços", href: "/aderecos" },
        ]
    },
    {
        title: "Gestão",
        items: [
            { icon: Package, label: "Estoque", href: "/estoque" },
            { icon: Truck, label: "Fornecedores", href: "/fornecedores" },
            { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
        ]
    },
    {
        title: "Sistema",
        items: [
            { icon: Settings, label: "Configurações", href: "/configuracoes" },
            { icon: HelpCircle, label: "Ajuda", href: "/ajuda" },
        ]
    }
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 transform bg-surface border-r border-border transition-all duration-300 ease-in-out lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Header with Logo and Toggle */}
                <div className={cn(
                    "flex h-16 items-center border-b border-border",
                    isCollapsed ? "justify-center px-2" : "justify-between px-4"
                )}>
                    {/* Logo / App Name */}
                    {!isCollapsed ? (
                        <span className="text-xl font-bold text-primary">Confeiteiro</span>
                    ) : (
                        <span className="text-xl">🧁</span>
                    )}

                    {/* Toggle Button (Desktop) */}
                    <button
                        onClick={onToggleCollapse}
                        className={cn(
                            "hidden lg:flex p-2 rounded-lg text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors",
                            isCollapsed && "absolute right-2"
                        )}
                        title={isCollapsed ? "Expandir menu" : "Condensar menu"}
                    >
                        {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                    </button>

                    {/* Close Button (Mobile) */}
                    <button
                        onClick={onClose}
                        className="lg:hidden text-text-secondary hover:text-text-primary"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={cn(
                    "p-2 space-y-4 overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin",
                    isCollapsed ? "px-2" : "px-4"
                )}>
                    {menuGroups.map((group) => (
                        <div key={group.title} className="space-y-1">
                            {/* Section Title */}
                            {!isCollapsed && (
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3 pt-2 pb-1">
                                    {group.title}
                                </p>
                            )}
                            {isCollapsed && group.title !== "Principal" && (
                                <div className="border-t border-border my-2" />
                            )}

                            {/* Menu Items */}
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={isCollapsed ? item.label : undefined}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center rounded-xl transition-colors",
                                            isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                                            isActive
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary"
                                        )}
                                    >
                                        <item.icon size={20} className={cn(
                                            isActive ? "text-primary" : "",
                                            isCollapsed ? "flex-shrink-0" : ""
                                        )} />
                                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
