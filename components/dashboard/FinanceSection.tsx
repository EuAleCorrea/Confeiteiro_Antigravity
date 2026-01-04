"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabaseStorage } from "@/lib/supabase-storage";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface DailyData {
    dia: string;
    valor: number;
}

export function FinanceSection() {
    const [weekData, setWeekData] = useState<DailyData[]>([]);
    const [totalSemana, setTotalSemana] = useState(0);
    const [variacao, setVariacao] = useState(0);

    useEffect(() => {
        async function loadData() {
            const transacoes = await supabaseStorage.getTransacoes();
            const now = new Date();

            // Get last 7 days
            const dias = ["D", "S", "T", "Q", "Q", "S", "S"];
            const data: DailyData[] = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];

                const dayRevenue = transacoes
                    .filter((t) => t.tipo === "Receita" && t.data === dateStr)
                    .reduce((sum, t) => sum + t.valor, 0);

                data.push({
                    dia: dias[date.getDay()],
                    valor: dayRevenue,
                });
            }

            setWeekData(data);

            const total = data.reduce((sum, d) => sum + d.valor, 0);
            setTotalSemana(total);

            // Calculate week-over-week variation
            const prevWeekStart = new Date(now);
            prevWeekStart.setDate(now.getDate() - 13);
            const prevWeekEnd = new Date(now);
            prevWeekEnd.setDate(now.getDate() - 7);

            const prevWeekTotal = transacoes
                .filter((t) => {
                    const d = new Date(t.data);
                    return t.tipo === "Receita" && d >= prevWeekStart && d < prevWeekEnd;
                })
                .reduce((sum, t) => sum + t.valor, 0);

            if (prevWeekTotal > 0) {
                setVariacao(((total - prevWeekTotal) / prevWeekTotal) * 100);
            }
        }
        loadData();
    }, []);

    const maxValor = Math.max(...weekData.map((d) => d.valor), 1);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Finanças</CardTitle>
                <Link href="/financeiro">
                    <Button variant="ghost" size="sm" className="text-xs text-text-secondary">
                        Ver detalhes
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold text-text-primary">
                        R$ {totalSemana.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {variacao !== 0 && (
                        <span className={`text-sm font-medium ${variacao >= 0 ? "text-success" : "text-error"}`}>
                            {variacao >= 0 ? "+" : ""}{variacao.toFixed(0)}%
                        </span>
                    )}
                </div>
                <p className="text-xs text-text-secondary mb-4">Receita total da semana</p>

                {/* Bar chart */}
                <div className="flex items-end gap-2 h-24">
                    {weekData.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                                style={{
                                    height: `${Math.max((day.valor / maxValor) * 100, day.valor > 0 ? 10 : 0)}%`,
                                    minHeight: day.valor > 0 ? 8 : 0
                                }}
                            />
                            <span className="text-xs text-text-secondary">{day.dia}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
