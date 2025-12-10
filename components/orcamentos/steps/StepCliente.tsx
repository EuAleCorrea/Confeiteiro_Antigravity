"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { storage, Cliente, Orcamento } from "@/lib/storage";

interface StepProps {
    data: Partial<Orcamento>;
    onUpdate: (data: Partial<Orcamento>) => void;
    // Note: Navigation is handled by parent Wizard via Context or we just update data here.
    // The Wizard component we built earlier doesn't pass "next" trigger down.
    // We need to either add navigation buttons HERE or update the Wizard component to accept a ref/trigger.
    // For simplicity: We will render the Next/Back buttons inside the Step Component 
    // BUT the Wizard component controls the visual step. 
    // Let's adjust - actually the Wizard component I built earlier DOES NOT render buttons.
    // It expects buttons to be rendered.
    // Wait, I didn't verify Wizard.tsx buttons. 
    // "For this specific implementation, I'll pass next/back controls to the children components? No, standard wizard pattern is buttons at bottom."
    // My Wizard.tsx has no buttons. So I must render them here.
}

// We need to access Wizard navigation. Best way is to pass it as props from the parent (NovoOrcamentoPage page.tsx needs to use a custom Wizard hook or just manage state itself).
// But `NovoOrcamentoPage` uses `<Wizard>` which manages state internally. 
// I should update `Wizard` to expose next/back functions or accept a "footer" render prop.
// Or simpler: The Wizard component passes `next` and `back` props to the rendered component.
// Let's assume I'll update Wizard.tsx to cloneElement with props.

interface WizardStepProps extends StepProps {
    next?: () => void;
    back?: () => void;
    isLast?: boolean;
    isFirst?: boolean;
}

export default function StepCliente({ data, onUpdate, next, back }: WizardStepProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [showNewClient, setShowNewClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ nome: '', telefone: '', email: '' });

    useEffect(() => {
        // Load clients for autocomplete
        if (searchTerm.length >= 2) {
            const all = storage.getClientes();
            const filtered = all.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));
            setClientes(filtered);
        } else {
            setClientes([]);
        }
    }, [searchTerm]);

    function selectCliente(cliente: Cliente) {
        onUpdate({
            cliente: {
                id: cliente.id,
                nome: cliente.nome,
                telefone: cliente.telefone,
                email: cliente.email
            },
            // Auto-fill address if type is Delivery? We'll handle that in Step 3.
        });
        setSearchTerm(""); // clear search
    }

    function handleCreateClient() {
        if (!newClientData.nome || !newClientData.telefone) return;

        const newCliente: Cliente = {
            id: crypto.randomUUID(),
            nome: newClientData.nome,
            telefone: newClientData.telefone,
            email: newClientData.email,
            cpf: '',
            endereco: { cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }
        };

        storage.saveCliente(newCliente);
        selectCliente(newCliente);
        setShowNewClient(false);
    }

    const selectedCliente = data.cliente;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-xl font-semibold">Quem é o cliente?</h2>
                <p className="text-text-secondary">Busque um cliente cadastrado ou adicione um novo.</p>
            </div>

            {selectedCliente ? (
                <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{selectedCliente.nome}</h3>
                                <p className="text-text-secondary">{selectedCliente.telefone}</p>
                                {selectedCliente.email && <p className="text-text-secondary text-sm">{selectedCliente.email}</p>}
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onUpdate({ cliente: undefined })}>
                            Trocar
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-text-secondary" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            className="w-full pl-10 h-12 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />

                        {/* Autocomplete Dropdown */}
                        {clientes.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                                {clientes.map(c => (
                                    <button
                                        key={c.id}
                                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex justify-between items-center transition-colors"
                                        onClick={() => selectCliente(c)}
                                    >
                                        <span className="font-medium">{c.nome}</span>
                                        <span className="text-sm text-text-secondary">{c.telefone}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface px-2 text-text-secondary">Ou</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full py-6 border-dashed"
                        onClick={() => setShowNewClient(!showNewClient)}
                    >
                        <UserPlus className="mr-2" size={20} />
                        Cadastrar Novo Cliente Rápido
                    </Button>

                    {showNewClient && (
                        <div className="p-4 border border-border rounded-xl bg-neutral-50 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <Input
                                label="Nome Completo *"
                                value={newClientData.nome}
                                onChange={e => setNewClientData({ ...newClientData, nome: e.target.value })}
                            />
                            <Input
                                label="Telefone *"
                                value={newClientData.telefone}
                                onChange={e => setNewClientData({ ...newClientData, telefone: e.target.value })}
                            />
                            <Input
                                label="E-mail"
                                value={newClientData.email}
                                onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}
                            />
                            <Button className="w-full" onClick={handleCreateClient}>
                                Confirmar Cadastro
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Actions */}
            <div className="flex justify-between pt-8 border-t border-border mt-8">
                <Button variant="ghost" onClick={back} disabled={!back}>Cancelar</Button>
                <Button onClick={next} disabled={!selectedCliente}>Próximo: Itens</Button>
            </div>
        </div>
    );
}
