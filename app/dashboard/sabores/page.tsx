"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Dialog } from "@/components/ui/Dialog";
import { Sabor } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";

export default function SaboresPage() {
    const [sabores, setSabores] = useState<Sabor[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'Massa' | 'Recheio'>('Massa');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSabor, setEditingSabor] = useState<Sabor | null>(null);
    const [formData, setFormData] = useState<Partial<Sabor>>({});

    useEffect(() => {
        loadSabores();
    }, []);

    async function loadSabores() {
        try {
            const data = await supabaseStorage.getSabores();
            setSabores(data as Sabor[]);
        } catch (error) {
            console.error('Erro ao carregar sabores:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.nome) return;

        setSaving(true);
        try {
            const sabor: Partial<Sabor> = {
                ...(editingSabor ? { id: editingSabor.id } : {}),
                nome: formData.nome,
                tipo: formData.tipo || activeTab,
                descricao: formData.descricao || "",
                custoAdicional: Number(formData.custoAdicional) || 0,
            };

            await supabaseStorage.saveSabor(sabor);
            await loadSabores();
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar sabor:', error);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Excluir este sabor?")) {
            try {
                await supabaseStorage.deleteSabor(id);
                await loadSabores();
            } catch (error) {
                console.error('Erro ao deletar sabor:', error);
            }
        }
    }

    function openModal(sabor?: Sabor) {
        if (sabor) {
            setEditingSabor(sabor);
            setFormData(sabor);
        } else {
            setEditingSabor(null);
            setFormData({ tipo: activeTab });
        }
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingSabor(null);
        setFormData({});
    }

    const filteredSabores = sabores.filter(s => s.tipo === activeTab);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-text-secondary">Carregando sabores...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Sabores</h1>
                    <p className="text-text-secondary">Gerencie massas e recheios disponíveis</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus size={20} className="mr-2" />
                    Novo Sabor
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                {['Massa', 'Recheio'].map((tab) => (
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Custo Adicional</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredSabores.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-text-secondary">
                                Nenhum sabor cadastrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredSabores.map((sabor) => (
                            <TableRow key={sabor.id}>
                                <TableCell className="font-medium">{sabor.nome}</TableCell>
                                <TableCell>{sabor.descricao}</TableCell>
                                <TableCell>
                                    {sabor.custoAdicional ? `+ R$ ${sabor.custoAdicional.toFixed(2)}` : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openModal(sabor)}>
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-error hover:text-error" onClick={() => handleDelete(sabor.id)}>
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
                title={editingSabor ? "Editar Sabor" : "Novo Sabor"}
                className="max-w-md"
            >
                <form onSubmit={handleSave} className="space-y-4 mt-4">
                    <Input
                        label="Nome do Sabor *"
                        required
                        value={formData.nome || ""}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    />

                    <div>
                        <label className="text-sm font-medium text-text-secondary mb-2 block">Tipo *</label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="Massa"
                                    checked={(formData.tipo || activeTab) === 'Massa'}
                                    onChange={e => setFormData({ ...formData, tipo: 'Massa' })}
                                    className="text-primary focus:ring-primary"
                                />
                                <span>Massa</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="tipo"
                                    value="Recheio"
                                    checked={(formData.tipo || activeTab) === 'Recheio'}
                                    onChange={e => setFormData({ ...formData, tipo: 'Recheio' })}
                                    className="text-primary focus:ring-primary"
                                />
                                <span>Recheio</span>
                            </label>
                        </div>
                    </div>

                    <Input
                        label="Descrição"
                        value={formData.descricao || ""}
                        onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                    />

                    <Input
                        label="Custo Adicional (R$)"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.custoAdicional || ""}
                        onChange={e => setFormData({ ...formData, custoAdicional: Number(e.target.value) })}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Sabor'
                            )}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}

