"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, FileText, Send, Trash2, Check, AlertTriangle, CheckCircle, Smartphone, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Orcamento, Pedido } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import evolutionAPI, { loadEvolutionConfig } from "@/lib/evolution-api";
import { generateQuotePDFBase64 } from "@/lib/pdf-generator";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrcamentosPage() {
    const router = useRouter();
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Todos");

    // Modal States
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
    const [approveModal, setApproveModal] = useState<{ open: boolean; orcamento: Orcamento | null }>({ open: false, orcamento: null });
    const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    // WhatsApp States
    const [whatsappModal, setWhatsappModal] = useState(false);
    const [whatsappLoading, setWhatsappLoading] = useState(false);
    const [whatsappData, setWhatsappData] = useState({ phone: '', message: '' });
    const [selectedOrcamentoForWhatsapp, setSelectedOrcamentoForWhatsapp] = useState<Orcamento | null>(null);
    const [sendPdfAttachment, setSendPdfAttachment] = useState(true); // Toggle to send PDF
    const [resendConfirmModal, setResendConfirmModal] = useState<{ open: boolean; orcamento: Orcamento | null; previousSends: number; lastSendDate: string; lastSendType: string }>({ open: false, orcamento: null, previousSends: 0, lastSendDate: '', lastSendType: '' });

    useEffect(() => {
        loadOrcamentos();
    }, []);

    // Auto-close success modal after 3 seconds
    useEffect(() => {
        if (successModal.open) {
            const timer = setTimeout(() => {
                setSuccessModal({ open: false, message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successModal.open]);

    async function loadOrcamentos() {
        try {
            const data = await supabaseStorage.getOrcamentos();
            setOrcamentos(data as Orcamento[]);
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
        } finally {
            setLoading(false);
        }
    }

    async function confirmDelete() {
        if (deleteModal.id) {
            try {
                await supabaseStorage.deleteOrcamento(deleteModal.id);
                await loadOrcamentos();
                setDeleteModal({ open: false, id: null });
                setSuccessModal({ open: true, message: 'Orçamento excluído com sucesso!' });
            } catch (error) {
                console.error('Erro ao deletar orçamento:', error);
            }
        }
    }

    // New WhatsApp Send Logic
    function handleSendClick(orcamento: Orcamento) {
        console.log('[WhatsApp] handleSendClick called for:', orcamento.numero);

        // Check if already sent before
        const previousSends = orcamento.enviosWhatsApp?.length || 0;
        console.log('[WhatsApp] previousSends:', previousSends);

        if (previousSends > 0) {
            const lastSend = orcamento.enviosWhatsApp![previousSends - 1];
            const lastSendDate = new Date(lastSend.data).toLocaleString('pt-BR');

            // Show custom confirmation modal instead of window.confirm
            setResendConfirmModal({
                open: true,
                orcamento,
                previousSends,
                lastSendDate,
                lastSendType: lastSend.tipo
            });
            return;
        }

        // No previous sends - open WhatsApp modal directly
        openWhatsAppModal(orcamento);
    }

    // Function to actually open the WhatsApp modal
    function openWhatsAppModal(orcamento: Orcamento) {
        console.log('[WhatsApp] Opening modal...');
        setSelectedOrcamentoForWhatsapp(orcamento);

        // Format phone: remove non-digits and add 55 prefix if needed
        let phone = orcamento.cliente.telefone.replace(/\D/g, '');
        if (!phone.startsWith('55')) {
            phone = '55' + phone;
        }
        console.log('[WhatsApp] Formatted phone:', phone);

        setWhatsappData({
            phone: phone,
            message: `Olá ${orcamento.cliente.nome}, segue o seu orçamento #${orcamento.numero} no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.valorTotal)}.\n\nFicamos à disposição para quaisquer dúvidas!`
        });
        setSendPdfAttachment(true);
        setWhatsappModal(true);
        console.log('[WhatsApp] Modal should be open now');
    }

    // Handler for confirming re-send
    function confirmResend() {
        if (resendConfirmModal.orcamento) {
            openWhatsAppModal(resendConfirmModal.orcamento);
        }
        setResendConfirmModal({ open: false, orcamento: null, previousSends: 0, lastSendDate: '', lastSendType: '' });
    }

    const sendWhatsApp = async () => {
        console.log('[SendWhatsApp] Starting...');
        if (!selectedOrcamentoForWhatsapp) {
            console.log('[SendWhatsApp] No selected orcamento, aborting');
            return;
        }

        setWhatsappLoading(true);
        try {
            console.log('[SendWhatsApp] Loading config...');
            const config = loadEvolutionConfig();
            const instanceName = config?.instanceName;
            console.log('[SendWhatsApp] Config:', { instanceName, hasApiKey: !!config?.apiKey });

            if (!instanceName || !config?.apiKey) {
                setWhatsappModal(false);
                setErrorModal({ open: true, message: 'WhatsApp não configurado. Vá em Configurações > WhatsApp.' });
                setWhatsappLoading(false);
                return;
            }

            // 1. Validate number (skip confirmation dialog - proceed anyway)
            console.log('[SendWhatsApp] Validating number:', whatsappData.phone);
            try {
                const validation = await evolutionAPI.validateNumber(instanceName, whatsappData.phone);
                console.log('[SendWhatsApp] Validation result:', validation);
                // Don't block on validation - just log it
            } catch (valError) {
                console.warn('[SendWhatsApp] Validation failed, proceeding anyway:', valError);
            }

            // 2. Send PDF attachment first (if enabled)
            if (sendPdfAttachment) {
                console.log('[SendWhatsApp] Generating PDF...');
                try {
                    const pdfBase64 = generateQuotePDFBase64(selectedOrcamentoForWhatsapp);
                    console.log('[SendWhatsApp] PDF generated, length:', pdfBase64?.length);
                    const fileName = `Orcamento-${selectedOrcamentoForWhatsapp.numero}.pdf`;

                    console.log('[SendWhatsApp] Sending PDF document...');
                    await evolutionAPI.sendDocument(
                        instanceName,
                        whatsappData.phone,
                        pdfBase64,
                        fileName,
                        `📄 Orçamento #${selectedOrcamentoForWhatsapp.numero}`
                    );
                    console.log('[SendWhatsApp] PDF sent successfully');
                } catch (pdfError) {
                    console.error('[SendWhatsApp] PDF send error:', pdfError);
                    // Continue with text message even if PDF fails
                }
            }

            // 3. Send Text Message
            console.log('[SendWhatsApp] Sending text message...');
            const response = await evolutionAPI.sendTextMessage(instanceName, whatsappData.phone, whatsappData.message);
            console.log('[SendWhatsApp] Text message response:', response);

            if (response.status === 'PENDING' || response.status === 'SENT' || response.key) {
                // Determine send type
                const sendType = sendPdfAttachment ? 'PDF+Texto' : 'Texto';

                // Calculate next send number
                const existingEnvios = selectedOrcamentoForWhatsapp.enviosWhatsApp || [];
                const nextEnvioNum = existingEnvios.length + 1;

                // Create new envio record
                const newEnvio = {
                    numero: nextEnvioNum,
                    data: new Date().toISOString(),
                    tipo: sendType as 'PDF' | 'Texto' | 'PDF+Texto',
                    telefone: whatsappData.phone
                };

                // Update with history and enviosWhatsApp
                const updated = {
                    ...selectedOrcamentoForWhatsapp,
                    status: 'Enviado' as const,
                    historico: [...selectedOrcamentoForWhatsapp.historico, {
                        data: new Date().toISOString(),
                        acao: `Envio #${nextEnvioNum} via WhatsApp (${sendType})`,
                        usuario: 'Admin'
                    }],
                    enviosWhatsApp: [...existingEnvios, newEnvio]
                };

                await supabaseStorage.saveOrcamento(updated);
                await loadOrcamentos();

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
            setSelectedOrcamentoForWhatsapp(null);
        }
    };

    async function confirmApprove() {
        if (!approveModal.orcamento) return;
        const orcamento = approveModal.orcamento;

        try {
            // 1. Update Orcamento
            const updatedOrcamento = { ...orcamento, status: 'Aprovado' as const };
            await supabaseStorage.saveOrcamento(updatedOrcamento);

            // 2. Create Pedido
            const novoPedido: Partial<Pedido> = {
                orcamentoId: orcamento.id,
                cliente: orcamento.cliente,
                dataCriacao: new Date().toISOString(),
                dataEntrega: orcamento.entrega.data,
                horaEntrega: orcamento.entrega.horario,
                tipo: orcamento.entrega.tipo,
                itens: orcamento.itens,
                decoracao: {
                    descricao: orcamento.decoracao.descricao,
                    imagensReferencia: orcamento.decoracao.imagens,
                    observacoes: orcamento.decoracao.observacoes
                },
                entrega: {
                    tipo: orcamento.entrega.tipo,
                    endereco: orcamento.entrega.endereco,
                    taxaEntrega: orcamento.entrega.taxa,
                    distancia: orcamento.entrega.distancia,
                    instrucoes: orcamento.entrega.instrucoesRetirada
                },
                producao: {
                    checklist: [],
                    fotos: []
                },
                financeiro: {
                    valorTotal: orcamento.valorTotal,
                    valorPago: 0,
                    saldoPendente: orcamento.valorTotal,
                    formaPagamento: 'PIX',
                    statusPagamento: 'Pendente'
                },
                status: 'Pagamento Pendente',
                prioridade: 'Normal',
                historico: [{
                    data: new Date().toISOString(),
                    acao: `Gerado a partir do Orçamento #${orcamento.numero}`,
                    usuario: 'Sistema'
                }],
                atualizadoEm: new Date().toISOString()
            };

            await supabaseStorage.savePedido(novoPedido);
            setApproveModal({ open: false, orcamento: null });

            // Show success and redirect
            router.push('/pedidos');
        } catch (error) {
            console.error('Erro ao aprovar orçamento:', error);
        }
    }

    const filtered = orcamentos.filter(o => {
    const matchesSearch =
        o.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.numero.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "Todos" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
});

// Calculate Stats
const totalMes = filtered.length; // Mock: using total instead of month for simplicity
const pendentes = filtered.filter(o => o.status === 'Pendente').length;
const aprovados = filtered.filter(o => o.status === 'Aprovado' || o.status === 'Convertido').length;
const taxaConversao = totalMes > 0 ? Math.round((aprovados / totalMes) * 100) : 0;

function getStatusVariant(status: string) {
    switch (status) {
        case 'Aprovado': case 'Convertido': return 'success';
        case 'Pendente': return 'warning';
        case 'Recusado': case 'Expirado': return 'error';
        case 'Enviado': return 'info';
        default: return 'neutral';
    }
}

return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Orçamentos</h1>
                <p className="text-text-secondary">Gerencie suas propostas comerciais</p>
            </div>
            <Link href="/dashboard/orcamentos/novo">
                <Button>
                    <Plus size={20} className="mr-2" />
                    Novo Orçamento
                </Button>
            </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-text-secondary">Total (Geral)</p>
                    <p className="text-2xl font-bold">{totalMes}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-text-secondary">Pendentes</p>
                    <p className="text-2xl font-bold text-warning-darker">{pendentes}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-text-secondary">Aprovados</p>
                    <p className="text-2xl font-bold text-success-darker">{aprovados}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-text-secondary">Conversão</p>
                    <p className="text-2xl font-bold text-primary">{taxaConversao}%</p>
                </CardContent>
            </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-surface p-2 rounded-xl border border-border">
            <div className="flex items-center gap-2 flex-1 w-full">
                <Search size={20} className="text-text-secondary ml-2" />
                <input
                    type="text"
                    placeholder="Buscar por número ou cliente..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                {['Todos', 'Pendente', 'Enviado', 'Aprovado'].map(status => (
                    <Button
                        key={status}
                        variant={statusFilter === status ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className="rounded-full px-4"
                    >
                        {status}
                    </Button>
                ))}
            </div>
        </div>

        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="whitespace-nowrap"># Proposta</TableHead>
                    <TableHead className="whitespace-nowrap">Data</TableHead>
                    <TableHead className="whitespace-nowrap">Cliente</TableHead>
                    <TableHead className="whitespace-nowrap">Valor Total</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filtered.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-text-secondary">
                            Nenhum orçamento encontrado.
                        </TableCell>
                    </TableRow>
                ) : (
                    filtered.map((orcamento) => (
                        <TableRow key={orcamento.id}>
                            <TableCell className="font-medium">#{orcamento.numero}</TableCell>
                            <TableCell>{new Date(orcamento.dataCriacao).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{orcamento.cliente.nome}</span>
                                    <span className="text-xs text-text-secondary">{orcamento.cliente.telefone}</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-bold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.valorTotal)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(orcamento.status) as any}>
                                    {orcamento.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="text-blue-600" title="Enviar WhatsApp" onClick={() => handleSendClick(orcamento)}>
                                        <Send size={16} />
                                    </Button>

                                    {orcamento.status === 'Enviado' && (
                                        <Button variant="ghost" size="icon" className="text-green-600" title="Aprovar e Gerar Pedido" onClick={() => setApproveModal({ open: true, orcamento })}>
                                            <Check size={16} />
                                        </Button>
                                    )}

                                    <Link href={`/orcamentos/${orcamento.id}`}>
                                        <Button variant="ghost" size="icon" title="Ver Detalhes">
                                            <FileText size={16} />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="text-error" onClick={() => setDeleteModal({ open: true, id: orcamento.id })}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>

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
                        id="sendPdf"
                        checked={sendPdfAttachment}
                        onChange={e => setSendPdfAttachment(e.target.checked)}
                        disabled={whatsappLoading}
                        className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="sendPdf" className="flex items-center gap-2 text-sm cursor-pointer">
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
            isOpen={deleteModal.open}
            onClose={() => setDeleteModal({ open: false, id: null })}
            title="Excluir Orçamento"
            className="max-w-sm"
        >
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} className="text-error" />
                </div>
                <p className="text-text-secondary">Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null })} className="flex-1">
                        Cancelar
                    </Button>
                    <Button onClick={confirmDelete} className="flex-1 bg-error hover:bg-error/90 text-white">
                        Excluir
                    </Button>
                </div>
            </div>
        </Dialog>

        {/* Approve Confirmation Modal */}
        <Dialog
            isOpen={approveModal.open}
            onClose={() => setApproveModal({ open: false, orcamento: null })}
            title="Aprovar Orçamento"
            className="max-w-md"
        >
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-success" />
                </div>
                <div className="space-y-2">
                    <p className="font-medium">Aprovar orçamento e gerar pedido?</p>
                    <p className="text-sm text-text-secondary">
                        Orçamento <strong>#{approveModal.orcamento?.numero}</strong> para <strong>{approveModal.orcamento?.cliente.nome}</strong>
                    </p>
                    <p className="text-sm text-text-secondary">
                        Valor: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(approveModal.orcamento?.valorTotal || 0)}</strong>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setApproveModal({ open: false, orcamento: null })} className="flex-1">
                        Cancelar
                    </Button>
                    <Button onClick={confirmApprove} className="flex-1 bg-success hover:bg-success-darker text-white">
                        Aprovar e Gerar Pedido
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
            onClose={() => setResendConfirmModal({ open: false, orcamento: null, previousSends: 0, lastSendDate: '', lastSendType: '' })}
            title="Reenviar Orçamento"
            className="max-w-sm"
        >
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Send size={32} className="text-orange-600" />
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
                        onClick={() => setResendConfirmModal({ open: false, orcamento: null, previousSends: 0, lastSendDate: '', lastSendType: '' })}
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

