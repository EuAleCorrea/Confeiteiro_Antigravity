import { useState, useEffect } from "react";
import { storage, Ingrediente, Receita } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Plus, Trash2, Edit, Save, ArrowLeft, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export function TabReceitas() {
    const [receitas, setReceitas] = useState<Receita[]>([]);
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [currentReceita, setCurrentReceita] = useState<Partial<Receita>>({
        nome: '',
        tipo: 'Massa',
        rendimentoLote: { descricao: '1 Receita Base', pesoTotalg: 0 },
        ingredientes: [],
        rendimentoPorDiametro: [
            { diametro: 13, quantidadeDiscos: 0 },
            { diametro: 15, quantidadeDiscos: 0 },
            { diametro: 18, quantidadeDiscos: 0 },
            { diametro: 20, quantidadeDiscos: 0 },
            { diametro: 23, quantidadeDiscos: 0 },
            { diametro: 25, quantidadeDiscos: 0 },
        ]
    });

    const [selectedIngId, setSelectedIngId] = useState('');
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setReceitas(storage.getReceitas());
        setIngredientes(storage.getIngredientes());
    };

    const handleSave = () => {
        if (!currentReceita.nome) {
            setErrorModal({ open: true, message: 'Preencha o nome' });
            return;
        }
        if ((currentReceita.ingredientes?.length || 0) === 0) {
            setErrorModal({ open: true, message: 'Adicione pelo menos um ingrediente' });
            return;
        }

        const toSave: Receita = {
            id: currentReceita.id || generateId(),
            nome: currentReceita.nome!,
            tipo: currentReceita.tipo as 'Massa' | 'Recheio',
            rendimentoLote: {
                descricao: currentReceita.rendimentoLote?.descricao || '1 Receita Base',
                pesoTotalg: Number(currentReceita.rendimentoLote?.pesoTotalg) || 0
            },
            modoPreparo: currentReceita.modoPreparo,
            tempoForno: currentReceita.tempoForno,
            temperatura: currentReceita.temperatura,
            ingredientes: currentReceita.ingredientes!,
            rendimentoPorDiametro: currentReceita.tipo === 'Massa' ? currentReceita.rendimentoPorDiametro : undefined // Only save discs yield for Dough
        };

        storage.saveReceita(toSave);
        loadData();
        cancelEdit();
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setCurrentReceita({
            nome: '',
            tipo: 'Massa',
            rendimentoLote: { descricao: '1 Receita Base', pesoTotalg: 0 },
            ingredientes: [],
            rendimentoPorDiametro: [
                { diametro: 13, quantidadeDiscos: 0 },
                { diametro: 15, quantidadeDiscos: 0 },
                { diametro: 18, quantidadeDiscos: 0 },
                { diametro: 20, quantidadeDiscos: 0 },
                { diametro: 23, quantidadeDiscos: 0 },
                { diametro: 25, quantidadeDiscos: 0 },
            ]
        });
    };

    const handleEdit = (rec: Receita) => {
        // Hydrate yields if missing specific diameters (default struct) or merge
        const defaultDiameterYields = [13, 15, 18, 20, 23, 25].map(d => ({
            diametro: d,
            quantidadeDiscos: rec.rendimentoPorDiametro?.find(p => p.diametro === d)?.quantidadeDiscos || 0
        }));

        setCurrentReceita({
            ...rec,
            rendimentoPorDiametro: defaultDiameterYields,
            // Ensure ingredients have names hydrated if needed? No, storage keeps names.
        });
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = () => {
        if (deleteModal.id) {
            storage.deleteReceita(deleteModal.id);
            loadData();
            setDeleteModal({ open: false, id: null });
        }
    };

    const addIngredient = () => {
        if (!selectedIngId) return;
        const ing = ingredientes.find(i => i.id === selectedIngId);
        if (!ing) return;

        // Check duplicate
        if (currentReceita.ingredientes?.find(i => i.ingredienteId === selectedIngId)) {
            setErrorModal({ open: true, message: 'Ingrediente já adicionado' });
            return;
        }

        const newIng = {
            ingredienteId: ing.id,
            nome: ing.nome,
            quantidade: 0,
            unidade: ing.unidade // Just for display convenience, though not strict in interface
        };

        setCurrentReceita({
            ...currentReceita,
            ingredientes: [...(currentReceita.ingredientes || []), newIng]
        });
        setSelectedIngId('');
    };

    const removeIngredient = (index: number) => {
        const newIngs = [...(currentReceita.ingredientes || [])];
        newIngs.splice(index, 1);
        setCurrentReceita({ ...currentReceita, ingredientes: newIngs });
    };

    const updateIngredientQty = (index: number, qty: number) => {
        const newIngs = [...(currentReceita.ingredientes || [])];
        newIngs[index].quantidade = qty;
        setCurrentReceita({ ...currentReceita, ingredientes: newIngs });
    };

    const updateYield = (diametro: number, qtd: number) => {
        const newYields = currentReceita.rendimentoPorDiametro?.map(y => {
            if (y.diametro === diametro) return { ...y, quantidadeDiscos: qtd };
            return y;
        }) || [];
        setCurrentReceita({ ...currentReceita, rendimentoPorDiametro: newYields });
    };

    if (isEditing) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Editor de Receita</h2>
                    <Button variant="ghost" onClick={cancelEdit}><X size={20} className="mr-2" /> Fechar</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4 md:col-span-1">
                        <Card>
                            <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Nome da Receita"
                                    value={currentReceita.nome}
                                    onChange={e => setCurrentReceita({ ...currentReceita, nome: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="tipo_rec"
                                                checked={currentReceita.tipo === 'Massa'}
                                                onChange={() => setCurrentReceita({ ...currentReceita, tipo: 'Massa' })}
                                            /> Massa
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="tipo_rec"
                                                checked={currentReceita.tipo === 'Recheio'}
                                                onChange={() => setCurrentReceita({ ...currentReceita, tipo: 'Recheio' })}
                                            /> Recheio
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        label="Tempo Forno"
                                        placeholder="Ex: 25-30min"
                                        value={currentReceita.tempoForno || ''}
                                        onChange={e => setCurrentReceita({ ...currentReceita, tempoForno: e.target.value })}
                                    />
                                    <Input
                                        label="Temp (ºC)"
                                        type="number"
                                        placeholder="180"
                                        value={currentReceita.temperatura || ''}
                                        onChange={e => setCurrentReceita({ ...currentReceita, temperatura: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Modo de Preparo</label>
                                    <textarea
                                        className="w-full text-sm p-2 border rounded-md min-h-[100px]"
                                        placeholder="Descreva o passo a passo..."
                                        value={currentReceita.modoPreparo || ''}
                                        onChange={e => setCurrentReceita({ ...currentReceita, modoPreparo: e.target.value })}
                                    />
                                </div>
                                <Input
                                    label="Descrição do Rendimento (ex: 1 Panela)"
                                    value={currentReceita.rendimentoLote?.descricao}
                                    onChange={e => setCurrentReceita({ ...currentReceita, rendimentoLote: { ...currentReceita.rendimentoLote!, descricao: e.target.value } })}
                                />
                                {currentReceita.tipo === 'Recheio' && (
                                    <Input
                                        label="Peso Total Rendido (g) - Importante para Cálculos"
                                        type="number"
                                        value={currentReceita.rendimentoLote?.pesoTotalg || ''}
                                        onChange={e => setCurrentReceita({ ...currentReceita, rendimentoLote: { ...currentReceita.rendimentoLote!, pesoTotalg: Number(e.target.value) } })}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Yields (Massas only) */}
                        {currentReceita.tipo === 'Massa' && (
                            <Card>
                                <CardHeader><CardTitle>Rendimentos por Diâmetro</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-xs text-neutral-500">Quantos discos esta receita rende para cada tamanho?</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {currentReceita.rendimentoPorDiametro?.map((y) => (
                                            <div key={y.diametro} className="flex items-center gap-2">
                                                <span className="text-sm font-bold w-12">{y.diametro}cm:</span>
                                                <Input
                                                    type="number"
                                                    className="h-8 text-center"
                                                    value={y.quantidadeDiscos || ''}
                                                    onChange={e => updateYield(y.diametro, Number(e.target.value))}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Ingredients */}
                    <div className="md:col-span-2 space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle>Ingredientes</CardTitle>
                                <div className="flex gap-2 w-1/2">
                                    <select
                                        className="flex-1 p-2 border border-neutral-300 rounded-lg text-sm"
                                        value={selectedIngId}
                                        onChange={e => setSelectedIngId(e.target.value)}
                                    >
                                        <option value="">Adicionar Ingrediente...</option>
                                        {ingredientes.map(i => (
                                            <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>
                                        ))}
                                    </select>
                                    <Button size="sm" onClick={addIngredient}><Plus size={16} /></Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ingrediente</TableHead>
                                            <TableHead className="w-32">Qtd</TableHead>
                                            <TableHead className="w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentReceita.ingredientes?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-neutral-500">Adicione ingredientes à receita.</TableCell>
                                            </TableRow>
                                        ) : (
                                            currentReceita.ingredientes?.map((ing, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{ing.nome}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={ing.quantidade || ''}
                                                            onChange={e => updateIngredientQty(idx, Number(e.target.value))}
                                                            className="h-8"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" onClick={() => removeIngredient(idx)}>
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                            <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSave}><Save size={18} className="mr-2" /> Salvar Receita</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Input placeholder="Buscar receitas..." className="max-w-sm" />
                <Button onClick={() => { cancelEdit(); setIsEditing(true); }}>
                    <Plus size={18} className="mr-2" /> Nova Receita
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receitas.map(rec => (
                    <Card key={rec.id} className="hover:shadow-md transition-shadow relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => handleEdit(rec)}><Edit size={14} /></Button>
                            <Button variant="danger" size="icon" className="h-8 w-8" onClick={() => handleDelete(rec.id)}><Trash2 size={14} /></Button>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{rec.nome}</h3>
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded-full uppercase font-bold",
                                        rec.tipo === 'Massa' ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"
                                    )}>
                                        {rec.tipo}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-600 mb-2">
                                Base: <strong>{rec.rendimentoLote.descricao}</strong>
                                {rec.rendimentoLote.pesoTotalg ? ` (~${rec.rendimentoLote.pesoTotalg}g)` : ''}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {rec.ingredientes.length} ingredientes cadastrados
                            </p>
                        </CardContent>
                    </Card>
                ))}
                {receitas.length === 0 && (
                    <div className="col-span-full py-12 text-center text-neutral-500 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                        Nenhuma receita cadastrada. Clique em "Nova Receita" para começar.
                    </div>
                )}
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
                    <p className="text-text-primary font-medium">Deseja excluir esta receita?</p>
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
