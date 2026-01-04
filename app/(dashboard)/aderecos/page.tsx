"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Sparkles, Package2, AlertTriangle, Pencil, Trash2, CheckCircle, Truck, Tag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { storage } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";

// Interface compatível com Supabase
interface Adereco {
    id: string;
    nome: string;
    categoria: string;
    fornecedorId?: string;
    fornecedorNome?: string; // Derived if needed, or fetched
    preco: number;
    unidade: string;
    estoque: number;
    estoqueMin: number;
    descricao?: string;
    ativo: boolean;
    criadoEm?: string;
    atualizadoEm?: string;
}

interface CategoriaAdereco {
    id: string;
    nome: string;
}

interface Fornecedor {
    id: string;
    nomeFantasia: string;
    telefone?: string;
}

export default function AderecosPage() {
    const [aderecos, setAderecos] = useState<Adereco[]>([]);
    const [categorias, setCategorias] = useState<CategoriaAdereco[]>([]);
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoriaFilter, setCategoriaFilter] = useState("Todas");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdereco, setEditingAdereco] = useState<Adereco | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
    const [successModal, setSuccessModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    // Quick-add modals state
    const [quickCategoriaModal, setQuickCategoriaModal] = useState(false);
    const [quickFornecedorModal, setQuickFornecedorModal] = useState(false);
    const [newCategoriaNome, setNewCategoriaNome] = useState('');
    const [newFornecedorData, setNewFornecedorData] = useState({ nomeFantasia: '', telefone: '' });

    // Form state
    const [formData, setFormData] = useState({
        nome: '',
        categoria: '', // Changed from categoriaId
        fornecedorId: '',
        preco: '', // Changed from precoMedio
        unidade: 'un',
        estoque: '0', // Changed from estoqueAtual
        estoqueMin: '5', // Changed from estoqueMinimo
        descricao: '' // Changed from observacoes
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [loadedAderecos, loadedFornecedores] = await Promise.all([
            supabaseStorage.getAderecos(),
            supabaseStorage.getFornecedores()
        ]);

        // Adapt Aderecos to local interface if needed, or use directly
        setAderecos(loadedAderecos);

        // Derive categories from existing aderecos
        const uniqueCats = Array.from(new Set(loadedAderecos.map(a => a.categoria))).filter(Boolean);
        setCategorias(uniqueCats.map(c => ({ id: c, nome: c })));

        setFornecedores(loadedFornecedores);
    }

    function openCreateModal() {
        setEditingAdereco(null);
        setFormData({
            nome: '',
            categoria: categorias[0]?.nome || 'Outros',
            fornecedorId: '',
            preco: '',
            unidade: 'un',
            estoque: '0',
            estoqueMin: '5',
            descricao: ''
        });
        setIsModalOpen(true);
    }

    function openEditModal(adereco: Adereco) {
        setEditingAdereco(adereco);
        setFormData({
            nome: adereco.nome,
            categoria: adereco.categoria,
            fornecedorId: adereco.fornecedorId || '',
            preco: adereco.preco.toString(),
            unidade: adereco.unidade,
            estoque: adereco.estoque.toString(),
            estoqueMin: adereco.estoqueMin.toString(),
            descricao: adereco.descricao || ''
        });
        setIsModalOpen(true);
    }

    async function handleSave() {
        // const categoria = categorias.find(c => c.id === formData.categoriaId); // Unused
        // const fornecedor = formData.fornecedorId ? fornecedores.find(f => f.id === formData.fornecedorId) : null;

        const adereco: any = {
            id: editingAdereco?.id, // Supabase handles ID for new records usually, or we pass undefined
            nome: formData.nome,
            categoria: formData.categoria,
            // categoriaNome: categoria?.nome || 'Outros', // Removed
            // fornecedorId: formData.fornecedorId || undefined,
            // fornecedorNome: fornecedor?.nomeFantasia || undefined,
            preco: Number(formData.preco) || 0,
            unidade: formData.unidade || 'un',
            estoque: Number(formData.estoque) || 0,
            estoqueMin: Number(formData.estoqueMin) || 0,
            descricao: formData.descricao || undefined,
            ativo: true,
            // criadoEm: editingAdereco?.criadoEm || new Date().toISOString(),
            // atualizadoEm: new Date().toISOString()
        };

        // If editing, preserve ID
        if (editingAdereco) {
            adereco.id = editingAdereco.id;
        }

        try {
            await supabaseStorage.saveAdereco(adereco);
            loadData();
            setIsModalOpen(false);
            setSuccessModal({ open: true, message: editingAdereco ? 'Adereço atualizado!' : 'Adereço cadastrado!' });
        } catch (error) {
            console.error("Erro ao salvar adereço:", error);
            // Optionally show error toast
        }
    }

    async function confirmDelete() {
        if (deleteModal.id) {
            await supabaseStorage.deleteAdereco(deleteModal.id);
            loadData();
            setDeleteModal({ open: false, id: null });
            setSuccessModal({ open: true, message: 'Adereço excluído!' });
        }
    }

    // Quick-add handlers
    function handleQuickCategoriaSave() {
        if (!newCategoriaNome.trim()) return;

        // Since we don't have a categories table, we just add it to the local list temporarily
        // It will be persisted when an adereco uses it.
        const newCatName = newCategoriaNome.trim();

        setCategorias(prev => {
            if (prev.some(c => c.id === newCatName)) return prev;
            return [...prev, { id: newCatName, nome: newCatName }];
        });

        setFormData({ ...formData, categoria: newCatName });
        setNewCategoriaNome('');
        setQuickCategoriaModal(false);
    }

    async function handleQuickFornecedorSave() {
        if (!newFornecedorData.nomeFantasia.trim()) return;

        const newF = {
            razaoSocial: newFornecedorData.nomeFantasia.trim(),
            nomeFantasia: newFornecedorData.nomeFantasia.trim(),
            categoria: 'Decorações',
            telefone: newFornecedorData.telefone || '',
            ativo: true,
        };

        try {
            const saved = await supabaseStorage.saveFornecedor(newF);
            setFornecedores(await supabaseStorage.getFornecedores());
            setFormData({ ...formData, fornecedorId: saved?.id || '' });
            setNewFornecedorData({ nomeFantasia: '', telefone: '' });
            setQuickFornecedorModal(false);
        } catch (error) {
            console.error("Erro ao salvar fornecedor:", error);
        }
    }

    // Filtering
    const filtered = aderecos.filter(a => {
        const matchesSearch = a.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategoria = categoriaFilter === "Todas" || a.categoria === categoriaFilter;
        return matchesSearch && matchesCategoria;
    });

    // Stats
    const totalAderecos = aderecos.length;
    const estoqueBaixo = aderecos.filter(a => a.estoque <= a.estoqueMin).length;
    const totalValor = aderecos.reduce((sum, a) => sum + (a.estoque * a.preco), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <Sparkles className="text-primary" size={28} />
                        Adereços e Materiais
                    </h1>
                    <p className="text-text-secondary">Gerencie topos, flores, kits decorativos e outros materiais</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/aderecos/compras">
                        <Button variant="outline">
                            <ShoppingCart size={20} className="mr-2" />
                            Compras
                        </Button>
                    </Link>
                    <Button onClick={openCreateModal}>
                        <Plus size={20} className="mr-2" />
                        Novo Adereço
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-text-secondary">Total Cadastrados</p>
                        <p className="text-2xl font-bold text-primary">{totalAderecos}</p>
                    </CardContent>
                </Card>
                <Card className={estoqueBaixo > 0 ? "border-warning" : ""}>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-text-secondary">Estoque Baixo</p>
                        <p className={`text-2xl font-bold ${estoqueBaixo > 0 ? 'text-warning-darker' : 'text-success'}`}>
                            {estoqueBaixo}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-text-secondary">Categorias</p>
                        <p className="text-2xl font-bold">{categorias.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-text-secondary">Valor em Estoque</p>
                        <p className="text-2xl font-bold text-success">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-surface p-3 rounded-xl border border-border">
                <div className="flex items-center gap-2 flex-1 w-full">
                    <Search size={20} className="text-text-secondary ml-2" />
                    <input
                        type="text"
                        placeholder="Buscar adereços..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    <Button
                        key="Todas"
                        variant={categoriaFilter === "Todas" ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setCategoriaFilter("Todas")}
                        className="rounded-full px-4 whitespace-nowrap"
                    >
                        Todas
                    </Button>
                    {categorias.map(cat => (
                        <Button
                            key={cat.id}
                            variant={categoriaFilter === cat.nome ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setCategoriaFilter(cat.nome)}
                            className="rounded-full px-4 whitespace-nowrap"
                        >
                            {cat.nome}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                    <Package2 size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Nenhum adereço encontrado.</p>
                    <Button variant="ghost" onClick={openCreateModal} className="mt-4">
                        Cadastrar primeiro adereço
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((adereco) => {
                        const isBaixo = adereco.estoque <= adereco.estoqueMin;
                        return (
                            <Card key={adereco.id} className={`hover:shadow-lg transition-shadow ${isBaixo ? 'border-warning/50' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-medium text-neutral-800">{adereco.nome}</h3>
                                            <Badge variant="neutral" className="text-xs mt-1">{adereco.categoria}</Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(adereco)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-error" onClick={() => setDeleteModal({ open: true, id: adereco.id })}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Estoque:</span>
                                            <span className={`font-medium ${isBaixo ? 'text-warning-darker' : 'text-success'}`}>
                                                {adereco.estoque} {adereco.unidade}
                                                {isBaixo && <AlertTriangle size={14} className="inline ml-1" />}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Preço Médio:</span>
                                            <span className="font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(adereco.preco)}
                                            </span>
                                        </div>
                                        {adereco.fornecedorNome && (
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">Fornecedor:</span>
                                                <span className="text-xs truncate max-w-[120px]">{adereco.fornecedorNome}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAdereco ? "Editar Adereço" : "Novo Adereço"}
                className="max-w-2xl"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome *</label>
                        <Input
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Ex: Topo de Bolo Bailarina"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Categoria com + */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Categoria</label>
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                >
                                    {categorias.length === 0 && <option value="">Nenhuma</option>}
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setQuickCategoriaModal(true)}
                                    className="flex items-center justify-center w-10 h-10 border-2 border-dashed border-primary/50 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                                    title="Nova Categoria"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                        {/* Fornecedor com + */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Fornecedor</label>
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    value={formData.fornecedorId}
                                    onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
                                >
                                    <option value="">Nenhum</option>
                                    {fornecedores.map(f => (
                                        <option key={f.id} value={f.id}>{f.nomeFantasia}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setQuickFornecedorModal(true)}
                                    className="flex items-center justify-center w-10 h-10 border-2 border-dashed border-primary/50 rounded-lg text-primary hover:bg-primary/5 transition-colors"
                                    title="Novo Fornecedor"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Preço Médio</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.preco}
                                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estoque Atual</label>
                            <Input
                                type="number"
                                value={formData.estoque}
                                onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estoque Mín.</label>
                            <Input
                                type="number"
                                value={formData.estoqueMin}
                                onChange={(e) => setFormData({ ...formData, estoqueMin: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Unidade</label>
                        <select
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                            value={formData.unidade}
                            onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                        >
                            <option value="un">Unidade</option>
                            <option value="kit">Kit</option>
                            <option value="pacote">Pacote</option>
                            <option value="metro">Metro</option>
                            <option value="rolo">Rolo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <textarea
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            placeholder="Notas sobre o adereço..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="flex-1" disabled={!formData.nome}>
                            {editingAdereco ? 'Salvar Alterações' : 'Cadastrar'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Modal */}
            <Dialog
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                title="Excluir Adereço"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={32} className="text-error" />
                    </div>
                    <p className="text-text-secondary">Tem certeza que deseja excluir este adereço?</p>
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

            {/* Quick Add Category Modal */}
            <Dialog
                isOpen={quickCategoriaModal}
                onClose={() => setQuickCategoriaModal(false)}
                title="Nova Categoria de Adereço"
                className="max-w-sm"
            >
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Tag size={24} className="text-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome da Categoria *</label>
                        <Input
                            value={newCategoriaNome}
                            onChange={(e) => setNewCategoriaNome(e.target.value)}
                            placeholder="Ex: Toppers, Laços, Fitas..."
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setQuickCategoriaModal(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleQuickCategoriaSave} className="flex-1" disabled={!newCategoriaNome.trim()}>
                            Salvar e Usar
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Quick Add Fornecedor Modal */}
            <Dialog
                isOpen={quickFornecedorModal}
                onClose={() => setQuickFornecedorModal(false)}
                title="Novo Fornecedor"
                className="max-w-md"
            >
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Truck size={24} className="text-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome do Fornecedor *</label>
                        <Input
                            value={newFornecedorData.nomeFantasia}
                            onChange={(e) => setNewFornecedorData({ ...newFornecedorData, nomeFantasia: e.target.value })}
                            placeholder="Ex: Loja de Decorações XYZ"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone</label>
                        <Input
                            value={newFornecedorData.telefone}
                            onChange={(e) => setNewFornecedorData({ ...newFornecedorData, telefone: e.target.value })}
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setQuickFornecedorModal(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleQuickFornecedorSave} className="flex-1" disabled={!newFornecedorData.nomeFantasia.trim()}>
                            Salvar e Usar
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
