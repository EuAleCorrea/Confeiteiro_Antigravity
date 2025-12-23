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
    Sliders
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: ShoppingBag, label: "Pedidos", href: "/pedidos" },
    { icon: ChefHat, label: "Produção", href: "/producao" },
    { icon: FileText, label: "Orçamentos", href: "/orcamentos" },
    { icon: UserCircle, label: "Clientes", href: "/clientes" },
    { icon: Utensils, label: "Produtos & Sabores", href: "/produtos" },
    { icon: Package, label: "Estoque", href: "/estoque" },
    { icon: Truck, label: "Fornecedores", href: "/fornecedores" },
    { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
    { icon: Calendar, label: "Agenda", href: "/agenda" },
    { icon: Users, label: "Equipe", href: "/equipe" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
    { icon: Sliders, label: "Config. Avançadas", href: "/configuracoes-avancadas" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-surface border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                    <span className="text-xl font-bold text-primary">Confeiteiro</span>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-text-secondary hover:text-text-primary"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary"
                                )}
                            >
                                <item.icon size={20} className={isActive ? "text-primary" : ""} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
