import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2 } from "lucide-react";
import { Pedido } from "@/lib/storage";

interface ProductionCardProps {
    order: Pedido;
}

export function ProductionCard({ order }: ProductionCardProps) {
    // Determinar status e cor
    const status = order.status;

    // Group statuses
    const isCompleted = status === 'Entregue' || status === 'Pronto' || status === 'Saiu para Entrega';
    const isPending = status === 'Pagamento Pendente' || status === 'Aguardando Produção';
    const isInProgress = status === 'Em Produção';
    const isCancelled = status === 'Cancelado';

    const getStatusColor = () => {
        if (isCompleted) return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
        if (isInProgress) return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
        if (isPending) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200";
        if (isCancelled) return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    };

    const getStatusLabel = () => {
        return status;
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-neutral-800 text-sm">
                        Pedido #{order.id.slice(0, 4)} - {order.cliente.nome.split(' ')[0]}
                    </h3>
                </div>
                <Badge variant="neutral" className={cn("border-0 font-medium px-2 py-0.5", getStatusColor())}>
                    {isCompleted ? <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" /> :
                        isPending ? <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5" /> :
                            isInProgress ? <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" /> :
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 mr-1.5" />}
                    {getStatusLabel()}
                </Badge>
            </div>

            <div className="space-y-1 mb-3">
                {order.itens.map((item, idx) => (
                    <div key={idx} className="text-neutral-600 text-sm">
                        {item.nome} <span className="text-neutral-400">({item.quantidade})</span>
                        {item.saborMassa && <span className="block text-xs text-neutral-400 ml-2">Massa: {item.saborMassa}</span>}
                    </div>
                ))}
            </div>

            <div className="flex items-center text-xs text-neutral-400 gap-4 mt-3 pt-3 border-t border-neutral-50">
                <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>Entrega: {order.horaEntrega}</span>
                </div>
            </div>
        </div>
    );
}

