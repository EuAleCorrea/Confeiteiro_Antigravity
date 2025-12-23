import { Pedido } from "@/lib/storage";
import { ProductionCard } from "./ProductionCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DayProductionListProps {
    date: Date;
    orders: Pedido[];
}

export function DayProductionList({ date, orders }: DayProductionListProps) {
    const formattedDate = format(date, "d 'de' MMMM", { locale: ptBR });

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-800">Produção para {formattedDate}</h2>
                <p className="text-neutral-500 text-sm">
                    {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} agendados
                </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {orders.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-100 rounded-xl bg-neutral-50">
                        <p className="text-sm">Nenhum pedido para este dia</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <ProductionCard key={order.id} order={order} />
                    ))
                )}

                {orders.length > 0 && (
                    <div className="flex justify-end pt-4">
                        <button className="flex items-center justify-center w-12 h-12 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors shadow-sm">
                            <span className="text-2xl font-light leading-none mb-1">+</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
