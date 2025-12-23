import { ArrowUpRight, ArrowDownLeft, ShoppingBag, ShoppingCart, Truck, Zap, Home, DollarSign, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
    transactions: Transaction[];
    onViewAll?: () => void;
}

export function RecentActivity({ transactions, onViewAll }: RecentActivityProps) {

    const getIcon = (t: Transaction) => {
        // Simple mapping based on category name or type
        const name = t.categoriaNome.toLowerCase();
        if (t.tipo === 'Receita') return <DollarSign className="w-5 h-5 text-green-600" />;

        if (name.includes('mercado') || name.includes('ingrediente')) return <ShoppingCart className="w-5 h-5 text-red-500" />;
        if (name.includes('entrega') || name.includes('motorista')) return <Truck className="w-5 h-5 text-blue-500" />;
        if (name.includes('energia') || name.includes('luz')) return <Zap className="w-5 h-5 text-yellow-500" />;
        if (name.includes('aluguel')) return <Home className="w-5 h-5 text-purple-500" />;

        return <ArrowDownLeft className="w-5 h-5 text-red-500" />;
    };

    const getIconBg = (t: Transaction) => {
        if (t.tipo === 'Receita') return "bg-green-50";
        return "bg-red-50";
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 flex flex-col h-full">
            <div className="p-6 border-b border-neutral-50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-neutral-800">Atividade Recente</h3>
                <button onClick={onViewAll} className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center">
                    Ver Tudo <ExternalLink className="w-3 h-3 ml-1" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {transactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 py-10">
                        <p>Nenhuma transação recente</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors group cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", getIconBg(t))}>
                                        {getIcon(t)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-800 text-sm">{t.descricao}</p>
                                        <p className="text-xs text-neutral-500 capitalize">
                                            {format(new Date(t.data), "d 'de' MMMM, yyyy", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "font-bold text-sm",
                                    t.tipo === 'Receita' ? "text-green-600" : "text-red-500"
                                )}>
                                    {t.tipo === 'Receita' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
