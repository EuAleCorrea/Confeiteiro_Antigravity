"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BudgetPDF } from "@/components/orcamentos/BudgetPDF";
import { storage, Orcamento, Configuracoes } from "@/lib/storage";

export default function PrintBudgetClient() {
    const params = useParams();
    const id = params.id as string;
    const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
    const [config, setConfig] = useState<Configuracoes | null>(null);

    useEffect(() => {
        if (!id) return;
        const found = storage.getOrcamentoById(id);
        const cfg = storage.getConfiguracoes();
        if (found) {
            setOrcamento(found);
            setConfig(cfg);
            // Auto print after a short delay
            setTimeout(() => {
                window.print();
            }, 800);
        }
    }, [id]);

    if (!orcamento || !config) return <div className="p-8 text-center print:hidden">
        {id === "placeholder" ? "Selecione um orçamento para imprimir." : "Carregando..."}
    </div>;

    return <BudgetPDF orcamento={orcamento} config={config} />;
}
