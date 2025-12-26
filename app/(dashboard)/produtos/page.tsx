"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Toggle } from "@/components/ui/Toggle";
import { storage, Produto } from "@/lib/storage";

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [activeTab, setActiveTab] = useState<'Bolo' | 'Adicional' | 'Serviço'>('Bolo');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
    const [formData, setFormData] = useState<Partial<Produto>>({});

    useEffect(() => {
        loadProdutos();
    }, []);

    function loadProdutos() {
        setProdutos(storage.getProdutos());
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.nome || !formData.preco) return;

        const produto: Produto = {
            id: editingProduto ? editingProduto.id : crypto.randomUUID(),
            nome: formData.nome,
            categoria: formData.categoria || activeTab,
            preco: Number(formData.preco),
            descricao: formData.descricao || "",
            tamanhos: formData.tamanhos || [],
            precosPorTamanho: formData.precosPorTamanho || {},
            ativo: formData.ativo !== undefined ? formData.ativo : true,
            // foto: formData.foto
        };

        storage.saveProduto(produto);
        loadProdutos();
        closeModal();
    }

    function handleDelete(id: string) {
        if (confirm("Excluir este produto?")) {
            storage.deleteProduto(id);
            loadProdutos();
        }
    }

    function handleDuplicate(produto: Produto) {
        const newProduto = {
            ...produto,
            id: crypto.randomUUID(),
            nome: `${produto.nome} (Cópia)`
        };
        storage.saveProduto(newProduto);
        loadProdutos();
    }

    function openModal(produto?: Produto) {
        if (produto) {
            setEditingProduto(produto);
            setFormData(produto);
        } else {
            setEditingProduto(null);
            setFormData({ categoria: activeTab, ativo: true, tamanhos: [] });
        }
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingProduto(null);
        setFormData({});
    }

    function toggleTamanho(tamanho: string) {
        const current = formData.tamanhos || [];
        const currentPrices = formData.precosPorTamanho || {};

        if (current.includes(tamanho)) {
            const newTamanhos = current.filter(t => t !== tamanho);
            // Optional: cleanup price for removed size
            const { [tamanho]: _, ...rest } = currentPrices;
            setFormData({ ...formData, tamanhos: newTamanhos, precosPorTamanho: rest });
        } else {
            setFormData({ ...formData, tamanhos: [...current, tamanho] });
        }
    }

    function handlePriceChange(tamanho: string, price: string) {
        setFormData({
            ...formData,
            precosPorTamanho: {
                ...formData.precosPorTamanho,
                [tamanho]: parseFloat(price) || 0
            }
        });
    }

    const filteredProdutos = produtos.filter(p => p.categoria === activeTab);
    const tamanhosOpcoes = ["P (15 fatias)", "M (25 fatias)", "G (35 fatias)", "GG (50 fatias)", "23cm", "25cm"];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-primary">Produtos Base</h1>
                <Button onClick={() => openModal()}>
                    <Plus size={20} className="mr-2" />
                    Novo Produto
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                {['Bolo', 'Adicional', 'Serviço'].map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? "border-primary text-primary"
                            : "border-transparent text-text-secondary hover:text-text-primary"
                            }`}
                        onClick={() => setActiveTab(tab as any)}
                    >
                        {tab}s
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProdutos.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-text-secondary">
                        Nenhum produto cadastrado nesta categoria.
                    </div>
                ) : (
                    filteredProdutos.map((produto) => (
                        <Card key={produto.id} className="overflow-hidden group">
                            <div className="h-40 bg-neutral-100 flex items-center justify-center text-neutral-400">
                                {/* Placeholder for Image */}
                                <span className="text-sm">Sem imagem</span>
                            </div>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-text-primary truncate">{produto.nome}</h3>
                                        <p className="text-sm text-text-secondary truncate">{produto.categoria}</p>
                                    </div>
                                    <Badge variant={produto.ativo ? "success" : "neutral"}>
                                        {produto.ativo ? "Ativo" : "Inativo"}
                                    </Badge>
                                </div>

                                <p className="font-bold text-lg">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                                </p>

                                <div className="flex justify-end gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => handleDuplicate(produto)} title="Duplicar">
                                        <Copy size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => openModal(produto)} title="Editar">
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-error" onClick={() => handleDelete(produto.id)} title="Excluir">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingProduto ? "Editar Produto" : "Novo Produto"}
                className="max-w-3xl"
            >
                <form onSubmit={handleSave} className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nome do Produto *"
                            required
                            value={formData.nome || ""}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            className="col-span-2"
                        />
                        <div className="col-span-1">
                            <label className="text-sm font-medium text-text-secondary mb-2 block">Categoria *</label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                value={formData.categoria || activeTab}
                                onChange={e => setFormData({ ...formData, categoria: e.target.value as any })}
                            >
                                <option value="Bolo">Bolo</option>
                                <option value="Adicional">Adicional</option>
                                <option value="Serviço">Serviço</option>
                            </select>
                        </div>
                        <Input
                            label="Preço Base (R$) *"
                            type="number"
                            step="0.01"
                            required
                            value={formData.preco || ""}
                            onChange={e => setFormData({ ...formData, preco: Number(e.target.value) })}
                        />

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-text-secondary mb-2 block">Descrição</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                value={formData.descricao || ""}
                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                            />
                        </div>

                        {/* Conditional fields for 'Bolo' */}
                        {(formData.categoria === 'Bolo' || (!formData.categoria && activeTab === 'Bolo')) && (
                            <div className="col-span-2 space-y-4">
                                <label className="text-sm font-medium text-text-secondary">Tamanhos Disponíveis</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tamanhosOpcoes.map(tamanho => {
                                        const isSelected = formData.tamanhos?.includes(tamanho);
                                        return (
                                            <div key={tamanho} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isSelected ? 'bg-primary-50 border-primary-100' : 'bg-neutral-50 border-neutral-100'}`}>
                                                <Toggle
                                                    checked={isSelected || false}
                                                    onChange={() => toggleTamanho(tamanho)}
                                                    size="sm"
                                                />
                                                <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-primary-900' : 'text-neutral-700'}`}>{tamanho}</span>

                                                {isSelected && (
                                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                                        <span className="text-xs text-text-secondary">Preço: R$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="w-24 h-8 px-2 rounded border border-border text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                                            placeholder={String(formData.preco || 0)}
                                                            value={formData.precosPorTamanho?.[tamanho] || ""}
                                                            onChange={(e) => handlePriceChange(tamanho, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-text-primary">Produto Ativo</span>
                            <Toggle
                                checked={formData.ativo ?? true}
                                onChange={(checked) => setFormData({ ...formData, ativo: checked })}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
                            <Button type="submit">Salvar Produto</Button>
                        </div>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
