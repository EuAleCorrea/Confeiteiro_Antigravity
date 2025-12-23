"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ToastProvider } from "@/components/ui/Toast";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Persist collapsed state in localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved !== null) {
            setIsSidebarCollapsed(saved === 'true');
        }
    }, []);

    const handleToggleCollapse = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    return (
        <ToastProvider>
            <NotificationProvider>
                <div className="flex min-h-screen bg-background font-sans text-text-primary">
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={handleToggleCollapse}
                    />

                    <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
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

                    <FloatingActionButton />
                </div>
            </NotificationProvider>
        </ToastProvider>
    );
}
