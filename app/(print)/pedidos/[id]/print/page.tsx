"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { storage, Pedido } from "@/lib/storage";
import { ProductionPDF } from "@/components/pedidos/ProductionPDF";

export default function PrintOrderPage() {
    const params = useParams();
    const [pedido, setPedido] = useState<Pedido | null>(null);

    useEffect(() => {
        if (params.id) {
            const data = storage.getPedidoById(params.id as string);
            if (data) {
                setPedido(data);
                // Wait for render then print
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        }
    }, [params.id]);

    if (!pedido) return <div className="p-8 text-center print:hidden">Carregando para impressão...</div>;

    return <ProductionPDF pedido={pedido} />;
}
