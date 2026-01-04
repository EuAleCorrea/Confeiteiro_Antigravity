import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Trash2, Save, X, AlertTriangle, Loader2 } from "lucide-react";
import { Pedido, Cliente, Produto, ItemOrcamento } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { AddItemModal } from "@/components/pedidos/AddItemModal";

interface OrderFormProps {
    onClose: () => void;
    onSave: () => void;
    existingPedido?: Pedido; // For editing
}

export function OrderForm({ onClose, onSave, existingPedido }: OrderFormProps) {
    // Data Sources
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [saving, setSaving] = useState(false);

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
        async function loadData() {
            setClientes(await supabaseStorage.getClientes());
        }
        loadData();

        if (existingPedido) {
            setPedido(existingPedido);
            if (existingPedido.cliente.id) setSelectedClientId(existingPedido.cliente.id);
        }
    }, [existingPedido]);

    const handleSave = async () => {
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

        setSaving(true);
        try {
            const orderToSave: Pedido = {
                ...pedido as Pedido,
                id: existingPedido ? existingPedido.id : crypto.randomUUID(), // Ensure ID is present for local interface consistency, or let Supabase ignore it on insert if matched
                cliente: {
                    id: client.id,
                    nome: client.nome,
                    telefone: client.telefone,
                    email: client.email
                },
                numero: existingPedido ? existingPedido.numero : 0, // Supabase triggers or backend handles this
            };

            if (!existingPedido) {
                orderToSave.historico = [{
                    data: new Date().toISOString(),
                    acao: 'Pedido Criado',
                    usuario: 'Admin'
                }];
            } else {
                orderToSave.historico.push({
                    data: new Date().toISOString(),
                    acao: 'Pedido Editado',
                    usuario: 'Admin'
                });
            }

            await supabaseStorage.savePedido(orderToSave);
            onSave();
        } catch (error) {
            console.error('Erro ao salvar pedido:', error);
            setErrorModal({ open: true, message: 'Erro ao salvar pedido.' });
        } finally {
            setSaving(false);
        }
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client & Date */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informações Básicas</h3>
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
                </div>

                {/* Itens */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-neutral-100 p-2 rounded-lg">
                        <h3 className="font-semibold text-lg">Itens</h3>
                        <Button size="sm" variant="outline" onClick={() => setIsAddItemModalOpen(true)} className="h-8">
                            <Plus size={16} />
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {(pedido.itens || []).length === 0 && (
                            <p className="text-sm text-neutral-500 text-center py-4">Nenhum item adicionado.</p>
                        )}
                        {(pedido.itens || []).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-neutral-50 p-2 rounded border border-neutral-100">
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
                    </div>

                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.financeiro?.valorTotal || 0)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
                <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />} Salvar Pedido
                </Button>
            </div>

            {/* Add Item Modal */}
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
