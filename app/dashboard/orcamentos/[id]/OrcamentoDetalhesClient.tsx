"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Share2, Copy, FileCheck, Trash2, Calendar, MapPin, DollarSign, AlertTriangle, CheckCircle, Smartphone, Send, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Orcamento } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import evolutionAPI, { loadEvolutionConfig } from "@/lib/evolution-api";
import { generateQuotePDFBase64 } from "@/lib/pdf-generator";
import Link from "next/link";

export default function OrcamentoDetalhesClient() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
    const [activeTab, setActiveTab] = useState<'resumo' | 'terms' | 'historico'>('resumo');

    // Modal States
    const [deleteModal, setDeleteModal] = useState(false);
    const [convertModal, setConvertModal] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState(false);
    const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    // WhatsApp States
    const [whatsappModal, setWhatsappModal] = useState(false);
    const [whatsappLoading, setWhatsappLoading] = useState(false);
    const [whatsappData, setWhatsappData] = useState({ phone: '', message: '' });
    const [sendPdfAttachment, setSendPdfAttachment] = useState(true);
    const [resendConfirmModal, setResendConfirmModal] = useState<{ open: boolean; previousSends: number; lastSendDate: string; lastSendType: string }>({ open: false, previousSends: 0, lastSendDate: '', lastSendType: '' });

    useEffect(() => {
        if (!id) return;
        async function loadData() {
            const found = await supabaseStorage.getOrcamento(id);
            if (!found) {
                if (id !== "placeholder") {
                    // Handle not found gracefully
                }
            } else {
                setOrcamento(found as Orcamento);
                // Pre-fill WhatsApp data
                let phone = found.cliente.telefone.replace(/\D/g, '');
                if (!phone.startsWith('55')) {
                    phone = '55' + phone;
                }
                setWhatsappData({
                    phone: phone,
                    message: `Olá ${found.cliente.nome}, segue o seu orçamento #${found.numero} no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(found.valorTotal)}.\n\nFicamos à disposição para quaisquer dúvidas!`
                });
            }
        }
        loadData();
    }, [id, router]);

    // Auto-close success modal after 3 seconds
    useEffect(() => {
        if (successModal.open) {
            const timer = setTimeout(() => {
                setSuccessModal({ open: false, message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successModal.open]);

    const confirmDelete = async () => {
        await supabaseStorage.deleteOrcamento(id);
        setDeleteModal(false);
        router.push('/dashboard/orcamentos');
    };

    const confirmConvert = async () => {
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
        await supabaseStorage.saveOrcamento(updated);
        setOrcamento(updated);
        setConvertModal(false);
        setSuccessModal({ open: true, message: 'Orçamento convertido em pedido com sucesso!' });
    };

    const confirmDuplicate = async () => {
        if (!orcamento) return;
        const newOrcamento = {
            ...orcamento,
            id: undefined,
            numero: undefined,
            status: 'Pendente' as const,
            dataCriacao: new Date().toISOString(),
            historico: [{ data: new Date().toISOString(), acao: 'Orçamento Duplicado', usuario: 'Admin' }]
        };
        await supabaseStorage.saveOrcamento(newOrcamento);
        setDuplicateModal(false);
        setSuccessModal({ open: true, message: 'Orçamento duplicado com sucesso!' });
        setTimeout(() => router.push('/dashboard/orcamentos'), 1500);
    };

    const handlePrint = () => {
        window.open(`/print/orcamento/${id}`, '_blank');
    };

    const handleWhatsAppClick = () => {
        if (!orcamento) return;

        // Check if already sent before
        const previousSends = orcamento.enviosWhatsApp?.length || 0;

        if (previousSends > 0) {
            const lastSend = orcamento.enviosWhatsApp![previousSends - 1];
            const lastSendDate = new Date(lastSend.data).toLocaleString('pt-BR');

            // Show custom confirmation modal
            setResendConfirmModal({
                open: true,
                previousSends,
                lastSendDate,
                lastSendType: lastSend.tipo
            });
            return;
        }

        openWhatsAppModal();
    };

    const openWhatsAppModal = () => {
        setSendPdfAttachment(true);
        setWhatsappModal(true);
    };

    const confirmResend = () => {
        setResendConfirmModal({ open: false, previousSends: 0, lastSendDate: '', lastSendType: '' });
        openWhatsAppModal();
    };

    const sendWhatsApp = async () => {
        if (!orcamento) return;
        setWhatsappLoading(true);
        try {
            const config = loadEvolutionConfig();
            const instanceName = config?.instanceName;

            if (!instanceName || !config?.apiKey) {
                setWhatsappModal(false);
                setErrorModal({ open: true, message: 'WhatsApp não configurado. Vá em Configurações > WhatsApp.' });
                setWhatsappLoading(false);
                return;
            }

            // 1. Validate number
            const validation = await evolutionAPI.validateNumber(instanceName, whatsappData.phone);

            if (!validation.exists) {
                // Proceed anyway - just log a warning
                console.warn('[SendWhatsApp] Number not found on WhatsApp, proceeding anyway');
            }

            // 2. Send PDF attachment first (if enabled)
            if (sendPdfAttachment) {
                try {
                    const pdfBase64 = generateQuotePDFBase64(orcamento);
                    const fileName = `Orcamento-${orcamento.numero}.pdf`;

                    await evolutionAPI.sendDocument(
                        instanceName,
                        whatsappData.phone,
                        pdfBase64,
                        fileName,
                        `📄 Orçamento #${orcamento.numero}`
                    );
                } catch (pdfError) {
                    console.error('Erro ao enviar PDF:', pdfError);
                    // Continue with text message even if PDF fails
                }
            }

            // 3. Send Text Message
            const response = await evolutionAPI.sendTextMessage(instanceName, whatsappData.phone, whatsappData.message);

            if (response.status === 'PENDING' || response.status === 'SENT' || response.key) {
                // Determine send type
                const sendType = sendPdfAttachment ? 'PDF+Texto' : 'Texto';

                // Calculate next send number
                const existingEnvios = orcamento.enviosWhatsApp || [];
                const nextEnvioNum = existingEnvios.length + 1;

                // Create new envio record
                const newEnvio = {
                    numero: nextEnvioNum,
                    data: new Date().toISOString(),
                    tipo: sendType as 'PDF' | 'Texto' | 'PDF+Texto',
                    telefone: whatsappData.phone
                };

                // Add to both history and enviosWhatsApp
                const updated = {
                    ...orcamento,
                    status: 'Enviado' as const,
                    historico: [...orcamento.historico, {
                        data: new Date().toISOString(),
                        acao: `Envio #${nextEnvioNum} via WhatsApp (${sendType})`,
                        usuario: 'Admin'
                    }],
                    enviosWhatsApp: [...existingEnvios, newEnvio]
                };

                await supabaseStorage.saveOrcamento(updated);
                setOrcamento(updated);

                // Close modal and show success
                setWhatsappModal(false);
                setWhatsappLoading(false);
                setSuccessModal({
                    open: true,
                    message: `Orçamento enviado com sucesso!\n\nEnvio #${nextEnvioNum} - ${sendType}`
                });
            } else {
                setWhatsappModal(false);
                setErrorModal({ open: true, message: 'Erro ao enviar mensagem. Verifique a conexão do WhatsApp.' });
            }

        } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
            setWhatsappModal(false);
            setErrorModal({ open: true, message: 'Erro ao enviar mensagem. Verifique se a instância está conectada.' });
        } finally {
            setWhatsappLoading(false);
        }
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
                    <Link href="/dashboard/orcamentos">
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
                    <Button variant="outline" size="sm" onClick={handleWhatsAppClick} title="Enviar WhatsApp">
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
                    className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === 'terms' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    onClick={() => setActiveTab('terms')}
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

                {activeTab === 'terms' && (
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

            {/* WhatsApp Modal */}
            <Dialog
                isOpen={whatsappModal}
                onClose={() => !whatsappLoading && setWhatsappModal(false)}
                title="Enviar Orçamento via WhatsApp"
                className="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Número do WhatsApp</label>
                        <div className="flex gap-2">
                            <div className="flex items-center justify-center w-10 bg-neutral-100 rounded-md border border-input text-text-secondary">
                                <Smartphone size={18} />
                            </div>
                            <Input
                                value={whatsappData.phone}
                                onChange={e => setWhatsappData({ ...whatsappData, phone: e.target.value })}
                                placeholder="5511999999999"
                                disabled={whatsappLoading}
                            />
                        </div>
                        <p className="text-xs text-text-secondary mt-1">Dica: Use 55 + DDD + Número</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Mensagem</label>
                        <textarea
                            className="w-full min-h-[120px] p-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            value={whatsappData.message}
                            onChange={e => setWhatsappData({ ...whatsappData, message: e.target.value })}
                            disabled={whatsappLoading}
                        />
                    </div>

                    {/* PDF Attachment Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <input
                            type="checkbox"
                            id="sendPdfDetails"
                            checked={sendPdfAttachment}
                            onChange={e => setSendPdfAttachment(e.target.checked)}
                            disabled={whatsappLoading}
                            className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="sendPdfDetails" className="flex items-center gap-2 text-sm cursor-pointer">
                            <Paperclip size={16} className="text-text-secondary" />
                            <span>Anexar PDF do Orçamento</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setWhatsappModal(false)} className="flex-1" disabled={whatsappLoading}>
                            Cancelar
                        </Button>
                        <Button onClick={sendWhatsApp} className="flex-1 bg-success hover:bg-success-darker text-white" disabled={whatsappLoading}>
                            {whatsappLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                            {sendPdfAttachment ? 'Enviar com PDF' : 'Enviar Mensagem'}
                        </Button>
                    </div>
                </div>
            </Dialog>

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

            {/* Resend Confirmation Modal */}
            <Dialog
                isOpen={resendConfirmModal.open}
                onClose={() => setResendConfirmModal({ open: false, previousSends: 0, lastSendDate: '', lastSendType: '' })}
                title="Reenviar Orçamento"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <Share2 size={32} className="text-orange-600" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium">Este orçamento já foi enviado!</p>
                        <p className="text-sm text-text-secondary">
                            Enviado <strong>{resendConfirmModal.previousSends} vez(es)</strong>
                        </p>
                        <p className="text-sm text-text-secondary">
                            Último envio: <strong>{resendConfirmModal.lastSendDate}</strong>
                        </p>
                        <p className="text-sm text-text-secondary">
                            Tipo: <strong>{resendConfirmModal.lastSendType}</strong>
                        </p>
                    </div>
                    <p className="text-sm text-text-secondary font-medium">
                        Deseja enviar novamente?
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setResendConfirmModal({ open: false, previousSends: 0, lastSendDate: '', lastSendType: '' })}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmResend}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            Sim, Reenviar
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
