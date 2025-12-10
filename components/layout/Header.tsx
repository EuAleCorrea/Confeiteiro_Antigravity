"use client";

import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="lg:hidden"
                >
                    <Menu size={24} />
                </Button>

                <div className="hidden md:flex flex-col">
                    <span className="text-xs text-text-secondary">Confeitaria Artesanal</span>
                    <h1 className="text-sm font-semibold text-text-primary">Dashboard</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-text-secondary">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error" />
                </Button>

                <div className="flex items-center gap-3 pl-4 border-l border-divider">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-medium text-text-primary">Admin</p>
                        <p className="text-xs text-text-secondary">admin@confeitaria.com</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}
