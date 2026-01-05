"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, History, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Dialog } from "@/components/ui/Dialog";
import { Cliente } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { ImportGoogleContactsModal } from "@/components/clientes/ImportGoogleContactsModal";
import { createClient } from "@/lib/supabase/client";

function ClientesContent() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const supabase = createClient();

    // Form State
    const [formData, setFormData] = useState<Partial<Cliente>>({});
    const [loadingCep, setLoadingCep] = useState(false);

    useEffect(() => {
        loadClientes();
        checkGoogleUser();
    }, []);

    async function checkGoogleUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setIsGoogleUser(user?.app_metadata?.provider === 'google');
    }

    async function loadClientes() {
        try {
            const data = await supabaseStorage.getClientes();
            setClientes(data as Cliente[]);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.nome || !formData.telefone) return;

        setSaving(true);
        try {
            const cliente: Partial<Cliente> = {
                ...(editingCliente ? { id: editingCliente.id } : {}),
                nome: formData.nome,
                cpf: formData.cpf || "",
                telefone: formData.telefone,
                email: formData.email || "",
                endereco: {
                    cep: formData.endereco?.cep || "",
                    rua: formData.endereco?.rua || "",
                    numero: formData.endereco?.numero || "",
                    complemento: formData.endereco?.complemento || "",
                    bairro: formData.endereco?.bairro || "",
                    cidade: formData.endereco?.cidade || "",
                    estado: formData.endereco?.estado || "",
                },
                observacoes: formData.observacoes || "",
            };

            await supabaseStorage.saveCliente(cliente);
            await loadClientes();
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
        } finally {
            setSaving(false);
        }
    }

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    // ... (rest of state)

    function handleDelete(id: string) {
        setDeleteModal({ open: true, id });
    }

    async function confirmDelete() {
        if (!deleteModal.id) return;

        try {
            await supabaseStorage.deleteCliente(deleteModal.id);
            setDeleteModal({ open: false, id: null });
            await loadClientes();
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            alert('Erro ao excluir cliente. Verifique se existem pedidos vinculados.');
        }
    }

    function openModal(cliente?: Cliente) {
        if (cliente) {
            setEditingCliente(cliente);
            setFormData(cliente);
        } else {
            setEditingCliente(null);
            setFormData({});
        }
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingCliente(null);
        setFormData({});
    }

    async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        endereco: {
                            ...prev.endereco!,
                            cep: prev.endereco?.cep || cep,
                            rua: data.logradouro,
                            bairro: data.bairro,
                            cidade: data.localidade,
                            estado: data.uf
                        }
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error);
            } finally {
                setLoadingCep(false);
            }
        }
    }

    const filteredClientes = clientes.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cpf && c.cpf.includes(searchTerm)) ||
        c.telefone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-text-secondary">Carregando clientes...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
                    <p className="text-text-secondary">Gerencie seus clientes e histórico</p>
                </div>
                <div className="flex gap-2">
                    {isGoogleUser && (
                        <Button
                            variant="outline"
                            onClick={() => setIsGoogleModalOpen(true)}
                            className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                        >
                            <Share2 size={18} />
                            Importar do Google
                        </Button>
                    )}
                    <Button onClick={() => openModal()}>
                        <Plus size={20} className="mr-2" />
                        Novo Cliente
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-surface p-2 rounded-xl border border-border max-w-md">
                <Search size={20} className="text-text-secondary ml-2" />
                <input
                    type="text"
                    placeholder="Buscar por nome, CPF ou telefone..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredClientes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-text-secondary">
                                Nenhum cliente encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredClientes.map((cliente) => (
                            <TableRow key={cliente.id}>
                                <TableCell className="font-medium">{cliente.nome}</TableCell>
                                <TableCell>{cliente.cpf}</TableCell>
                                <TableCell>{cliente.telefone}</TableCell>
                                <TableCell>{cliente.email}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openModal(cliente)}>
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <History size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-error hover:text-error"
                                            onClick={() => handleDelete(cliente.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Standard Modal */}
            <Dialog
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCliente ? "Editar Cliente" : "Novo Cliente"}
                className="max-w-3xl"
            >
                <form onSubmit={handleSave} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome Completo *"
                            required
                            value={formData.nome || ""}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        />
                        <Input
                            label="CPF"
                            placeholder="000.000.000-00"
                            value={formData.cpf || ""}
                            onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                        />
                        <Input
                            label="Telefone *"
                            placeholder="(00) 00000-0000"
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
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium text-text-primary border-b border-border pb-2">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Input
                                    label="CEP"
                                    placeholder="00000-000"
                                    value={formData.endereco?.cep || ""}
                                    onChange={e => setFormData({
                                        ...formData,
                                        endereco: { ...formData.endereco!, cep: e.target.value }
                                    })}
                                    onBlur={handleCepBlur}
                                />
                                {loadingCep && <span className="absolute right-3 top-9 text-xs text-primary">Buscando...</span>}
                            </div>
                            <Input
                                label="Rua"
                                className="md:col-span-2"
                                value={formData.endereco?.rua || ""}
                                onChange={e => setFormData({
                                    ...formData,
                                    endereco: { ...formData.endereco!, rua: e.target.value }
                                })}
                            />
                            <Input
                                label="Número"
                                value={formData.endereco?.numero || ""}
                                onChange={e => setFormData({
                                    ...formData,
                                    endereco: { ...formData.endereco!, numero: e.target.value }
                                })}
                            />
                            <Input
                                label="Bairro"
                                value={formData.endereco?.bairro || ""}
                                onChange={e => setFormData({
                                    ...formData,
                                    endereco: { ...formData.endereco!, bairro: e.target.value }
                                })}
                            />
                            <Input
                                label="Complemento"
                                value={formData.endereco?.complemento || ""}
                                onChange={e => setFormData({
                                    ...formData,
                                    endereco: { ...formData.endereco!, complemento: e.target.value }
                                })}
                            />
                            <Input
                                label="Cidade"
                                value={formData.endereco?.cidade || ""}
                                onChange={e => setFormData({
                                    ...formData,
                                    endereco: { ...formData.endereco!, cidade: e.target.value }
                                })}
                            />
                            <div className="md:col-span-1">
                                <label className="text-sm font-medium text-text-secondary mb-2 block">Estado</label>
                                <select
                                    className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                    value={formData.endereco?.estado || ""}
                                    onChange={e => setFormData({
                                        ...formData,
                                        endereco: { ...formData.endereco!, estado: e.target.value }
                                    })}
                                >
                                    <option value="">Selecione</option>
                                    <option value="SP">SP</option>
                                    <option value="RJ">RJ</option>
                                    <option value="MG">MG</option>
                                    <option value="RS">RS</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Cliente'
                            )}
                        </Button>
                    </div>
                </form>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                title="Excluir Cliente"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                        <Trash2 size={32} className="text-error" />
                    </div>
                    <p className="text-text-secondary">
                        Tem certeza que deseja excluir este cliente?
                        <br />
                        <span className="text-xs text-text-secondary/70">Esta ação não pode ser desfeita.</span>
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null })} className="flex-1">
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="flex-1 bg-error hover:bg-error/90 text-white"
                        >
                            Excluir
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Google Import Modal */}
            <ImportGoogleContactsModal
                isOpen={isGoogleModalOpen}
                onClose={() => setIsGoogleModalOpen(false)}
                onImportSuccess={() => loadClientes()}
            />
        </div>
    );
}

export default function ClientesPage() {
    return <ClientesContent />;
}

