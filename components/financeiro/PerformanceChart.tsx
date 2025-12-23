import { cn } from "@/lib/utils";

interface PerformanceChartProps {
    data: {
        label: string;
        value: number;
        isCurrent?: boolean;
    }[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
    // Find max value to normalize height
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg text-neutral-800 mb-6">Desempenho Financeiro <span className="text-xs font-normal text-neutral-400 ml-2">Últimos 30 dias</span></h3>

            <div className="flex-1 flex items-end justify-between gap-2 min-h-[160px]">
                {data.map((item, i) => {
                    const heightPercent = (item.value / maxValue) * 100;

                    return (
                        <div key={i} className="flex flex-col items-center flex-1 group">
                            <div className="w-full max-w-[40px] relative h-full flex items-end">
                                <div
                                    className={cn(
                                        "w-full rounded-t-sm transition-all duration-500",
                                        item.isCurrent ? "bg-orange-500" : "bg-pink-200 group-hover:bg-pink-300"
                                    )}
                                    style={{ height: `${heightPercent}%` }}
                                >
                                    {/* Tooltip on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                                        R$ {item.value.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-neutral-400 font-medium text-center truncate w-full">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
