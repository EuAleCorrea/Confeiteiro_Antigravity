"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { storage, Pedido, Cliente, Produto, ItemOrcamento } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowLeft, Save, Trash2, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { AddItemModal } from "@/components/pedidos/AddItemModal";

export default function PedidoEditarClient() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const isEditing = id && id !== "placeholder";

    // Data Sources
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);

    // Form State
    const [pedido, setPedido] = useState<Partial<Pedido>>({
        status: 'Pagamento Pendente',
        dataCriacao: new Date().toISOString(),
        itens: [],
        financeiro: { valorTotal: 0, statusPagamento: 'Pendente', formaPagamento: 'PIX', valorPago: 0, saldoPendente: 0 },
        entrega: { tipo: 'Retirada', taxaEntrega: 0 },
        decoracao: { descricao: '', imagensReferencia: [] },
        producao: { checklist: [], fotos: [] },
        historico: []
    });

    const [selectedClientId, setSelectedClientId] = useState('');
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    useEffect(() => {
        setClientes(storage.getClientes());
        const prods = storage.getProdutos();
        setProdutos(prods);

        if (isEditing && id) {
            const found = storage.getPedidoById(id);
            if (found) {
                setPedido(found);
                if (found.cliente.id) setSelectedClientId(found.cliente.id);
            }
        }
    }, [isEditing, id]);

    const handleSave = () => {
        // Validation
        if (!selectedClientId) {
            setErrorModal({ open: true, message: 'Selecione um cliente' });
            return;
        }
        if (!pedido.dataEntrega) {
            setErrorModal({ open: true, message: 'Informe a data de entrega' });
            return;
        }

        // Hydrate Client Data
        const client = clientes.find(c => c.id === selectedClientId);
        if (!client) return;

        const orderToSave: Pedido = {
            ...pedido as Pedido,
            id: isEditing ? (pedido.id || id) : crypto.randomUUID(),
            cliente: {
                id: client.id,
                nome: client.nome,
                telefone: client.telefone,
                email: client.email
            },
            numero: isEditing ? (pedido.numero || 0) : 0,
        };

        if (!isEditing) {
            orderToSave.historico = [{
                data: new Date().toISOString(),
                acao: 'Pedido Criado',
                usuario: 'Admin'
            }];
        } else {
            orderToSave.historico = orderToSave.historico || [];
            orderToSave.historico.push({
                data: new Date().toISOString(),
                acao: 'Pedido Editado',
                usuario: 'Admin'
            });
        }

        storage.savePedido(orderToSave);
        router.push('/pedidos');
    };

    const addItem = (newItem: ItemOrcamento) => {
        const newItens = [...(pedido.itens || []), newItem];
        const newTotal = newItens.reduce((acc, i) => acc + i.subtotal, 0) + (pedido.entrega?.taxaEntrega || 0);

        setPedido({
            ...pedido,
            itens: newItens,
            financeiro: {
                ...pedido.financeiro!,
                valorTotal: newTotal,
                saldoPendente: newTotal - (pedido.financeiro?.valorPago || 0)
            }
        });
    };

    const removeItem = (index: number) => {
        const newItens = [...(pedido.itens || [])];
        newItens.splice(index, 1);
        const newTotal = newItens.reduce((acc, i) => acc + i.subtotal, 0) + (pedido.entrega?.taxaEntrega || 0);
        setPedido({
            ...pedido,
            itens: newItens,
            financeiro: {
                ...pedido.financeiro!,
                valorTotal: newTotal,
                saldoPendente: newTotal - (pedido.financeiro?.valorPago || 0)
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-10">
            <div className="flex items-center gap-4">
                <Link href="/pedidos">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-neutral-800">
                    {isEditing ? `Editar Pedido #${pedido.numero}` : 'Novo Pedido'}
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client & Date */}
                <Card>
                    <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cliente</label>
                            <select
                                className="w-full p-2 border border-neutral-300 rounded-lg text-sm"
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                            >
                                <option value="">Selecione um cliente...</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Data Entrega"
                                type="date"
                                value={pedido.dataEntrega ? new Date(pedido.dataEntrega).toISOString().split('T')[0] : ''}
                                onChange={(e) => setPedido({ ...pedido, dataEntrega: e.target.value })}
                            />
                            <Input
                                label="Hora Entrega"
                                type="time"
                                value={pedido.horaEntrega || ''}
                                onChange={(e) => setPedido({ ...pedido, horaEntrega: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="tipo"
                                        checked={pedido.entrega?.tipo === 'Retirada'}
                                        onChange={() => setPedido({ ...pedido, tipo: 'Retirada', entrega: { ...pedido.entrega!, tipo: 'Retirada' } })}
                                    /> Retirada
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="tipo"
                                        checked={pedido.entrega?.tipo === 'Entrega'}
                                        onChange={() => setPedido({ ...pedido, tipo: 'Entrega', entrega: { ...pedido.entrega!, tipo: 'Entrega' } })}
                                    /> Entrega
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Itens</CardTitle>
                        <Button size="sm" variant="outline" onClick={() => setIsAddItemModalOpen(true)}><Plus size={16} /></Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(pedido.itens || []).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-neutral-50 p-2 rounded">
                                <div>
                                    <p className="text-sm font-bold">{item.quantidade}x {item.nome}</p>
                                    <p className="text-xs text-neutral-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario)} un.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}</span>
                                    <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.financeiro?.valorTotal || 0)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-3">
                <Link href="/pedidos">
                    <Button variant="outline">Cancelar</Button>
                </Link>
                <Button variant="primary" onClick={handleSave}>
                    <Save size={18} className="mr-2" /> Salvar Pedido
                </Button>
            </div>

            <AddItemModal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                onAdd={addItem}
            />

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
