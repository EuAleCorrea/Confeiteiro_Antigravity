"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background font-sans text-text-primary">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>

                <footer className="py-6 text-center text-xs text-text-secondary border-t border-border mt-auto">
                    <p>&copy; 2024 Confeiteiro App. Versão 1.0.0</p>
                </footer>
            </div>
        </div>
    );
}
