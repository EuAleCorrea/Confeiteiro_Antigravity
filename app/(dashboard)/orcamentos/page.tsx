"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, FileText, Send, Trash2, Check, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { storage, Orcamento, Pedido } from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrcamentosPage() {
    const router = useRouter();
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Todos");

    // Modal States
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
    const [sendModal, setSendModal] = useState<{ open: boolean; orcamento: Orcamento | null }>({ open: false, orcamento: null });
    const [approveModal, setApproveModal] = useState<{ open: boolean; orcamento: Orcamento | null }>({ open: false, orcamento: null });
    const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    useEffect(() => {
        loadOrcamentos();
    }, []);

    function loadOrcamentos() {
        setOrcamentos(storage.getOrcamentos());
    }

    function confirmDelete() {
        if (deleteModal.id) {
            storage.deleteOrcamento(deleteModal.id);
            loadOrcamentos();
            setDeleteModal({ open: false, id: null });
            setSuccessModal({ open: true, message: 'Orçamento excluído com sucesso!' });
        }
    }

    function confirmSend() {
        if (sendModal.orcamento) {
            const updated = { ...sendModal.orcamento, status: 'Enviado' as const };
            storage.saveOrcamento(updated);
            loadOrcamentos();
            setSendModal({ open: false, orcamento: null });
            setSuccessModal({ open: true, message: 'Orçamento marcado como Enviado!' });
        }
    }

    function confirmApprove() {
        if (!approveModal.orcamento) return;
        const orcamento = approveModal.orcamento;

        // 1. Update Orcamento
        const updatedOrcamento = { ...orcamento, status: 'Aprovado' as const };
        storage.saveOrcamento(updatedOrcamento);

        // 2. Create Pedido
        const novoPedido: Pedido = {
            id: crypto.randomUUID(),
            numero: 0,
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

        storage.savePedido(novoPedido);
        setApproveModal({ open: false, orcamento: null });

        // Show success and redirect
        router.push('/pedidos');
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
                <Link href="/orcamentos/novo">
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
                                        {orcamento.status === 'Pendente' && (
                                            <Button variant="ghost" size="icon" className="text-blue-600" title="Marcar como Enviado" onClick={() => setSendModal({ open: true, orcamento })}>
                                                <Send size={16} />
                                            </Button>
                                        )}
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

            {/* Send Confirmation Modal */}
            <Dialog
                isOpen={sendModal.open}
                onClose={() => setSendModal({ open: false, orcamento: null })}
                title="Enviar Orçamento"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Send size={32} className="text-blue-600" />
                    </div>
                    <p className="text-text-secondary">
                        Marcar orçamento <strong>#{sendModal.orcamento?.numero}</strong> como enviado ao cliente?
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setSendModal({ open: false, orcamento: null })} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={confirmSend} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                            Confirmar Envio
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
        </div>
    );
}
