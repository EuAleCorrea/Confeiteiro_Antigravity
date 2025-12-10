"use client";

import { Button } from "@/components/ui/Button";
import { Orcamento } from "@/lib/storage";
import { CheckCircle } from "lucide-react";

interface StepProps {
    data: Partial<Orcamento>;
    onUpdate: (data: Partial<Orcamento>) => void; // Unused but required by interface
    next?: () => void;
    back?: () => void;
    onFinish?: () => void;
}

export default function StepRevisao({ data, back, onFinish }: StepProps) {

    // Calculate final totals
    const totalItens = data.itens?.reduce((sum, i) => sum + i.subtotal, 0) || 0;
    const frete = data.entrega?.taxa || 0;
    const total = totalItens + frete;

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
                <Button onClick={onFinish} className="bg-success hover:bg-success-darker text-white">
                    Confirmar e Gerar Orçamento
                </Button>
            </div>
        </div>
    );
}
