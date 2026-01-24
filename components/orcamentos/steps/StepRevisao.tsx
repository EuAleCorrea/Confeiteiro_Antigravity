"use client";

import { Button } from "@/components/ui/Button";
import { Orcamento } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { generateQuotePDF } from "@/lib/pdf-generator";
import { CheckCircle, Download, Save } from "lucide-react";

interface StepProps {
    data: Partial<Orcamento>;
    onUpdate: (data: Partial<Orcamento>) => void;
    next?: () => void;
    back?: () => void;
}

export default function StepRevisao({ data, back, next }: StepProps) {

    // Calculate final totals
    const totalItens = data.itens?.reduce((sum, i) => sum + i.subtotal, 0) || 0;
    const frete = data.entrega?.taxa || 0;
    const total = totalItens + frete;

    const handleDownloadPDF = async () => {
        // Fetch count for number simulation (optional, or just use placeholder)
        let proximoNumero = 999;
        try {
            const all = await supabaseStorage.getOrcamentos();
            proximoNumero = (all.length || 0) + 1;
        } catch (e) {
            console.error(e);
        }

        // Create a temporary complete orcamento object for PDF generation
        const tempOrcamento: Orcamento = {
            id: crypto.randomUUID(),
            numero: proximoNumero,
            dataCriacao: data.dataCriacao || new Date().toISOString(),
            dataValidade: data.dataValidade || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            cliente: data.cliente!,
            ocasiao: data.ocasiao,
            itens: data.itens || [],
            entrega: data.entrega!,
            decoracao: data.decoracao!,
            termos: data.termos!,
            status: 'Pendente',
            valorTotal: total,
            historico: [],
            enviosWhatsApp: []
        };

        generateQuotePDF(tempOrcamento);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-4">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-xl font-semibold">Tudo pronto!</h2>
                <p className="text-text-secondary">Revise os dados antes de gerar o orçamento.</p>
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-neutral-50">
                    <h3 className="font-semibold text-lg">Resumo da Proposta</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm text-text-secondary">Cliente</p>
                        <p className="font-medium">{data.cliente?.nome}</p>
                        <p className="text-sm">{data.cliente?.telefone}</p>
                        {data.ocasiao && <p className="text-sm text-primary">📋 {data.ocasiao}</p>}
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-text-secondary">Itens do Pedido ({data.itens?.length})</p>
                        <ul className="space-y-2">
                            {data.itens?.map(item => (
                                <li key={item.id} className="flex justify-between text-sm border-b border-border/50 pb-2">
                                    <span>{item.quantidade}x {item.nome} {item.tamanho && `(${item.tamanho})`}</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-text-secondary">Entrega</p>
                        <div className="flex justify-between text-sm">
                            <span>Tipo: {data.entrega?.tipo}</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(frete)}</span>
                        </div>
                        <p className="text-sm text-text-secondary">{new Date(data.entrega?.data || '').toLocaleDateString()} às {data.entrega?.horario}</p>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between items-center">
                        <span className="font-bold text-lg">Total Final</span>
                        <span className="font-bold text-2xl text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-border">
                <h4 className="font-medium mb-2">Termos e Condições</h4>
                <p className="text-sm text-text-secondary line-clamp-3">
                    {data.termos?.pagamento}
                </p>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={back}>Voltar</Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download size={18} className="mr-2" /> Baixar PDF
                    </Button>
                    <Button onClick={next} className="bg-success hover:bg-success-darker text-white">
                        <Save size={18} className="mr-2" /> Salvar Orçamento
                    </Button>
                </div>
            </div>
        </div>
    );
}

