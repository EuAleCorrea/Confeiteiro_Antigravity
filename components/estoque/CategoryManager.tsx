import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Trash2, Plus, AlertCircle, X } from "lucide-react";
import { storage, Categoria } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onCallback: () => void; // Refresh parent
}

export function CategoryManager({ isOpen, onClose, onCallback }: CategoryManagerProps) {
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadCategories();
            setError('');
            setNewCategoryName('');
        }
    }, [isOpen]);

    const loadCategories = () => {
        setCategories(storage.getCategorias());
    };

    const handleAdd = () => {
        if (!newCategoryName.trim()) return;

        // Check duplicate
        if (categories.some(c => c.nome.toLowerCase() === newCategoryName.trim().toLowerCase())) {
            setError('Categoria já existe.');
            return;
        }

        const newCat: Categoria = {
            id: crypto.randomUUID(),
            nome: newCategoryName.trim()
        };

        storage.saveCategoria(newCat);
        setNewCategoryName('');
        setError('');
        loadCategories();
        onCallback();
    };

    const handleDelete = (id: string, nome: string) => {
        // Check usage
        const ingredientes = storage.getIngredientes();
        const isInUse = ingredientes.some(i => i.categoria === nome);

        if (isInUse) {
            setError(`"${nome}" possui itens vinculados.`);
            return;
        }

        if (confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`)) {
            storage.deleteCategoria(id);
            loadCategories();
            onCallback();
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="" // Disable default title to handle custom layout
            className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-2xl"
        >
            <div className="flex flex-col h-full bg-white">
                {/* Custom Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-xl font-bold text-neutral-800 tracking-tight">Gerenciar Categorias</h2>
                </div>

                <div className="p-6 pt-2 space-y-6">

                    {/* Input Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-500 ml-1">Nova Categoria</label>
                        <div className="flex gap-2 relative">
                            <input
                                value={newCategoryName}
                                onChange={(e) => {
                                    setNewCategoryName(e.target.value);
                                    setError('');
                                }}
                                placeholder="Ex: Congelados"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                className="flex-1 h-12 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                            />
                            <button
                                onClick={handleAdd}
                                disabled={!newCategoryName.trim()}
                                className="h-12 w-12 rounded-xl bg-orange-50 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={24} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 font-medium">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* List Section */}
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {categories.map((cat) => (
                            <div key={cat.id} className="group flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-all duration-200 border border-transparent hover:border-neutral-200">
                                <span className="font-medium text-neutral-700">{cat.nome}</span>
                                <button
                                    onClick={() => handleDelete(cat.id, cat.nome)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="p-8 text-center text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                                <p className="text-sm">Nenhuma categoria encontrada</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="pt-2">
                        <button
                            onClick={onClose}
                            className="w-full h-12 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold tracking-wide transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
