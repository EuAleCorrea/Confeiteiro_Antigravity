import { Badge } from "@/components/ui/Badge";
import { Pedido } from "@/lib/storage";

interface StatusBadgeProps {
    status: Pedido['status'];
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    let variant: "default" | "success" | "warning" | "error" | "info" | "neutral" = "default";

    switch (status) {
        case 'Pagamento Pendente':
            variant = "error"; // Red
            break;
        case 'Aguardando Produção':
            variant = "warning"; // Orange
            break;
        case 'Em Produção':
            variant = "info"; // Blue
            break;
        case 'Pronto':
            variant = "success"; // Green
            break;
        case 'Saiu para Entrega':
            variant = "warning"; // Orange/Yellow
            break;
        case 'Entregue':
            variant = "success"; // Green
            break;
        case 'Cancelado':
            variant = "neutral"; // Gray
            break;
        default:
            variant = "default";
    }

    return (
        <Badge variant={variant} className={className}>
            {status}
        </Badge>
    );
}

