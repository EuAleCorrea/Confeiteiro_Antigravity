"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { storage, Colaborador } from "@/lib/storage";

export default function EquipePage() {
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
    const [formData, setFormData] = useState<Partial<Colaborador>>({});

    useEffect(() => {
        loadColaboradores();
    }, []);

    function loadColaboradores() {
        setColaboradores(storage.getColaboradores());
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.nome || !formData.funcao) return;

        const colaborador: Colaborador = {
            id: editingColaborador ? editingColaborador.id : crypto.randomUUID(),
            nome: formData.nome,
            cpf: formData.cpf || "",
            telefone: formData.telefone || "",
            funcao: formData.funcao,
            status: formData.status || 'Ativo',
            escala: formData.escala || [],
        };

        storage.saveColaborador(colaborador);
        loadColaboradores();
        closeModal();
    }

    function handleDelete(id: string) {
        if (confirm("Excluir este colaborador?")) {
            storage.deleteColaborador(id);
            loadColaboradores();
        }
    }

    function openModal(colaborador?: Colaborador) {
        if (colaborador) {
            setEditingColaborador(colaborador);
            setFormData(colaborador);
        } else {
            setEditingColaborador(null);
            setFormData({ status: 'Ativo', escala: [], funcao: 'Confeiteira' });
        }
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingColaborador(null);
        setFormData({});
    }

    function toggleDia(dia: string) {
        const current = formData.escala || [];
        if (current.includes(dia)) {
            setFormData({ ...formData, escala: current.filter(d => d !== dia) });
        } else {
            setFormData({ ...formData, escala: [...current, dia] });
        }
    }

    const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Equipe</h1>
                    <p className="text-text-secondary">Gerencie seus colaboradores e escalas</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus size={20} className="mr-2" />
                    Novo Colaborador
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colaboradores.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-text-secondary">
                        Nenhum colaborador cadastrado.
                    </div>
                ) : (
                    colaboradores.map((colaborador) => (
                        <Card key={colaborador.id} className="relative group">
                            <CardContent className="p-6">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => openModal(colaborador)}>
                                        <Edit2 size={16} />
                                    </Button>
                                </div>

                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                        <User size={40} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-text-primary">{colaborador.nome}</h3>
                                        <p className="text-sm text-text-secondary">{colaborador.funcao}</p>
                                    </div>
                                    <Badge variant={
                                        colaborador.status === 'Ativo' ? 'success' :
                                            colaborador.status === 'Férias' ? 'warning' : 'neutral'
                                    }>
                                        {colaborador.status}
                                    </Badge>

                                    <div className="pt-4 w-full">
                                        <p className="text-xs font-medium text-text-secondary mb-2 flex items-center justify-center gap-1">
                                            <Calendar size={14} /> Escala Semanal
                                        </p>
                                        <div className="flex justify-center gap-1">
                                            {diasSemana.map(dia => (
                                                <span
                                                    key={dia}
                                                    className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full ${colaborador.escala?.includes(dia)
                                                            ? 'bg-primary text-white'
                                                            : 'bg-neutral-100 text-neutral-400'
                                                        }`}
                                                >
                                                    {dia[0]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingColaborador ? "Editar Colaborador" : "Novo Colaborador"}
                className="max-w-2xl"
            >
                <form onSubmit={handleSave} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nome Completo *"
                            required
                            value={formData.nome || ""}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        />
                        <Input
                            label="Telefone"
                            value={formData.telefone || ""}
                            onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                        />
                        <div className="col-span-1">
                            <label className="text-sm font-medium text-text-secondary mb-2 block">Função *</label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                value={formData.funcao || 'Confeiteira'}
                                onChange={e => setFormData({ ...formData, funcao: e.target.value as any })}
                            >
                                <option value="Confeiteira">Confeiteira</option>
                                <option value="Auxiliar">Auxiliar</option>
                                <option value="Decoradora">Decoradora</option>
                                <option value="Motorista">Motorista</option>
                                <option value="Atendimento">Atendimento</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="text-sm font-medium text-text-secondary mb-2 block">Status</label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                value={formData.status || 'Ativo'}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                                <option value="Férias">Férias</option>
                                <option value="Licença">Licença</option>
                            </select>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Escala de Trabalho</label>
                            <div className="flex gap-2">
                                {diasSemana.map(dia => (
                                    <label key={dia} className="flex items-center space-x-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.escala?.includes(dia) || false}
                                            onChange={() => toggleDia(dia)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{dia}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
                        <Button type="submit">Salvar Colaborador</Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
