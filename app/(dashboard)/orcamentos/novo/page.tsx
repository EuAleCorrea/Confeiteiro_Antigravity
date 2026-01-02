"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "@/components/ui/Wizard";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { storage, Orcamento } from "@/lib/storage";
import { User, Package, Truck, Palette, FileText, AlertTriangle } from "lucide-react";

// Steps Components (Placeholders for now)
import StepCliente from "@/components/orcamentos/steps/StepCliente";
import StepItens from "@/components/orcamentos/steps/StepItens";
import StepEntrega from "@/components/orcamentos/steps/StepEntrega";
import StepDecoracao from "@/components/orcamentos/steps/StepDecoracao";
import StepRevisao from "@/components/orcamentos/steps/StepRevisao";

export default function NovoOrcamentoPage() {
    const router = useRouter();

    const defaultTermos = { pagamento: '', cancelamento: '', transporte: '', cuidados: '', importante: '' };
    const configTermos = storage.getConfiguracoes()?.termos;

    // Central State for the Wizard
    const [orcamento, setOrcamento] = useState<Partial<Orcamento>>({
        id: crypto.randomUUID(),
        itens: [],
        status: 'Pendente',
        dataCriacao: new Date().toISOString(),
        dataValidade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        decoracao: { descricao: '', imagens: [] },
        termos: configTermos ? { ...defaultTermos, ...configTermos } : defaultTermos,
        valorTotal: 0
    });
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    const updateOrcamento = (data: Partial<Orcamento>) => {
        setOrcamento(prev => ({ ...prev, ...data }));
    };

    const calculateTotal = (current: Partial<Orcamento>) => {
        const itensTotal = current.itens?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
        const frete = current.entrega?.taxa || 0;
        return itensTotal + frete;
    };

    const handleFinish = () => {
        if (!orcamento.cliente || !orcamento.itens?.length) {
            setErrorModal({ open: true, message: 'Preencha os dados obrigatórios.' });
            return;
        }

        // Final validations and save
        const finalOrcamento = {
            ...orcamento,
            valorTotal: calculateTotal(orcamento),
            historico: [
                { data: new Date().toISOString(), acao: 'Orçamento Criado', usuario: 'Admin' }
            ]
        } as Orcamento;

        storage.saveOrcamento(finalOrcamento);
        router.push('/orcamentos');
    };

    const steps = [
        {
            id: 'cliente',
            label: 'Cliente',
            icon: <User />,
            component: <StepCliente data={orcamento} onUpdate={updateOrcamento} />
        },
        {
            id: 'itens',
            label: 'Itens',
            icon: <Package />,
            component: <StepItens data={orcamento} onUpdate={updateOrcamento} />
        },
        {
            id: 'decoracao',
            label: 'Decoração',
            icon: <Palette />,
            component: <StepDecoracao data={orcamento} onUpdate={updateOrcamento} />
        },
        {
            id: 'revisao',
            label: 'Revisão',
            icon: <FileText />,
            component: <StepRevisao data={orcamento} onUpdate={updateOrcamento} onFinish={handleFinish} />
        },
        {
            id: 'entrega',
            label: 'Entrega',
            icon: <Truck />,
            component: <StepEntrega data={orcamento} onUpdate={updateOrcamento} />
        }
    ];

    return (
        <div className="max-w-5xl mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Novo Orçamento</h1>
                <p className="text-text-secondary">Preencha as informações para gerar a proposta</p>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-border p-6 min-h-[600px]">
                <Wizard
                    steps={steps}
                    onComplete={handleFinish}
                    onCancel={() => router.push('/orcamentos')}
                />
            </div>

            {/* Error Modal */}
            <Dialog
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Atenção"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={32} className="text-error" />
                    </div>
                    <p className="text-text-primary font-medium">{errorModal.message}</p>
                    <Button onClick={() => setErrorModal({ open: false, message: '' })} className="w-full">
                        OK
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
