"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Orcamento } from "@/lib/storage";
import { Truck, Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProps {
    data: Partial<Orcamento>;
    onUpdate: (data: Partial<Orcamento>) => void;
    next?: () => void;
    back?: () => void;
}

export default function StepEntrega({ data, onUpdate, next, back }: StepProps) {
    const [tipoEntrega, setTipoEntrega] = useState<'Entrega' | 'Retirada'>(data.entrega?.tipo || 'Entrega');
    const [date, setDate] = useState(data.entrega?.data || '');
    const [time, setTime] = useState(data.entrega?.horario || '');

    // Address fields
    const [cep, setCep] = useState(data.entrega?.endereco?.cep || '');
    const [rua, setRua] = useState(data.entrega?.endereco?.rua || '');
    const [numero, setNumero] = useState(data.entrega?.endereco?.numero || '');
    const [bairro, setBairro] = useState(data.entrega?.endereco?.bairro || '');
    const [cidade, setCidade] = useState(data.entrega?.endereco?.cidade || '');

    const [taxa, setTaxa] = useState(data.entrega?.taxa || 0);

    function handleNext() {
        if (!date || !time) return alert("Defina a data e horário.");
        if (tipoEntrega === 'Entrega' && !rua) return alert("Preencha o endereço de entrega.");

        onUpdate({
            entrega: {
                tipo: tipoEntrega,
                data: date,
                horario: time,
                taxa: taxa,
                endereco: tipoEntrega === 'Entrega' ? {
                    cep, rua, numero, bairro, cidade, estado: 'SP' // Mock state
                } : undefined
            }
        });
        next?.();
    }

    // Mock shipping calculation
    function calcFrete() {
        if (cep.length === 8) {
            // Mock logic
            setTaxa(15.00);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-xl font-semibold">Como será a entrega?</h2>
                <p className="text-text-secondary">Defina se será retirada ou entrega e a data.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => { setTipoEntrega('Retirada'); setTaxa(0); }}
                    className={cn(
                        "p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all",
                        tipoEntrega === 'Retirada'
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-surface hover:border-primary/50"
                    )}
                >
                    <Store size={32} />
                    <span className="font-semibold">Retirada no Local</span>
                </button>
                <button
                    onClick={() => setTipoEntrega('Entrega')}
                    className={cn(
                        "p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all",
                        tipoEntrega === 'Entrega'
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-surface hover:border-primary/50"
                    )}
                >
                    <Truck size={32} />
                    <span className="font-semibold">Entrega (Delivery)</span>
                </button>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Data da Entrega *" type="date" value={date} onChange={e => setDate(e.target.value)} />
                    <Input label="Horário *" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>

                {tipoEntrega === 'Entrega' && (
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="font-medium">Endereço de Entrega</h3>
                        <div className="flex gap-4 items-end">
                            <Input label="CEP" value={cep} onChange={e => setCep(e.target.value)} onBlur={calcFrete} maxLength={8} />
                            <div className="pb-3 text-sm font-medium text-text-secondary">
                                Taxa: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(taxa)}
                            </div>
                        </div>
                        <div className="grid grid-cols-[1fr_100px] gap-4">
                            <Input label="Rua" value={rua} onChange={e => setRua(e.target.value)} />
                            <Input label="Número" value={numero} onChange={e => setNumero(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} />
                            <Input label="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={back}>Voltar</Button>
                <Button onClick={handleNext}>Próximo: Decoração</Button>
            </div>
        </div>
    );
}
