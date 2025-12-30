"use client";

import { Suspense } from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { CheckCircle } from "lucide-react";
import { storage, Configuracoes } from "@/lib/storage";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";
import { GoogleSettings } from "@/components/settings/GoogleSettings";
import { SessionProvider } from "next-auth/react";

import { useSearchParams } from "next/navigation";


function ConfiguracoesContent() {
    const [config, setConfig] = useState<Configuracoes>(storage.getConfiguracoes());
    const [activeTab, setActiveTab] = useState<'Empresa' | 'Negócio' | 'Termos' | 'WhatsApp' | 'Google'>('Empresa');
    const [successModal, setSuccessModal] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        // Load config on mount
        setConfig(storage.getConfiguracoes());

        // Check for tab param
        const tabParam = searchParams.get('tab');
        if (tabParam === 'WhatsApp') {
            setActiveTab('WhatsApp');
        } else if (tabParam === 'Google') {
            setActiveTab('Google');
        }
    }, [searchParams]);

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        storage.saveConfiguracoes(config);
        setSuccessModal(true);
    }

    function handleBusinessChange(field: string, value: any) {
        setConfig(prev => ({
            ...prev,
            negocio: { ...prev.negocio, [field]: value }
        }));
    }

    function handleTaxaChange(field: string, value: any) {
        setConfig(prev => ({
            ...prev,
            negocio: {
                ...prev.negocio,
                taxaEntrega: { ...prev.negocio.taxaEntrega, [field]: value }
            }
        }));
    }

    function handleTermosChange(field: string, value: any) {
        setConfig(prev => ({
            ...prev,
            termos: { ...prev.termos, [field]: value }
        }));
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
                    <p className="text-text-secondary">Definições gerais da empresa e do sistema</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 space-y-1">
                    {['Empresa', 'Negócio', 'Termos', 'WhatsApp', 'Google'].map((tab) => (
                        <button
                            key={tab}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === tab
                                ? "bg-primary text-white shadow-md"
                                : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary"
                                }`}
                            onClick={() => setActiveTab(tab as any)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={handleSave} className="space-y-6">

                                {activeTab === 'Empresa' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h2 className="text-lg font-semibold border-b border-border pb-2">Dados da Empresa</h2>
                                        <Input
                                            label="Nome da Confeitaria *"
                                            value={config.empresa.nome}
                                            onChange={e => setConfig({ ...config, empresa: { ...config.empresa, nome: e.target.value } })}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="CNPJ"
                                                value={config.empresa.cnpj}
                                                onChange={e => setConfig({ ...config, empresa: { ...config.empresa, cnpj: e.target.value } })}
                                            />
                                            <Input
                                                label="Telefone"
                                                value={config.empresa.telefone}
                                                onChange={e => setConfig({ ...config, empresa: { ...config.empresa, telefone: e.target.value } })}
                                            />
                                            <Input
                                                label="E-mail"
                                                value={config.empresa.email}
                                                onChange={e => setConfig({ ...config, empresa: { ...config.empresa, email: e.target.value } })}
                                            />
                                        </div>
                                        <Input
                                            label="Endereço Completo"
                                            value={config.empresa.endereco}
                                            onChange={e => setConfig({ ...config, empresa: { ...config.empresa, endereco: e.target.value } })}
                                        />
                                    </div>
                                )}

                                {activeTab === 'Negócio' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h2 className="text-lg font-semibold border-b border-border pb-2">Regras de Negócio</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Prazo Mínimo (dias)"
                                                type="number"
                                                value={config.negocio.prazoMinimoPedidos}
                                                onChange={e => handleBusinessChange('prazoMinimoPedidos', Number(e.target.value))}
                                            />
                                            <Input
                                                label="Prazo Cancelamento (dias)"
                                                type="number"
                                                value={config.negocio.prazoCancelamento}
                                                onChange={e => handleBusinessChange('prazoCancelamento', Number(e.target.value))}
                                            />
                                        </div>

                                        <h3 className="text-sm font-semibold pt-4">Taxa de Entrega</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Input
                                                label="Valor Fixo Até X km (R$)"
                                                type="number"
                                                value={config.negocio.taxaEntrega.valorFixo}
                                                onChange={e => handleTaxaChange('valorFixo', Number(e.target.value))}
                                            />
                                            <Input
                                                label="Distância Fixa (km)"
                                                type="number"
                                                value={config.negocio.taxaEntrega.distanciaMaximaFixa}
                                                onChange={e => handleTaxaChange('distanciaMaximaFixa', Number(e.target.value))}
                                            />
                                            <Input
                                                label="Valor por Km Adicional (R$)"
                                                type="number"
                                                value={config.negocio.taxaEntrega.valorPorKm}
                                                onChange={e => handleTaxaChange('valorPorKm', Number(e.target.value))}
                                            />
                                        </div>
                                        <Input
                                            label="Raio Máximo de Entrega (km)"
                                            type="number"
                                            value={config.negocio.raioMaximoEntrega}
                                            onChange={e => handleBusinessChange('raioMaximoEntrega', Number(e.target.value))}
                                        />
                                    </div>
                                )}


                                {activeTab === 'Termos' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h2 className="text-lg font-semibold border-b border-border pb-2">Termos e Políticas</h2>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-secondary">Política de Pagamento</label>
                                            <textarea
                                                className="flex min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                                value={config.termos.pagamento}
                                                onChange={e => handleTermosChange('pagamento', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-text-secondary">Cuidados com o Produto</label>
                                            <textarea
                                                className="flex min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                                value={config.termos.cuidados}
                                                onChange={e => handleTermosChange('cuidados', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'WhatsApp' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <WhatsAppSettings />
                                    </div>
                                )}

                                {activeTab === 'Google' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <SessionProvider>
                                            <GoogleSettings />
                                        </SessionProvider>
                                    </div>
                                )}


                                {activeTab !== 'WhatsApp' && activeTab !== 'Google' && (
                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" size="lg">Salvar Configurações</Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Success Modal */}
            <Dialog
                isOpen={successModal}
                onClose={() => setSuccessModal(false)}
                title="Sucesso"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} className="text-success" />
                    </div>
                    <p className="text-text-primary font-medium">Configurações salvas com sucesso!</p>
                    <Button onClick={() => setSuccessModal(false)} className="w-full">
                        OK
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}

export default function ConfiguracoesPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Carregando configurações...</div>}>
            <ConfiguracoesContent />
        </Suspense>
    );
}
