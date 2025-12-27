"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Share2, Copy, FileCheck, Trash2, Calendar, MapPin, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { storage, Orcamento } from "@/lib/storage";
import Link from "next/link";

export default function OrcamentoDetalhesClient() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
    const [activeTab, setActiveTab] = useState<'resumo' | 'termos' | 'historico'>('resumo');

    // Modal States
    const [deleteModal, setDeleteModal] = useState(false);
    const [convertModal, setConvertModal] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState(false);
    const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    useEffect(() => {
        if (!id) return;
        const found = storage.getOrcamentoById(id);
        if (!found) {
            if (id !== "placeholder") {
                // Handle not found gracefully
            }
        } else {
            setOrcamento(found);
        }
    }, [id, router]);

    const confirmDelete = () => {
        storage.deleteOrcamento(id);
        setDeleteModal(false);
        router.push('/orcamentos');
    };

    const confirmConvert = () => {
        if (!orcamento) return;
        const updated = {
            ...orcamento,
            status: 'Convertido' as const,
            historico: [...orcamento.historico, {
                data: new Date().toISOString(),
                acao: 'Convertido em Pedido',
                usuario: 'Admin'
            }]
        };
        storage.saveOrcamento(updated);
        setOrcamento(updated);
        setConvertModal(false);
        setSuccessModal({ open: true, message: 'Orçamento convertido em pedido com sucesso!' });
    };

    const confirmDuplicate = () => {
        if (!orcamento) return;
        const newOrcamento = {
            ...orcamento,
            id: crypto.randomUUID(),
            numero: 0,
            status: 'Pendente' as const,
            dataCriacao: new Date().toISOString(),
            historico: [{ data: new Date().toISOString(), acao: 'Orçamento Duplicado', usuario: 'Admin' }]
        };
        storage.saveOrcamento(newOrcamento);
        setDuplicateModal(false);
        setSuccessModal({ open: true, message: 'Orçamento duplicado com sucesso!' });
        setTimeout(() => router.push('/orcamentos'), 1500);
    };

    const handlePrint = () => {
        window.open(`/print/orcamento/${id}`, '_blank');
    };

    const handleWhatsApp = () => {
        if (!orcamento) return;
        const phone = orcamento.cliente.telefone.replace(/\D/g, '');
        const text = encodeURIComponent(`Olá ${orcamento.cliente.nome}! Segue seu orçamento #${orcamento.numero}.`);
        window.open(`https://wa.me/55${phone}?text=${text}`, '_blank');
    };

    if (!orcamento) {
        return (
            <div className="p-8 text-center text-text-secondary">
                {id === "placeholder" ? "Acesse um orçamento da lista para ver os detalhes." : "Carregando..."}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Link href="/orcamentos">
                        <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Orçamento #{orcamento.numero}
                            <Badge variant={orcamento.status === 'Convertido' ? 'success' : 'warning'}>{orcamento.status}</Badge>
                        </h1>
                        <p className="text-text-secondary">Criado em {new Date(orcamento.dataCriacao).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint} title="Imprimir/PDF">
                        <Printer size={16} className="mr-2" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleWhatsApp} title="Enviar WhatsApp">
                        <Share2 size={16} className="mr-2" /> WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDuplicateModal(true)} title="Duplicar">
                        <Copy size={16} className="mr-2" /> Duplicar
                    </Button>
                    {orcamento.status !== 'Convertido' && (
                        <Button variant="primary" size="sm" onClick={() => setConvertModal(true)} className="bg-success text-white">
                            <FileCheck size={16} className="mr-2" /> Converter em Pedido
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-error" onClick={() => setDeleteModal(true)} title="Excluir">
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border flex gap-6">
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === 'resumo' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    onClick={() => setActiveTab('resumo')}
                >
                    Resumo & Itens
                </button>
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === 'termos' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    onClick={() => setActiveTab('termos')}
                >
                    Termos & Condições
                </button>
                <button
                    className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === 'historico' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    onClick={() => setActiveTab('historico')}
                >
                    Histórico
                </button>
            </div>

            {/* Content */}
            <div className="bg-surface rounded-xl border border-border min-h-[400px]">
                {activeTab === 'resumo' && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Client & Items */}
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <DollarSign size={18} className="text-primary" /> Dados do Cliente
                                </h3>
                                <div className="bg-neutral-50 p-4 rounded-lg">
                                    <p className="font-bold">{orcamento.cliente.nome}</p>
                                    <p className="text-text-secondary">{orcamento.cliente.telefone}</p>
                                    {orcamento.cliente.email && <p className="text-text-secondary">{orcamento.cliente.email}</p>}
                                </div>
                            </section>

                            <section>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Copy size={18} className="text-primary" /> Itens do Pedido ({orcamento.itens.length})
                                </h3>
                                <div className="space-y-3">
                                    {orcamento.itens.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start border-b border-border/50 pb-3 last:border-0">
                                            <div>
                                                <p className="font-medium">{item.quantidade}x {item.nome}</p>
                                                <p className="text-sm text-text-secondary">
                                                    {item.tamanho ? `${item.tamanho} - ` : ''}
                                                    {item.saborMassa ? `Massa: ${item.saborMassa}` : ''}
                                                    {item.saborRecheio ? `, Rech: ${item.saborRecheio}` : ''}
                                                </p>
                                            </div>
                                            <p className="font-semibold">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="font-semibold text-lg mb-4">Decoração</h3>
                                <div className="bg-neutral-50 p-4 rounded-lg text-sm whitespace-pre-line">
                                    {orcamento.decoracao.descricao || "Nenhuma descrição informada."}
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Delivery & Totals */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Calendar size={18} /> Entrega / Retirada
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <p><span className="text-text-secondary">Tipo:</span> {orcamento.entrega.tipo}</p>
                                    <p><span className="text-text-secondary">Data:</span> {new Date(orcamento.entrega.data).toLocaleDateString()}</p>
                                    <p><span className="text-text-secondary">Horário:</span> {orcamento.entrega.horario}</p>
                                    {orcamento.entrega.endereco && (
                                        <div className="mt-2 pt-2 border-t border-border">
                                            <p className="font-medium flex items-center gap-1"><MapPin size={14} /> Endereço:</p>
                                            <p className="text-text-secondary">
                                                {orcamento.entrega.endereco.rua}, {orcamento.entrega.endereco.numero}<br />
                                                {orcamento.entrega.endereco.bairro}, {orcamento.entrega.endereco.cidade}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-primary">Totalizador</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Subtotal Itens</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.itens.reduce((acc, i) => acc + i.subtotal, 0))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Taxa de Entrega</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.entrega.taxa)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-primary/20 flex justify-between items-center">
                                        <span className="font-bold text-lg">TOTAL</span>
                                        <span className="font-bold text-xl text-primary">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.valorTotal)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'termos' && (
                    <div className="p-8 space-y-6">
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-semibold">Formas de Pagamento</h3>
                            <p className="mb-4 whitespace-pre-line">{orcamento.termos.pagamento}</p>

                            <h3 className="text-lg font-semibold">Política de Cancelamento</h3>
                            <p className="mb-4 whitespace-pre-line">{orcamento.termos.cancelamento}</p>

                            <h3 className="text-lg font-semibold">Transporte</h3>
                            <p className="mb-4 whitespace-pre-line">{orcamento.termos.transporte}</p>

                            <h3 className="text-lg font-semibold">Cuidados com o Produto</h3>
                            <p className="mb-4 whitespace-pre-line">{orcamento.termos.cuidados}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'historico' && (
                    <div className="p-6">
                        <div className="space-y-4">
                            {orcamento.historico.map((log, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{log.acao}</p>
                                        <p className="text-sm text-text-secondary">
                                            {new Date(log.data).toLocaleString()} por {log.usuario}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                title="Excluir Orçamento"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={32} className="text-error" />
                    </div>
                    <p className="text-text-secondary">Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.</p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setDeleteModal(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={confirmDelete} className="flex-1 bg-error hover:bg-error/90 text-white">
                            Excluir
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Convert to Order Modal */}
            <Dialog
                isOpen={convertModal}
                onClose={() => setConvertModal(false)}
                title="Converter em Pedido"
                className="max-w-md"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <FileCheck size={32} className="text-success" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium">Confirmar conversão em PEDIDO?</p>
                        <p className="text-sm text-text-secondary">Isso irá reservar a data na agenda e criar um novo pedido.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setConvertModal(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={confirmConvert} className="flex-1 bg-success hover:bg-success-darker text-white">
                            Converter em Pedido
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Duplicate Modal */}
            <Dialog
                isOpen={duplicateModal}
                onClose={() => setDuplicateModal(false)}
                title="Duplicar Orçamento"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Copy size={32} className="text-purple-600" />
                    </div>
                    <p className="text-text-secondary">Criar uma cópia deste orçamento?</p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setDuplicateModal(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={confirmDuplicate} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                            Duplicar
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Success Modal */}
            <Dialog
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ open: false, message: '' })}
                title="Sucesso"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} className="text-success" />
                    </div>
                    <p className="text-text-primary font-medium">{successModal.message}</p>
                    <Button onClick={() => setSuccessModal({ open: false, message: '' })} className="w-full">
                        OK
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
