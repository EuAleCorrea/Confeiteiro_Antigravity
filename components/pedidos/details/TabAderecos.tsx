"use client";

import { useState, useEffect } from "react";
import { Plus, Sparkles, Trash2, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Pedido, Adereco, AderecoPedido } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";

interface TabAderecosProps {
    pedido: Pedido;
    onUpdate: (pedido: Pedido) => void;
}

export function TabAderecos({ pedido, onUpdate }: TabAderecosProps) {
    const [aderecos, setAderecos] = useState<Adereco[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdereco, setSelectedAdereco] = useState<string>('');
    const [quantidade, setQuantidade] = useState('1');
    const [observacoes, setObservacoes] = useState('');
    const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    useEffect(() => {
        supabaseStorage.getAderecos().then(data => setAderecos(data as any));
    }, []);

    const pedidoAderecos = pedido.aderecos || [];

    function handleAddAdereco() {
        if (!selectedAdereco) return;
        const adereco = aderecos.find(a => a.id === selectedAdereco);
        if (!adereco) return;

        const novoItem: AderecoPedido = {
            aderecoId: adereco.id,
            aderecoNome: adereco.nome,
            quantidade: Number(quantidade) || 1,
            reservado: false,
            observacoes: observacoes || undefined,
        };

        const updatedAderecos = [...pedidoAderecos, novoItem];
        const updatedPedido = { ...pedido, aderecos: updatedAderecos, atualizadoEm: new Date().toISOString() };
        supabaseStorage.savePedido(updatedPedido);
        onUpdate(updatedPedido);

        setIsAddModalOpen(false);
        setSelectedAdereco('');
        setQuantidade('1');
        setObservacoes('');
        setSuccessModal({ open: true, message: 'Adereço adicionado ao pedido!' });
    }

    async function handleRemoveAdereco(index: number) {
        const updatedAderecos = pedidoAderecos.filter((_, i) => i !== index);
        const updatedPedido = { ...pedido, aderecos: updatedAderecos, atualizadoEm: new Date().toISOString() };
        await supabaseStorage.savePedido(updatedPedido);
        onUpdate(updatedPedido);
    }

    async function handleToggleReservado(index: number) {
        const updatedAderecos = [...pedidoAderecos];
        updatedAderecos[index] = { ...updatedAderecos[index], reservado: !updatedAderecos[index].reservado };
        const updatedPedido = { ...pedido, aderecos: updatedAderecos, atualizadoEm: new Date().toISOString() };
        await supabaseStorage.savePedido(updatedPedido);
        onUpdate(updatedPedido);
    }

    const filteredAderecos = aderecos.filter(a =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !pedidoAderecos.some(pa => pa.aderecoId === a.id)
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Adereços do Pedido</h3>
                    <p className="text-sm text-text-secondary">Materiais decorativos vinculados a este pedido</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Adicionar Adereço
                </Button>
            </div>

            {pedidoAderecos.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-border">
                    <Sparkles size={48} className="mx-auto mb-4 text-text-secondary/30" />
                    <p className="text-text-secondary">Nenhum adereço vinculado a este pedido.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={16} className="mr-2" /> Adicionar Primeiro Adereço
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {pedidoAderecos.map((item, index) => {
                        const adereco = aderecos.find(a => a.id === item.aderecoId);
                        // @ts-ignore
                        const estoqueDisponivel = adereco ? (adereco.estoque || adereco.estoqueAtual || 0) : 0;
                        const temEstoque = estoqueDisponivel >= item.quantidade;

                        return (
                            <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Sparkles size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.aderecoNome}</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-text-secondary">Qtd: {item.quantidade}</span>
                                            {!temEstoque && (
                                                <Badge variant="warning" className="text-xs">
                                                    <AlertTriangle size={10} className="mr-1" />
                                                    Estoque baixo
                                                </Badge>
                                            )}
                                        </div>
                                        {item.observacoes && (
                                            <p className="text-xs text-text-secondary">{item.observacoes}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleReservado(index)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${item.reservado
                                            ? 'bg-success/10 text-success'
                                            : 'bg-neutral-100 text-text-secondary hover:bg-warning/10 hover:text-warning-darker'
                                            }`}
                                    >
                                        {item.reservado ? (
                                            <><CheckCircle size={14} className="inline mr-1" /> Separado</>
                                        ) : (
                                            'Marcar como Separado'
                                        )}
                                    </button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-error hover:bg-error/10"
                                        onClick={() => handleRemoveAdereco(index)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Adereco Modal */}
            <Dialog
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Adicionar Adereço ao Pedido"
                className="max-w-md"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <Input
                            placeholder="Buscar adereço..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredAderecos.length === 0 ? (
                            <p className="text-center py-4 text-text-secondary text-sm">Nenhum adereço encontrado.</p>
                        ) : (
                            filteredAderecos.map(a => (
                                <button
                                    key={a.id}
                                    onClick={() => setSelectedAdereco(a.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedAdereco === a.id
                                        ? 'bg-primary/10 border-2 border-primary'
                                        : 'bg-neutral-50 hover:bg-neutral-100 border-2 border-transparent'
                                        }`}
                                >
                                    <span className="font-medium">{a.nome}</span>
                                    <span className="text-sm text-text-secondary">
                                        {/* @ts-ignore */}
                                        Estoque: {a.estoque || a.estoqueAtual}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantidade</label>
                            <Input
                                type="number"
                                min="1"
                                value={quantidade}
                                onChange={(e) => setQuantidade(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Observações</label>
                            <Input
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                placeholder="Ex: Cor rosa"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleAddAdereco} className="flex-1" disabled={!selectedAdereco}>
                            Adicionar
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

