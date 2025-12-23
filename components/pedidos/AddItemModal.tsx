"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { storage, Produto, Sabor, ItemOrcamento } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: ItemOrcamento) => void;
}

export function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
    const [activeTab, setActiveTab] = useState<'produtos' | 'manual'>('produtos');
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [sabores, setSabores] = useState<Sabor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

    // Form states
    const [nome, setNome] = useState('');
    const [quantidade, setQuantidade] = useState(1);
    const [preco, setPreco] = useState('');
    const [tamanho, setTamanho] = useState('');
    const [saborMassa, setSaborMassa] = useState('');
    const [saborRecheio, setSaborRecheio] = useState('');
    const [observacoes, setObservacoes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setProdutos(storage.getProdutos());
            setSabores(storage.getSabores());
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setNome('');
        setQuantidade(1);
        setPreco('');
        setTamanho('');
        setSaborMassa('');
        setSaborRecheio('');
        setObservacoes('');
        setSelectedProduct(null);
        setSearchTerm('');
    };

    const filteredProducts = produtos.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectProduct = (produto: Produto) => {
        setSelectedProduct(produto);
        setNome(produto.nome);
        setPreco(produto.preco.toString());
        // Set first size if available
        if (produto.tamanhos && produto.tamanhos.length > 0) {
            setTamanho(produto.tamanhos[0]);
        }
    };

    const handleSubmit = () => {
        const precoNum = parseFloat(preco.replace(',', '.')) || 0;

        if (!nome.trim()) {
            alert('Informe o nome do item');
            return;
        }
        if (precoNum <= 0) {
            alert('Informe um preço válido');
            return;
        }

        const newItem: ItemOrcamento = {
            id: crypto.randomUUID(),
            tipo: 'Produto',
            produtoId: selectedProduct?.id || 'manual',
            nome: nome.trim(),
            quantidade,
            precoUnitario: precoNum,
            subtotal: quantidade * precoNum,
            tamanho: tamanho || undefined,
            saborMassa: saborMassa || undefined,
            saborRecheio: saborRecheio || undefined,
        };

        onAdd(newItem);
        resetForm();
        onClose();
    };

    const massas = sabores.filter(s => s.tipo === 'Massa');
    const recheios = sabores.filter(s => s.tipo === 'Recheio');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-text-primary">Adicionar Item ao Pedido</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => { setActiveTab('produtos'); resetForm(); }}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === 'produtos'
                                ? "text-primary border-b-2 border-primary"
                                : "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        Selecionar Produto
                    </button>
                    <button
                        onClick={() => { setActiveTab('manual'); resetForm(); }}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === 'manual'
                                ? "text-primary border-b-2 border-primary"
                                : "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        Item Manual
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'produtos' && !selectedProduct && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="text"
                                    placeholder="Buscar produto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            {/* Product List */}
                            <div className="grid gap-2 max-h-80 overflow-y-auto">
                                {filteredProducts.length === 0 ? (
                                    <p className="text-center text-text-secondary py-8">
                                        Nenhum produto encontrado
                                    </p>
                                ) : (
                                    filteredProducts.map(produto => (
                                        <button
                                            key={produto.id}
                                            onClick={() => handleSelectProduct(produto)}
                                            className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-primary/5 rounded-xl border border-border hover:border-primary/30 transition-all text-left"
                                        >
                                            <div>
                                                <p className="font-medium text-text-primary">{produto.nome}</p>
                                                <p className="text-sm text-text-secondary">{produto.categoria}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                                                </p>
                                                {produto.tamanhos && produto.tamanhos.length > 0 && (
                                                    <p className="text-xs text-text-secondary">{produto.tamanhos.length} tamanhos</p>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'manual' || selectedProduct) && (
                        <div className="space-y-4">
                            {selectedProduct && (
                                <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-primary/20">
                                    <div>
                                        <p className="text-sm text-text-secondary">Produto selecionado:</p>
                                        <p className="font-medium text-primary">{selectedProduct.nome}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedProduct(null); resetForm(); }}>
                                        Trocar
                                    </Button>
                                </div>
                            )}

                            {/* Item Name */}
                            {activeTab === 'manual' && (
                                <Input
                                    label="Nome do Item"
                                    placeholder="Ex: Bolo de Chocolate"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            )}

                            {/* Tamanho (if product has sizes) */}
                            {selectedProduct?.tamanhos && selectedProduct.tamanhos.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-primary">Tamanho</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProduct.tamanhos.map((tam) => (
                                            <button
                                                key={tam}
                                                onClick={() => setTamanho(tam)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                                                    tamanho === tam
                                                        ? "border-primary bg-primary text-white"
                                                        : "border-border bg-background hover:border-primary/50"
                                                )}
                                            >
                                                {tam}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sabores */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-primary">Massa</label>
                                    <select
                                        value={saborMassa}
                                        onChange={(e) => setSaborMassa(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                                    >
                                        <option value="">Selecione...</option>
                                        {massas.map(s => (
                                            <option key={s.id} value={s.nome}>{s.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-primary">Recheio</label>
                                    <select
                                        value={saborRecheio}
                                        onChange={(e) => setSaborRecheio(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                                    >
                                        <option value="">Selecione...</option>
                                        {recheios.map(s => (
                                            <option key={s.id} value={s.nome}>{s.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Quantity & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-primary">Quantidade</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                                            className="w-10 h-10 rounded-xl border border-border bg-background flex items-center justify-center hover:bg-neutral-100"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantidade}
                                            onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="flex-1 text-center px-4 py-2 rounded-xl border border-border bg-background"
                                        />
                                        <button
                                            onClick={() => setQuantidade(quantidade + 1)}
                                            className="w-10 h-10 rounded-xl border border-border bg-background flex items-center justify-center hover:bg-neutral-100"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <Input
                                    label="Preço Unitário (R$)"
                                    placeholder="0,00"
                                    value={preco}
                                    onChange={(e) => setPreco(e.target.value)}
                                />
                            </div>

                            {/* Observations */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-primary">Observações</label>
                                <textarea
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    placeholder="Algum detalhe adicional..."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none min-h-[80px]"
                                />
                            </div>

                            {/* Subtotal Preview */}
                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <span className="font-medium text-text-primary">Subtotal:</span>
                                <span className="text-xl font-bold text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                        quantidade * (parseFloat(preco.replace(',', '.')) || 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-border bg-neutral-50">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={activeTab === 'produtos' && !selectedProduct}>
                        <Plus size={18} className="mr-2" />
                        Adicionar Item
                    </Button>
                </div>
            </div>
        </div>
    );
}
