"use client";

import { useState, useEffect } from "react";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { OrdersSection } from "@/components/dashboard/OrdersSection";
import { FinanceSection } from "@/components/dashboard/FinanceSection";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { DailyAgenda } from "@/components/dashboard/DailyAgenda";
import { QuickTasks } from "@/components/dashboard/QuickTasks";
import { storage } from "@/lib/storage";

export default function DashboardPage() {
    const [greeting, setGreeting] = useState("");
    const [userName, setUserName] = useState("Admin");
    const [period, setPeriod] = useState<"hoje" | "semana">("hoje");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Bom dia");
        else if (hour < 18) setGreeting("Boa tarde");
        else setGreeting("Boa noite");

        // Get user name from settings if available
        const config = storage.getConfiguracoes();
        if (config?.empresa?.nome) {
            // Use first name only
            const firstName = config.empresa.nome.split(" ")[0];
            if (firstName && firstName.length < 20) {
                setUserName(firstName);
            }
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        {greeting}, {userName}! 👋
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Aqui está o resumo do seu negócio.
                    </p>
                </div>

                {/* Period toggle */}
                <div className="flex items-center bg-neutral-100 rounded-xl p-1">
                    <button
                        onClick={() => setPeriod("hoje")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${period === "hoje"
                                ? "bg-surface text-text-primary shadow-sm"
                                : "text-text-secondary hover:text-text-primary"
                            }`}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => setPeriod("semana")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${period === "semana"
                                ? "bg-surface text-text-primary shadow-sm"
                                : "text-text-secondary hover:text-text-primary"
                            }`}
                    >
                        Esta Semana
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <DashboardCards />

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Orders Section */}
                <OrdersSection />

                {/* Finance Section */}
                <FinanceSection />
            </div>

            {/* Secondary Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Stock Alerts */}
                <StockAlerts />

                {/* Daily Agenda */}
                <DailyAgenda />

                {/* Quick Tasks */}
                <QuickTasks />
            </div>
        </div>
    );
}
