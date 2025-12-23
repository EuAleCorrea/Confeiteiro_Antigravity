import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
    title: string;
    value: number;
    trend?: number; // percentage, e.g. 12 for +12%
    previousLabel?: string; // e.g. "vs mês anterior"
    type?: 'neutral' | 'positive' | 'negative' | 'profit'; // controls color scheme priority
}

export function FinancialCard({ title, value, trend, previousLabel = "vs mês anterior", type = 'neutral' }: FinancialCardProps) {
    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Determine trend color
    // If type is 'negative' (Expenses), increasing trend is usually "bad" (red), decreasing is "good" (green)?
    // But standard Dashboard usually uses Green = Up, Red = Down regardless of metric, OR Green = Good context.
    // Let's stick to: Increase = Green (if profit/revenue), Red (if expense).

    let trendColor = "text-neutral-500";
    let trendIcon = null;

    if (trend !== undefined && trend !== 0) {
        const isUp = trend > 0;

        if (type === 'negative') { // Expenses
            // Up = Bad (Red), Down = Good (Green)
            trendColor = isUp ? "text-red-600" : "text-green-600";
        } else {
            // Up = Good (Green), Down = Bad (Red)
            trendColor = isUp ? "text-green-600" : "text-red-600";
        }

        trendIcon = isUp ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />;
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-2">{title}</h3>
                <div className="text-3xl font-bold text-neutral-800 tracking-tight">{formattedValue}</div>
            </div>

            {trend !== undefined && (
                <div className={cn("flex items-center text-xs font-medium mt-4", trendColor)}>
                    <div className={cn("flex items-center px-1.5 py-0.5 rounded-full bg-opacity-10",
                        trendColor.replace('text-', 'bg-')
                    )}>
                        {trendIcon}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                    <span className="text-neutral-400 ml-2 font-normal">{previousLabel}</span>
                </div>
            )}
        </div>
    );
}
