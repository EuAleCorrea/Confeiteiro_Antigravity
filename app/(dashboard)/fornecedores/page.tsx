"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Filter, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { storage, Fornecedor } from "@/lib/storage";

export default function FornecedoresPage() {
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [filterCategoria, setFilterCategoria] = useState<string>("Todos");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
    const [formData, setFormData] = useState<Partial<Fornecedor>>({});

    useEffect(() => {
        loadFornecedores();
    }, []);

    function loadFornecedores() {
        setFornecedores(storage.getFornecedores());
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.razaoSocial || !formData.cnpj) return;

        const fornecedor: Fornecedor = {
            id: editingFornecedor ? editingFornecedor.id : crypto.randomUUID(),
            razaoSocial: formData.razaoSocial,
            nomeFantasia: formData.nomeFantasia || formData.razaoSocial,
            cnpj: formData.cnpj,
            categoria: formData.categoria || 'Ingredientes',
            telefone: formData.telefone || "",
            email: formData.email,
            ativo: formData.ativo !== undefined ? formData.ativo : true,
            observacoes: formData.observacoes,
        };

        storage.saveFornecedor(fornecedor);
        loadFornecedores();
        closeModal();
    }

    function handleDelete(id: string) {
        if (confirm("Excluir este fornecedor?")) {
            storage.deleteFornecedor(id);
            loadFornecedores();
        }
    }

    function openModal(fornecedor?: Fornecedor) {
        if (fornecedor) {
            setEditingFornecedor(fornecedor);
            setFormData(fornecedor);
        } else {
            setEditingFornecedor(null);
            setFormData({ categoria: 'Ingredientes', ativo: true });
        }
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingFornecedor(null);
        setFormData({});
    }

    const filtered = filterCategoria === "Todos"
        ? fornecedores
        : fornecedores.filter(f => f.categoria === filterCategoria);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Fornecedores</h1>
                    <p className="text-text-secondary">Gerencie parceiros e fornecedores</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus size={20} className="mr-2" />
                    Novo Fornecedor
                </Button>
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto">
                {['Todos', 'Ingredientes', 'Embalagens', 'Decorações', 'Serviços', 'Equipamentos'].map(cat => (
                    <Button
                        key={cat}
                        variant={filterCategoria === cat ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilterCategoria(cat)}
                        className="rounded-full"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                                Nenhum fornecedor encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filtered.map((fornecedor) => (
                            <TableRow key={fornecedor.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{fornecedor.nomeFantasia}</span>
                                        <span className="text-xs text-text-secondary">{fornecedor.razaoSocial}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{fornecedor.cnpj}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm">
                                        <span className="flex items-center gap-1"><Phone size={12} /> {fornecedor.telefone}</span>
                                        {fornecedor.email && <span className="flex items-center gap-1"><Mail size={12} /> {fornecedor.email}</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="neutral">{fornecedor.categoria}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={fornecedor.ativo ? "success" : "error"}>
                                        {fornecedor.ativo ? "Ativo" : "Inativo"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openModal(fornecedor)}>
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-error hover:text-error" onClick={() => handleDelete(fornecedor.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
                className="max-w-2xl"
            >
                <form onSubmit={handleSave} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Razão Social *"
                            required
                            value={formData.razaoSocial || ""}
                            onChange={e => setFormData({ ...formData, razaoSocial: e.target.value })}
                        />
                        <Input
                            label="Nome Fantasia"
                            value={formData.nomeFantasia || ""}
                            onChange={e => setFormData({ ...formData, nomeFantasia: e.target.value })}
                        />
                        <Input
                            label="CNPJ *"
                            required
                            placeholder="00.000.000/0000-00"
                            value={formData.cnpj || ""}
                            onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                        />
                        <div className="col-span-1">
                            <label className="text-sm font-medium text-text-secondary mb-2 block">Categoria *</label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                value={formData.categoria || 'Ingredientes'}
                                onChange={e => setFormData({ ...formData, categoria: e.target.value as any })}
                            >
                                <option value="Ingredientes">Ingredientes</option>
                                <option value="Embalagens">Embalagens</option>
                                <option value="Decorações">Decorações</option>
                                <option value="Serviços">Serviços</option>
                                <option value="Equipamentos">Equipamentos</option>
                            </select>
                        </div>
                        <Input
                            label="Telefone *"
                            required
                            value={formData.telefone || ""}
                            onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                        />
                        <Input
                            label="E-mail"
                            type="email"
                            value={formData.email || ""}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-text-secondary mb-2 block">Observações</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                value={formData.observacoes || ""}
                                onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.ativo ?? true}
                                onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                                className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                            />
                            <span className="font-medium text-text-primary">Fornecedor Ativo</span>
                        </label>
                        <div className="flex gap-3">
                            <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
                            <Button type="submit">Salvar Fornecedor</Button>
                        </div>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
