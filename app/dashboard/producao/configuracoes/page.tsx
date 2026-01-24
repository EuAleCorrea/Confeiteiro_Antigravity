"use client";

import { useEffect, useState } from "react";
import { storage, Ingrediente, Receita, ConfigProducao } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Plus, Trash2, Edit, Save, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TabReceitas } from "@/components/producao/TabReceitas";
import { TabGeral } from "@/components/producao/TabGeral";

// Simple ID generator to avoid uuid dependency issues
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function ProductionSettingsPage() {
    const [activeTab, setActiveTab] = useState<'ingredientes' | 'receitas' | 'geral'>('ingredientes');

    return (
        <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/producao">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800">Configurações de Produção</h1>
                    <p className="text-neutral-500 text-sm">Gerencie ingredientes, receitas e parâmetros técnicos</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-neutral-200">
                <nav className="flex gap-6">
                    {['ingredientes', 'receitas', 'geral'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "pb-3 text-sm font-medium border-b-2 transition-colors capitalize",
                                activeTab === tab
                                    ? "border-primary text-primary"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'ingredientes' && <TabIngredientes />}
                {activeTab === 'receitas' && <TabReceitas />}
                {activeTab === 'geral' && <TabGeral />}
            </div>
        </div>
    );
}

// --- Tab: Ingredientes ---

function TabIngredientes() {
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentIng, setCurrentIng] = useState<Partial<Ingrediente>>({
        nome: '', unidade: 'g', categoria: 'Secos'
    });
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setIngredientes(storage.getIngredientes());
    };

    const handleSave = () => {
        if (!currentIng.nome) {
            setErrorModal({ open: true, message: 'Preencha o nome' });
            return;
        }

        const toSave: Ingrediente = {
            id: currentIng.id || generateId(),
            nome: currentIng.nome!,
            unidade: currentIng.unidade as any || 'g',
            categoria: currentIng.categoria as any || 'Outros',
            custoUnitario: currentIng.custoUnitario || 0,
            estoqueAtual: currentIng.estoqueAtual || 0,
            estoqueMinimo: currentIng.estoqueMinimo || 0
        };

        storage.saveIngrediente(toSave);
        loadData();
        setIsEditing(false);
        setCurrentIng({ nome: '', unidade: 'g', categoria: 'Secos' });
    };

    const handleDelete = (id: string) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = () => {
        if (deleteModal.id) {
            storage.deleteIngrediente(deleteModal.id);
            loadData();
            setDeleteModal({ open: false, id: null });
        }
    };

    const handleEdit = (ing: Ingrediente) => {
        setCurrentIng(ing);
        setIsEditing(true);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle>{isEditing ? 'Editar Ingrediente' : 'Novo Ingrediente'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        label="Nome"
                        value={currentIng.nome}
                        onChange={e => setCurrentIng({ ...currentIng, nome: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Unidade</label>
                            <select
                                className="w-full p-2 border border-neutral-300 rounded-lg text-sm"
                                value={currentIng.unidade}
                                onChange={e => setCurrentIng({ ...currentIng, unidade: e.target.value as any })}
                            >
                                <option value="g">Gramas (g)</option>
                                <option value="kg">Quilogramas (kg)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="l">Litros (l)</option>
                                <option value="un">Unidade (un)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categoria</label>
                            <select
                                className="w-full p-2 border border-neutral-300 rounded-lg text-sm"
                                value={currentIng.categoria}
                                onChange={e => setCurrentIng({ ...currentIng, categoria: e.target.value as any })}
                            >
                                <option value="Secos">Secos</option>
                                <option value="Laticínios">Laticínios e Ovos</option>
                                <option value="Hortifruti">Hortifruti</option>
                                <option value="Líquidos">Líquidos</option>
                                <option value="Embalagens">Embalagens</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    {/* Placeholder for cost/stock - not prioritized yet but visible */}
                    <Input
                        label="Custo Unitário (R$)"
                        type="number"
                        value={currentIng.custoUnitario || ''}
                        onChange={e => setCurrentIng({ ...currentIng, custoUnitario: Number(e.target.value) })}
                    />

                    <div className="flex gap-2 pt-2">
                        {isEditing && (
                            <Button variant="outline" className="flex-1" onClick={() => { setIsEditing(false); setCurrentIng({ nome: '', unidade: 'g', categoria: 'Secos' }); }}>
                                Cancelar
                            </Button>
                        )}
                        <Button variant="primary" className="flex-1" onClick={handleSave}>
                            <Save size={16} className="mr-2" /> Salvar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="md:col-span-2">
                <Card>
                    <CardHeader><CardTitle>Ingredientes Cadastrados ({ingredientes.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[600px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead>Unidade</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ingredientes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-neutral-500">Nenhum ingrediente cadastrado.</TableCell>
                                        </TableRow>
                                    ) : (
                                        ingredientes.map(ing => (
                                            <TableRow key={ing.id}>
                                                <TableCell className="font-medium">{ing.nome}</TableCell>
                                                <TableCell>{ing.categoria}</TableCell>
                                                <TableCell>{ing.unidade}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(ing)}>
                                                            <Edit size={16} className="text-blue-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(ing.id)}>
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Modal */}
            <Dialog
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Atenção"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={32} className="text-error" />
                    </div>
                    <p className="text-text-primary font-medium">{errorModal.message}</p>
                    <Button onClick={() => setErrorModal({ open: false, message: '' })} className="w-full">
                        OK
                    </Button>
                </div>
            </Dialog>

            {/* Delete Confirm Modal */}
            <Dialog
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                title="Confirmar Exclusão"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                        <Trash2 size={32} className="text-error" />
                    </div>
                    <p className="text-text-primary font-medium">Deseja excluir este ingrediente?</p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null })} className="flex-1">
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={confirmDelete} className="flex-1">
                            Excluir
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

