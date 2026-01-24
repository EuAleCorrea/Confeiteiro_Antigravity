"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy, X, Upload, AlertTriangle, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Toggle } from "@/components/ui/Toggle";
import { Produto, Categoria } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable wrapper component for product cards
function SortableProductCard({ produto, children }: { produto: Produto; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: produto.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`overflow-hidden group relative ${isDragging ? 'shadow-2xl ring-2 ring-primary' : ''}`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 z-20 p-1.5 rounded-md bg-white/80 backdrop-blur-sm shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                title="Arrastar para reordenar"
            >
                <GripVertical size={16} className="text-neutral-500" />
            </div>
            {children}
        </Card>
    );
}

// Sortable wrapper component for category tabs
function SortableCategoryTab({ cat, isActive, onClick }: { cat: Categoria; isActive: boolean; onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: cat.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-grab active:cursor-grabbing ${isActive
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
                } ${isDragging ? 'bg-surface shadow-lg rounded-t-lg' : ''}`}
            onClick={onClick}
        >
            {cat.nome}{cat.nome.endsWith('o') || cat.nome.endsWith('a') ? 's' : ''}
        </button>
    );
}

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('Bolo');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<{ id: string, nome: string } | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
    const [formData, setFormData] = useState<Partial<Produto>>({});
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: 'product' | 'category'; id: string; name: string } | null>(null);
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    // Image compression helper
    function compressImage(file: File, maxSize: number = 400): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    // Resize maintaining aspect ratio
                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Convert to JPEG with 70% quality
                    const compressed = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressed);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    useEffect(() => {
        loadProdutos();
    }, []);

    async function loadProdutos() {
        try {
            const [produtosData, categoriasData] = await Promise.all([
                supabaseStorage.getProdutos(),
                supabaseStorage.getCategorias()
            ]);
            setProdutos(produtosData as Produto[]);
            setCategorias(categoriasData as Categoria[]);
            // Set first category as active tab if current doesn't exist
            if (categoriasData.length > 0 && !categoriasData.find(c => c.nome === activeTab)) {
                setActiveTab(categoriasData[0].nome);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.nome) {
            return;
        }

        let finalPreco = Number(formData.preco || 0);

        // If has sizes, derive price from the smallest one
        if (formData.tamanhos && formData.tamanhos.length > 0) {
            const prices = Object.values(formData.precosPorTamanho || {}).filter(p => p > 0);
            if (prices.length > 0) {
                finalPreco = Math.min(...prices);
            } else {
                alert("Por favor, informe o preço para os tamanhos selecionados.");
                return;
            }
        } else if (!formData.preco) {
            alert("Por favor, informe o preço do produto.");
            return;
        }

        setSaving(true);
        try {
            const produto: Partial<Produto> = {
                ...(editingProduto ? { id: editingProduto.id } : {}),
                nome: formData.nome,
                categoria: formData.categoria || activeTab,
                preco: finalPreco,
                descricao: formData.descricao || "",
                tamanhos: formData.tamanhos || [],
                precosPorTamanho: formData.precosPorTamanho || {},
                ativo: formData.ativo !== undefined ? formData.ativo : true,
                foto: formData.foto || editingProduto?.foto,
            };

            await supabaseStorage.saveProduto(produto);
            await loadProdutos();
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            setErrorModal({ open: true, message: 'Erro ao salvar produto.' });
        } finally {
            setSaving(false);
        }
    }

    function handleDelete(produto: Produto) {
        setDeleteModal({
            open: true,
            type: 'product',
            id: produto.id,
            name: produto.nome
        });
    }

    async function confirmDelete() {
        if (!deleteModal) return;

        try {
            if (deleteModal.type === 'product') {
                await supabaseStorage.deleteProduto(deleteModal.id);
            } else if (deleteModal.type === 'category') {
                await supabaseStorage.deleteCategoria(deleteModal.id);
                if (activeTab === deleteModal.name) {
                    const updatedCats = await supabaseStorage.getCategorias();
                    setActiveTab(updatedCats[0]?.nome || "Bolo");
                }
            }
            await loadProdutos();
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
        setDeleteModal(null);
    }

    async function handleDuplicate(produto: Produto) {
        // Don't copy image to save storage space
        const { foto, id, ...produtoSemFotoId } = produto;
        const newProduto = {
            ...produtoSemFotoId,
            nome: `${produto.nome} (Cópia)`
        };
        try {
            await supabaseStorage.saveProduto(newProduto);
            await loadProdutos();
        } catch (error) {
            console.error('Erro ao duplicar:', error);
            setErrorModal({ open: true, message: 'Erro ao duplicar produto.' });
        }
    }

    async function handleImageUpload(produtoId: string, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressedBase64 = await compressImage(file);
            const produto = produtos.find(p => p.id === produtoId);
            if (produto) {
                await supabaseStorage.saveProduto({ ...produto, foto: compressedBase64 });
                await loadProdutos();
            }
        } catch (error) {
            console.error('Erro ao carregar imagem:', error);
            setErrorModal({ open: true, message: 'Erro ao carregar imagem. Tente uma imagem menor.' });
        }
        // Reset input to allow re-uploading same file
        e.target.value = '';
    }

    async function handleDeleteImage(produtoId: string) {
        const produto = produtos.find(p => p.id === produtoId);
        if (produto) {
            const { foto, ...rest } = produto;
            await supabaseStorage.saveProduto(rest as Produto);
            await loadProdutos();
        }
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

    async function handleAddCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const newName = newCategoryName.trim();

        setSaving(true);
        try {
            if (editingCategory) {
                const oldName = editingCategory.nome;
                if (oldName !== newName) {
                    // Update products with this category
                    const produtosToUpdate = produtos.filter(p => p.categoria === oldName);
                    for (const p of produtosToUpdate) {
                        await supabaseStorage.saveProduto({ ...p, categoria: newName });
                    }

                    // Update category
                    await supabaseStorage.saveCategoria({
                        id: editingCategory.id,
                        nome: newName
                    });

                    if (activeTab === oldName) setActiveTab(newName);
                }
                setEditingCategory(null);
            } else {
                const newCat = await supabaseStorage.saveCategoria({ nome: newName });
                if (newCat) {
                    setFormData(prev => ({ ...prev, categoria: newCat.nome }));
                }
            }

            setNewCategoryName("");
            await loadProdutos();
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
        } finally {
            setSaving(false);
        }
    }

    function handleDeleteCategory(cat: { id: string, nome: string }) {
        // Check if any product uses this category
        const isUsedByProduct = produtos.some(p => p.categoria === cat.nome);

        if (isUsedByProduct) {
            alert(`Não é possível excluir a categoria "${cat.nome}" pois ela possui produtos cadastrados.`);
            return;
        }

        setDeleteModal({
            open: true,
            type: 'category',
            id: cat.id,
            name: cat.nome
        });
    }

    function openCategoryModal() {
        setIsCategoryModalOpen(true);
        setEditingCategory(null);
        setNewCategoryName("");
    }

    function toggleTamanho(tamanho: string) {
        setFormData(prev => {
            const current = prev.tamanhos || [];
            const currentPrices = prev.precosPorTamanho || {};

            if (current.includes(tamanho)) {
                const newTamanhos = current.filter(t => t !== tamanho);
                const { [tamanho]: _, ...rest } = currentPrices;
                return { ...prev, tamanhos: newTamanhos, precosPorTamanho: rest };
            } else {
                return { ...prev, tamanhos: [...current, tamanho] };
            }
        });
    }

    function handlePriceChange(tamanho: string, price: string) {
        setFormData(prev => ({
            ...prev,
            precosPorTamanho: {
                ...prev.precosPorTamanho,
                [tamanho]: parseFloat(price) || 0
            }
        }));
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = filteredProdutos.findIndex(p => p.id === active.id);
        const newIndex = filteredProdutos.findIndex(p => p.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const reordered = arrayMove(filteredProdutos, oldIndex, newIndex);
            // Update ordem for all products in this category
            for (let i = 0; i < reordered.length; i++) {
                const updated = { ...reordered[i], ordem: i };
                await supabaseStorage.saveProduto(updated);
            }
            await loadProdutos();
        }
    }

    async function handleDragEndCategories(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const sortedCats = [...categorias].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
        const oldIndex = sortedCats.findIndex(c => c.id === active.id);
        const newIndex = sortedCats.findIndex(c => c.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const reordered = arrayMove(sortedCats, oldIndex, newIndex);
            // Update ordem for all categories
            for (let i = 0; i < reordered.length; i++) {
                const updated = { ...reordered[i], ordem: i };
                await supabaseStorage.saveCategoria(updated);
            }
            await loadProdutos();
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const sortedCategorias = [...categorias].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
    const filteredProdutos = produtos
        .filter(p => p.categoria === activeTab)
        .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
    const tamanhosOpcoes = ["P (15 fatias)", "M (25 fatias)", "G (35 fatias)", "GG (50 fatias)", "23cm", "25cm"];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-text-secondary">Carregando produtos...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-primary">Produtos</h1>
                <Button onClick={() => openModal()}>
                    <Plus size={20} className="mr-2" />
                    Novo Produto
                </Button>
            </div>

            {/* Tabs */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategories}>
                <SortableContext items={sortedCategorias.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                    <div className="flex border-b border-border overflow-x-auto no-scrollbar">
                        {sortedCategorias.map((cat) => (
                            <SortableCategoryTab
                                key={cat.id}
                                cat={cat}
                                isActive={activeTab === cat.nome}
                                onClick={() => setActiveTab(cat.nome)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredProdutos.map(p => p.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProdutos.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-text-secondary">
                                Nenhum produto cadastrado nesta categoria.
                            </div>
                        ) : (
                            filteredProdutos.map((produto) => (
                                <SortableProductCard key={produto.id} produto={produto}>
                                    <div className="h-48 bg-neutral-100 flex items-center justify-center text-neutral-400 relative overflow-hidden group/img">
                                        {produto.foto ? (
                                            <>
                                                <img
                                                    src={produto.foto}
                                                    alt={produto.nome}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            onChange={(e) => handleImageUpload(produto.id, e)}
                                                        />
                                                        <Button variant="secondary" size="icon" className="h-9 w-9 bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-sm" title="Trocar Imagem">
                                                            <Upload size={16} />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="h-9 w-9 bg-white/20 hover:bg-red-500/60 text-white border-none backdrop-blur-sm"
                                                        title="Excluir Imagem"
                                                        onClick={() => handleDeleteImage(produto.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-sm">Sem imagem</span>
                                                <div className="relative border border-dashed border-neutral-300 rounded-lg p-2 hover:bg-neutral-200 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        onChange={(e) => handleImageUpload(produto.id, e)}
                                                    />
                                                    <div className="flex items-center text-xs font-medium text-text-secondary">
                                                        <Upload size={14} className="mr-1" /> Carregar
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleDuplicate(produto)} title="Duplicar">
                                                <Copy size={16} />
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => openModal(produto)} title="Editar">
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(produto)} title="Excluir">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </SortableProductCard>
                            ))
                        )}
                    </div>
                </SortableContext>
            </DndContext>

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
                            <div className="flex gap-2">
                                <select
                                    className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                    value={formData.categoria || activeTab}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value as any })}
                                >
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl flex-shrink-0"
                                    onClick={openCategoryModal}
                                    title="Gerenciar Categorias"
                                >
                                    <Plus size={20} />
                                </Button>
                            </div>
                        </div>
                        {(!formData.tamanhos || formData.tamanhos.length === 0) && (
                            <Input
                                label="Preço Único (R$) *"
                                type="number"
                                step="0.01"
                                required
                                value={formData.preco || ""}
                                onChange={e => setFormData({ ...formData, preco: Number(e.target.value) })}
                            />
                        )}

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-text-secondary mb-2 block">Descrição</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                value={formData.descricao || ""}
                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                            />
                        </div>

                        {/* Sizes Section - Available for all categories */}
                        <div className="col-span-2 space-y-4 pt-4 border-t border-border">
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

            <Dialog
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="Gerenciar Categorias"
                className="max-w-md"
            >
                <div className="mt-4 space-y-4">
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                        {categorias.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:bg-surface/80 group">
                                <span className="text-sm font-medium text-text-primary">{cat.nome}</span>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-text-secondary hover:text-primary"
                                        onClick={() => {
                                            setEditingCategory(cat);
                                            setNewCategoryName(cat.nome);
                                        }}
                                    >
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                        onClick={() => handleDeleteCategory(cat)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddCategory} className="pt-4 border-t border-border flex gap-2">
                        <div className="flex-1">
                            <Input
                                placeholder={editingCategory ? "Renomear categoria..." : "Nova categoria..."}
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <Button type="submit" className="h-11 px-6">
                            {editingCategory ? "Salvar" : "Adicionar"}
                        </Button>
                        {editingCategory && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-11 w-11 p-0"
                                onClick={() => {
                                    setEditingCategory(null);
                                    setNewCategoryName("");
                                }}
                            >
                                <X size={18} />
                            </Button>
                        )}
                    </form>
                </div>
            </Dialog>

            {/* Custom Delete Modal */}
            <Dialog
                isOpen={!!deleteModal?.open}
                onClose={() => setDeleteModal(null)}
                title="Confirmar Exclusão"
                className="max-w-sm"
            >
                <div className="text-center space-y-4 pt-2">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-300">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-text-primary font-medium text-lg">
                            Excluir {deleteModal?.type === 'product' ? 'Produto' : 'Categoria'}?
                        </p>
                        <p className="text-text-secondary text-sm">
                            Tem certeza que deseja excluir <strong>"{deleteModal?.name}"</strong>?
                            <br />
                            <span className="text-xs">Essa ação não pode ser desfeita.</span>
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none">
                            Excluir
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Error Modal */}
            <Dialog
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Atenção"
                className="max-w-sm"
            >
                <div className="text-center space-y-4 pt-2">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-300">
                        <AlertTriangle size={32} className="text-amber-600" />
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


