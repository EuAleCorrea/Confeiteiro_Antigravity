"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Users,
    Search,
    Loader2,
    Check,
    AlertCircle,
    Database,
    UserPlus
} from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { createGoogleContactsService } from "@/lib/google-contacts";
import { GoogleContact } from "@/types/google.types";
import { storage, Cliente } from "@/lib/storage";

interface ImportGoogleContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
}

export function ImportGoogleContactsModal({
    isOpen,
    onClose,
    onImportSuccess
}: ImportGoogleContactsModalProps) {
    const { data: session } = useSession();
    const [contacts, setContacts] = useState<GoogleContact[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingAtBottom, setLoadingAtBottom] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [existingClients, setExistingClients] = useState<Cliente[]>([]);

    useEffect(() => {
        if (isOpen && (session as any)?.accessToken) {
            loadGoogleContacts(true);
            setExistingClients(storage.getClientes());
        }
    }, [isOpen, session]);

    async function loadGoogleContacts(isInitial = false) {
        if (isInitial) setLoading(true);
        setError(null);
        try {
            const accessToken = (session as any)?.accessToken;
            if (!accessToken) throw new Error("Token de acesso não encontrado.");

            const service = createGoogleContactsService(accessToken);
            const result = await service.listContacts(1000, isInitial ? undefined : (nextPageToken || undefined));

            if (isInitial) {
                setContacts(result.connections || []);
            } else {
                setContacts(prev => [...prev, ...(result.connections || [])]);
            }
            setNextPageToken(result.nextPageToken || null);
        } catch (err: any) {
            console.error("Erro ao carregar contatos:", err);
            setError(`Erro: ${err.message || "Não foi possível carregar os contatos do Google."}`);
        } finally {
            if (isInitial) setLoading(false);
            setLoadingAtBottom(false);
        }
    }

    async function handleLoadMore() {
        if (!nextPageToken || loadingAtBottom) return;
        setLoadingAtBottom(true);
        await loadGoogleContacts(false);
    }

    const filteredContacts = contacts
        .filter(contact => {
            const name = contact.names?.[0]?.displayName || "";
            const email = contact.emailAddresses?.[0]?.value || "";
            const phone = contact.phoneNumbers?.[0]?.value || "";
            const search = searchTerm.toLowerCase();
            return (
                name.toLowerCase().includes(search) ||
                email.toLowerCase().includes(search) ||
                phone.includes(search)
            );
        })
        .sort((a, b) => {
            const nameA = a.names?.[0]?.displayName || "";
            const nameB = b.names?.[0]?.displayName || "";
            return nameA.localeCompare(nameB);
        });

    function toggleSelect(resourceName: string) {
        const next = new Set(selectedIds);
        if (next.has(resourceName)) {
            next.delete(resourceName);
        } else {
            next.add(resourceName);
        }
        setSelectedIds(next);
    }

    function toggleSelectAll() {
        if (selectedIds.size === filteredContacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredContacts.map(c => c.resourceName)));
        }
    }

    function isAlreadyInSystem(contact: GoogleContact) {
        const email = contact.emailAddresses?.[0]?.value;
        const phone = contact.phoneNumbers?.[0]?.value?.replace(/\D/g, "");

        return existingClients.some(c =>
            (email && c.email === email) ||
            (phone && c.telefone.replace(/\D/g, "") === phone)
        );
    }

    async function handleImport() {
        setLoading(true);
        try {
            const toImport = contacts.filter(c => selectedIds.has(c.resourceName));

            toImport.forEach(googleContact => {
                const name = googleContact.names?.[0]?.displayName || "Sem Nome";
                const email = googleContact.emailAddresses?.[0]?.value || "";
                const phone = googleContact.phoneNumbers?.[0]?.value || "";

                const newCliente: Cliente = {
                    id: crypto.randomUUID(),
                    nome: name,
                    cpf: "",
                    telefone: phone,
                    email: email,
                    endereco: {
                        cep: "",
                        rua: "",
                        numero: "",
                        complemento: "",
                        bairro: "",
                        cidade: "",
                        estado: ""
                    },
                    observacoes: `Importado do Google Contacts em ${new Date().toLocaleDateString()}`
                };

                storage.saveCliente(newCliente);
            });

            onImportSuccess();
            onClose();
        } catch (err) {
            setError("Ocorreu um erro ao importar os contatos.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Importar Contatos do Google"
            className="max-w-4xl"
        >
            <div className="space-y-4 mt-4">
                {/* Search */}
                <div className="flex items-center gap-2 bg-neutral-100 p-2 rounded-xl border border-border">
                    <Search size={20} className="text-text-secondary ml-2" />
                    <input
                        type="text"
                        placeholder="Buscar nos contatos do Google..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="p-4 bg-error/10 text-error rounded-xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="border border-border rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                                <TableHead className="w-10">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={filteredContacts.length > 0 && selectedIds.size === filteredContacts.length}
                                        className="rounded border-border text-primary focus:ring-primary"
                                    />
                                </TableHead>
                                <TableHead className="w-[35%]">Nome</TableHead>
                                <TableHead className="w-[20%]">Telefone</TableHead>
                                <TableHead className="w-[30%]">E-mail</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                                        <p className="text-sm text-text-secondary mt-2">Carregando contatos...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredContacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-text-secondary">
                                        Nenhum contato encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {filteredContacts.map((contact) => {
                                        const alreadyInSystem = isAlreadyInSystem(contact);
                                        return (
                                            <TableRow key={contact.resourceName} className={alreadyInSystem ? "opacity-60 bg-neutral-50" : ""}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(contact.resourceName)}
                                                        onChange={() => toggleSelect(contact.resourceName)}
                                                        disabled={alreadyInSystem}
                                                        className="rounded border-border text-primary focus:ring-primary"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium max-w-0">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        {contact.photos?.[0]?.url && (
                                                            <img src={contact.photos[0].url} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
                                                        )}
                                                        <span className="truncate" title={contact.names?.[0]?.displayName || "Sem Nome"}>
                                                            {contact.names?.[0]?.displayName || "Sem Nome"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {contact.phoneNumbers?.[0]?.value || "-"}
                                                </TableCell>
                                                <TableCell className="truncate max-w-0" title={contact.emailAddresses?.[0]?.value || ""}>
                                                    {contact.emailAddresses?.[0]?.value || "-"}
                                                </TableCell>
                                                <TableCell className="text-right whitespace-nowrap">
                                                    {alreadyInSystem ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                            <Database size={10} />
                                                            No Sistema
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-text-secondary">Disponível</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {nextPageToken && !searchTerm && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="p-0">
                                                <button
                                                    onClick={handleLoadMore}
                                                    disabled={loadingAtBottom}
                                                    className="w-full py-4 text-sm text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 font-medium border-t border-border"
                                                >
                                                    {loadingAtBottom ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={16} />
                                                            Carregando mais...
                                                        </>
                                                    ) : (
                                                        "Mostrar mais contatos"
                                                    )}
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                    <p className="text-sm text-text-secondary">
                        {selectedIds.size} contato(s) selecionado(s)
                    </p>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button
                            onClick={handleImport}
                            disabled={selectedIds.size === 0 || loading}
                            className="gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                            Importar Selecionados
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
