"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Orcamento } from "@/lib/storage";

interface StepProps {
    data: Partial<Orcamento>;
    onUpdate: (data: Partial<Orcamento>) => void;
    next?: () => void;
    back?: () => void;
}

export default function StepDecoracao({ data, onUpdate, next, back }: StepProps) {
    const [descricao, setDescricao] = useState(data.decoracao?.descricao || '');
    const [observacoes, setObservacoes] = useState(data.decoracao?.observacoes || '');

    function handleNext() {
        onUpdate({
            decoracao: {
                descricao,
                observacoes,
                imagens: [] // Mock
            }
        });
        next?.();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-xl font-semibold">Detalhes da Decoração</h2>
                <p className="text-text-secondary">Descreva como o cliente quer o bolo.</p>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Descrição da Decoração</label>
                    <textarea
                        className="w-full min-h-[150px] p-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Ex: Bolo com tema fundo do mar, tons de azul e areia, topo com sereia..."
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Observações Internas</label>
                    <textarea
                        className="w-full min-h-[100px] p-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Ex: Cuidado com alergia a amendoim..."
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                    />
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg border border-border border-dashed text-center text-text-secondary">
                    <p>Upload de imagens de referência (Em breve)</p>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={back}>Voltar</Button>
                <Button onClick={handleNext}>Próximo: Entrega</Button>
            </div>
        </div>
    );
}

