"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { storage, Pedido } from "@/lib/storage";
import { ProductionPDF } from "@/components/pedidos/ProductionPDF";

export default function PrintOrderClient() {
    const params = useParams();
    const id = params.id as string;
    const [pedido, setPedido] = useState<Pedido | null>(null);

    useEffect(() => {
        if (id) {
            const data = storage.getPedidoById(id);
            if (data) {
                setPedido(data);
                // Wait for render then print
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        }
    }, [id]);

    if (!pedido) return <div className="p-8 text-center print:hidden">
        {id === "placeholder" ? "Selecione um pedido para imprimir." : "Carregando para impressão..."}
    </div>;

    return <ProductionPDF pedido={pedido} />;
}
