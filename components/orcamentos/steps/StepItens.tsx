"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { storage, Produto, Sabor, ItemOrcamento, Orcamento } from "@/lib/storage"; // types kept for now
import { supabaseStorage } from "@/lib/supabase-storage";
import { Badge } from "@/components/ui/Badge";

interface StepProps {
    data: Partial<Orcamento>;
    onUpdate: (data: Partial<Orcamento>) => void;
    next?: () => void;
    back?: () => void;
}

// Interface para produto expandido por tamanho
interface ProductVariant {
    variantId: string; // formato: produtoId ou produtoId__tamanho
    produtoId: string;
    nome: string;
    displayName: string; // "Bolo Grande (P - 15 fatias)"
    preco: number;
    tamanho?: string;
    categoria: string;
    produto: Produto; // Referência ao produto original
}

// Função para expandir produtos em variantes por tamanho
function expandProductsToVariants(products: Produto[]): ProductVariant[] {
    const variants: ProductVariant[] = [];

    products.forEach(p => {
        // Se tem tamanhos, criar uma variante por tamanho
        if (p.tamanhos && p.tamanhos.length > 0) {
            p.tamanhos.forEach(tamanho => {
                // Usar preço específico do tamanho se existir, senão usar preço base
                const preco = p.precosPorTamanho?.[tamanho] ?? p.preco;
                variants.push({
                    variantId: `${p.id}__${tamanho}`,
                    produtoId: p.id,
                    nome: p.nome,
                    displayName: `${p.nome} (${tamanho})`,
                    preco,
                    tamanho,
                    categoria: p.categoria,
                    produto: p
                });
            });
        } else {
            // Produto sem tamanhos: usar como está
            variants.push({
                variantId: p.id,
                produtoId: p.id,
                nome: p.nome,
                displayName: p.nome,
                preco: p.preco,
                categoria: p.categoria,
                produto: p
            });
        }
    });

    return variants;
}

export default function StepItens({ data, onUpdate, next, back }: StepProps) {
    const [availableProducts, setAvailableProducts] = useState<Produto[]>([]);
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
    const [availableSabores, setAvailableSabores] = useState<Sabor[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState<string>("");

    // Item Details State
    const [quantity, setQuantity] = useState(1);
    const [selectedMassa, setSelectedMassa] = useState("");
    const [selectedRecheios, setSelectedRecheios] = useState<string[]>([]);
    const [items, setItems] = useState<ItemOrcamento[]>(data.itens || []);

    // Quick Product Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState("");
    const [newProductPrice, setNewProductPrice] = useState("");
    const [newProductCategory, setNewProductCategory] = useState<'Bolo' | 'Adicional' | 'Serviço'>('Bolo');

    const cartTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [prods, sabores] = await Promise.all([
            supabaseStorage.getProdutos(),
            supabaseStorage.getSabores()
        ]);
        const activeProducts = prods.filter(p => p.ativo);
        const variants = expandProductsToVariants(activeProducts);

        setAvailableProducts(activeProducts);
        setProductVariants(variants);
        setAvailableSabores(sabores);
    }

    async function handleQuickProductSave() {
        if (!newProductName || !newProductPrice) return;

        const newProduct: any = {
            nome: newProductName,
            categoria: newProductCategory,
            preco: parseFloat(newProductPrice),
            descricao: '',
            tamanhos: [],
            precosPorTamanho: {},
            ativo: true
        };

        try {
            const saved = await supabaseStorage.saveProduto(newProduct);
            await loadData(); // Reload all to refresh list
            setSelectedVariantId(saved.id);

            // Reset and close modal
            setNewProductName("");
            setNewProductPrice("");
            setIsProductModalOpen(false);
        } catch (error) {
            console.error("Erro ao criar produto rápido", error);
            alert("Erro ao salvar produto.");
        }
    }

    const currentVariant = productVariants.find(v => v.variantId === selectedVariantId);
    const currentProduct = currentVariant?.produto;
    const massas = availableSabores.filter(s => s.tipo === 'Massa');
    const recheios = availableSabores.filter(s => s.tipo === 'Recheio');

    function addItem() {
        if (!currentVariant || !currentProduct) return;

        const unitPrice = currentVariant.preco;

        const subtotal = unitPrice * quantity;

        const newItem: ItemOrcamento = {
            id: crypto.randomUUID(),
            tipo: currentProduct.categoria === 'Bolo' ? 'Produto' :
                currentProduct.categoria === 'Adicional' ? 'Adicional' : 'Servico',
            produtoId: currentProduct.id,
            nome: currentVariant.displayName,
            tamanho: currentVariant.tamanho,
            saborMassa: selectedMassa ? massas.find(m => m.id === selectedMassa)?.nome : undefined,
            saborRecheio: selectedRecheios.length > 0
                ? selectedRecheios.map(id => recheios.find(r => r.id === id)?.nome).filter(Boolean).join(" + ")
                : undefined,
            quantidade: quantity,
            precoUnitario: unitPrice,
            subtotal: subtotal
        };

        const newItems = [...items, newItem];
        setItems(newItems);
        onUpdate({ itens: newItems });

        // Reset form
        setSelectedVariantId("");
        setSelectedMassa("");
        setSelectedRecheios([]);
        setQuantity(1);
    }

    function removeItem(id: string) {
        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        onUpdate({ itens: newItems });
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-1">O que será encomendado?</h2>
                    <p className="text-text-secondary">Escolha os produtos e configure os sabores.</p>
                </div>

                <div className="bg-surface p-4 rounded-xl border border-border space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Produto</label>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 h-10 rounded-lg border border-border px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={selectedVariantId}
                                onChange={(e) => setSelectedVariantId(e.target.value)}
                            >
                                <option value="">Selecione um produto...</option>
                                {productVariants.map(v => (
                                    <option key={v.variantId} value={v.variantId}>
                                        {v.displayName} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.preco)}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setIsProductModalOpen(true)}
                                className="h-10 w-10 rounded-lg border border-dashed border-primary text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                                title="Cadastrar novo produto"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {currentVariant && currentProduct && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            {currentProduct.categoria === 'Bolo' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Massa</label>
                                        <select
                                            className="w-full h-10 rounded-lg border border-border px-3"
                                            value={selectedMassa}
                                            onChange={(e) => setSelectedMassa(e.target.value)}
                                        >
                                            <option value="">Padrão / Nenhuma</option>
                                            {massas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="block text-sm font-medium">Recheios (Máx 3)</label>
                                        <div className="space-y-2">
                                            {/* Dynamic Recheio Selects */}
                                            {[0, 1, 2].map(idx => (
                                                <select
                                                    key={idx}
                                                    className="w-full h-10 rounded-lg border border-border px-3"
                                                    value={selectedRecheios[idx] || ""}
                                                    onChange={(e) => {
                                                        const newRecheios = [...selectedRecheios];
                                                        if (e.target.value) {
                                                            newRecheios[idx] = e.target.value;
                                                        } else {
                                                            newRecheios.splice(idx, 1);
                                                        }
                                                        setSelectedRecheios(newRecheios.filter(Boolean));
                                                    }}
                                                >
                                                    <option value="">{idx === 0 ? "Selecione um recheio..." : "Adicionar outro recheio..."}</option>
                                                    {recheios.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                                                </select>
                                            ))}
                                            {selectedRecheios.length > 0 && <p className="text-xs text-text-secondary">Selecionados: {selectedRecheios.length}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-end gap-4">
                                <div className="w-24">
                                    <Input
                                        label="Qtd."
                                        type="number"
                                        min={1}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <Button className="flex-1" onClick={addItem}>
                                    <Plus size={18} className="mr-2" />
                                    Adicionar ao Pedido
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Summary */}
            <div className="w-full md:w-80 space-y-4">
                <div className="bg-neutral-50 p-4 rounded-xl border border-border">
                    <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-text-secondary">Resumo do Pedido</h3>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {items.length === 0 && <p className="text-sm text-text-secondary italic">Nenhum item adicionado.</p>}
                        {items.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-lg border border-border shadow-sm text-sm relative group">
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute top-2 right-2 text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <p className="font-medium">{item.quantidade}x {item.nome}</p>
                                {(item.saborMassa || item.saborRecheio) && (
                                    <p className="text-xs text-text-secondary mt-1">
                                        {item.saborMassa && `Massa: ${item.saborMassa} `}
                                        {item.saborRecheio && `• Rech: ${item.saborRecheio}`}
                                    </p>
                                )}
                                <p className="text-right font-semibold mt-1">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border mt-4 pt-4 flex justify-between items-center">
                        <span className="font-medium">Total Estimado</span>
                        <span className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between gap-2">
                    <Button variant="ghost" onClick={back} className="w-full">Voltar</Button>
                    <Button onClick={next} disabled={items.length === 0} className="w-full">Próximo: Decoração</Button>
                </div>
            </div>

            {/* Quick Product Modal */}
            <Dialog
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                title="Cadastro Rápido de Produto"
                className="max-w-md"
            >
                <div className="space-y-4">
                    <Input
                        label="Nome do Produto *"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="Ex: Bolo de Chocolate"
                        autoFocus
                    />
                    <Input
                        label="Preço (R$) *"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        placeholder="150.00"
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <select
                            className="w-full h-10 rounded-lg border border-border px-3"
                            value={newProductCategory}
                            onChange={(e) => setNewProductCategory(e.target.value as any)}
                        >
                            <option value="Bolo">Bolo</option>
                            <option value="Adicional">Adicional</option>
                            <option value="Serviço">Serviço</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsProductModalOpen(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleQuickProductSave} className="flex-1" disabled={!newProductName || !newProductPrice}>
                            Salvar e Usar
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

