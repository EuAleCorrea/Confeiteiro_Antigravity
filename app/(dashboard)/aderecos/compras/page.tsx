"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ShoppingCart, Package, AlertTriangle, CheckCircle, Clock, Truck, Eye, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { storage, CompraAderecos, Adereco, Fornecedor, ItemCompraAdereco } from "@/lib/storage";

type StatusCompra = 'Pendente' | 'Recebido' | 'Pago';

const statusConfig: Record<StatusCompra, { color: string; icon: React.ElementType }> = {
    'Pendente': { color: 'warning', icon: Clock },
    'Recebido': { color: 'info', icon: Package },
    'Pago': { color: 'success', icon: CheckCircle },
};

export default function ComprasAderecosPage() {
    const [compras, setCompras] = useState<CompraAderecos[]>([]);
    const [aderecos, setAderecos] = useState<Adereco[]>([]);
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingCompra, setViewingCompra] = useState<CompraAderecos | null>(null);
    const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    // Form state
    const [formData, setFormData] = useState({
        fornecedorId: '',
        data: new Date().toISOString().split('T')[0],
        observacoes: '',
    });
    const [itens, setItens] = useState<ItemCompraAdereco[]>([]);
    const [novoItem, setNovoItem] = useState({ aderecoId: '', quantidade: '1', precoUnitario: '' });

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        setCompras(storage.getComprasAderecos());
        setAderecos(storage.getAderecos());
        setFornecedores(storage.getFornecedores());
    }

    function openCreateModal() {
        setFormData({
            fornecedorId: fornecedores[0]?.id || '',
            data: new Date().toISOString().split('T')[0],
            observacoes: '',
        });
        setItens([]);
        setNovoItem({ aderecoId: aderecos[0]?.id || '', quantidade: '1', precoUnitario: '' });
        setIsModalOpen(true);
    }

    function addItem() {
        if (!novoItem.aderecoId || !novoItem.quantidade) return;
        const adereco = aderecos.find(a => a.id === novoItem.aderecoId);
        if (!adereco) return;

        const preco = Number(novoItem.precoUnitario) || adereco.precoMedio;
        const qty = Number(novoItem.quantidade);
        const item: ItemCompraAdereco = {
            aderecoId: novoItem.aderecoId,
            aderecoNome: adereco.nome,
            quantidade: qty,
            precoUnitario: preco,
            subtotal: qty * preco,
        };
        setItens([...itens, item]);
        setNovoItem({ aderecoId: aderecos[0]?.id || '', quantidade: '1', precoUnitario: '' });
    }

    function removeItem(index: number) {
        setItens(itens.filter((_, i) => i !== index));
    }

    function handleSave() {
        if (itens.length === 0) return;
        const fornecedor = fornecedores.find(f => f.id === formData.fornecedorId);
        const valorTotal = itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);

        const compra: CompraAderecos = {
            id: crypto.randomUUID(),
            numero: compras.length + 1,
            fornecedorId: formData.fornecedorId || undefined,
            fornecedorNome: fornecedor?.nomeFantasia || 'Avulso',
            data: formData.data,
            itens: itens,
            valorTotal: valorTotal,
            status: 'Pendente',
            observacoes: formData.observacoes || undefined,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
        };

        storage.saveCompraAderecos(compra);
        loadData();
        setIsModalOpen(false);
        setSuccessModal({ open: true, message: 'Compra registrada!' });
    }

    function handleReceive(id: string) {
        storage.receberCompraAderecos(id);
        loadData();
        setSuccessModal({ open: true, message: 'Compra recebida e estoque atualizado!' });
        setViewingCompra(null);
    }

    function handlePay(id: string) {
        const compra = compras.find(c => c.id === id);
        if (compra) {
            compra.status = 'Pago';
            storage.saveCompraAderecos(compra);
            loadData();
            setSuccessModal({ open: true, message: 'Compra marcada como paga!' });
            setViewingCompra(null);
        }
    }

    // Stats
    const totalPendentes = compras.filter(c => c.status === 'Pendente').length;
    const totalRecebidos = compras.filter(c => c.status === 'Recebido').length;
    const valorPendente = compras.filter(c => c.status !== 'Pago').reduce((sum, c) => sum + c.valorTotal, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <ShoppingCart className="text-primary" size={28} />
                        Compras de Adereços
                    </h1>
                    <p className="text-text-secondary">Registre e acompanhe compras de materiais</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus size={20} className="mr-2" />
                    Nova Compra
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-text-secondary">Total Compras</p>
                        <p className="text-2xl font-bold text-primary">{compras.length}</p>
                    </CardContent>
                </Card>
                <Card className={totalPendentes > 0 ? "border-warning" : ""}>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-text-secondary">Pendentes</p>
                        <p className={`text-2xl font-bold ${totalPendentes > 0 ? 'text-warning-darker' : 'text-success'}`}>
                            {totalPendentes}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-text-secondary">Recebidas</p>
                        <p className="text-2xl font-bold text-info">{totalRecebidos}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-text-secondary">A Pagar</p>
                        <p className="text-2xl font-bold text-error">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorPendente)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                    {compras.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary">
                            <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Nenhuma compra registrada.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Fornecedor</TableHead>
                                    <TableHead>Itens</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {compras.map((compra) => {
                                    const config = statusConfig[compra.status];
                                    const StatusIcon = config.icon;
                                    return (
                                        <TableRow key={compra.id}>
                                            <TableCell>{new Date(compra.data).toLocaleDateString('pt-BR')}</TableCell>
                                            <TableCell>{compra.fornecedorNome}</TableCell>
                                            <TableCell>{compra.itens.length} itens</TableCell>
                                            <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(compra.valorTotal)}</TableCell>
                                            <TableCell>
                                                <Badge variant={config.color as any} className="flex items-center gap-1 w-fit">
                                                    <StatusIcon size={12} /> {compra.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setViewingCompra(compra)}>
                                                    <Eye size={16} className="mr-1" /> Ver
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Modal */}
            <Dialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Compra de Adereços"
                className="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Fornecedor</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                value={formData.fornecedorId}
                                onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
                            >
                                <option value="">Avulso</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nomeFantasia}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Data da Compra</label>
                            <Input
                                type="date"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Add Item */}
                    <div className="p-4 bg-neutral-50 rounded-xl border border-border">
                        <p className="text-sm font-medium mb-3">Adicionar Item</p>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-2">
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    value={novoItem.aderecoId}
                                    onChange={(e) => setNovoItem({ ...novoItem, aderecoId: e.target.value })}
                                >
                                    {aderecos.map(a => (
                                        <option key={a.id} value={a.id}>{a.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    placeholder="Qtd"
                                    value={novoItem.quantidade}
                                    onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
                                />
                            </div>
                            <div>
                                <Button onClick={addItem} className="w-full">
                                    <Plus size={16} /> Add
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    {itens.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Itens da Compra</p>
                            {itens.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                                    <div>
                                        <span className="font-medium">{item.aderecoNome}</span>
                                        <span className="text-text-secondary ml-2">x {item.quantidade}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantidade * item.precoUnitario)}
                                        </span>
                                        <Button variant="ghost" size="icon" className="text-error" onClick={() => removeItem(idx)}>
                                            ✕
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-border font-bold">
                                <span>Total:</span>
                                <span className="text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                        itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <textarea
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[60px]"
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            placeholder="Notas sobre a compra..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="flex-1" disabled={itens.length === 0}>
                            Registrar Compra
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* View/Actions Modal */}
            <Dialog
                isOpen={!!viewingCompra}
                onClose={() => setViewingCompra(null)}
                title="Detalhes da Compra"
                className="max-w-lg"
            >
                {viewingCompra && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-text-secondary">Fornecedor</p>
                                <p className="font-medium">{viewingCompra.fornecedorNome}</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Data</p>
                                <p className="font-medium">{new Date(viewingCompra.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-text-secondary mb-2">Itens</p>
                            <div className="space-y-2">
                                {viewingCompra.itens.map((item, idx) => (
                                    <div key={idx} className="flex justify-between p-2 bg-neutral-50 rounded-lg text-sm">
                                        <span>{item.aderecoNome} x {item.quantidade}</span>
                                        <span className="font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantidade * item.precoUnitario)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
                            <span>Total:</span>
                            <span className="text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingCompra.valorTotal)}
                            </span>
                        </div>

                        <div className="flex gap-3 pt-4">
                            {viewingCompra.status === 'Pendente' && (
                                <Button onClick={() => handleReceive(viewingCompra.id)} className="flex-1 bg-info hover:bg-info/90">
                                    <Package size={16} className="mr-2" /> Marcar como Recebido
                                </Button>
                            )}
                            {viewingCompra.status === 'Recebido' && (
                                <Button onClick={() => handlePay(viewingCompra.id)} className="flex-1 bg-success hover:bg-success/90">
                                    <DollarSign size={16} className="mr-2" /> Marcar como Pago
                                </Button>
                            )}
                            {viewingCompra.status === 'Pago' && (
                                <div className="flex-1 text-center py-2 bg-success/10 rounded-lg text-success font-medium">
                                    <CheckCircle size={16} className="inline mr-2" /> Compra Finalizada
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
