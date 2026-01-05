"use client";

import { Menu, User, Search, Settings, HelpCircle, Sliders, LogOut, X, FileText, ShoppingBag, Package, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationPanel } from "./NotificationPanel";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    // Load user data
    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }
        loadUser();
    }, [supabase.auth]);

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Ctrl+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === "Escape") {
                setSearchOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border bg-surface px-3 md:px-4 lg:px-6 shadow-sm">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMenuClick}
                        className="lg:hidden min-w-[44px] min-h-[44px]"
                    >
                        <Menu size={24} />
                    </Button>

                    {/* Search trigger - Mobile */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 text-text-secondary hover:bg-neutral-200 transition-colors"
                        aria-label="Buscar"
                    >
                        <Search size={20} />
                    </button>

                    {/* Search trigger - Desktop */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 text-text-secondary hover:bg-neutral-200 transition-colors"
                    >
                        <Search size={16} />
                        <span className="text-sm">Buscar...</span>
                        <kbd className="text-xs bg-neutral-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
                    </button>
                </div>




                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <NotificationPanel />

                    {/* User menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 pl-3 border-l border-divider hover:opacity-80 transition-opacity"
                        >
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-text-primary">
                                    {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuário'}
                                </p>
                                <p className="text-xs text-text-secondary">{user?.email || ''}</p>
                            </div>
                            {user?.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Avatar"
                                    className="h-10 w-10 rounded-full border border-primary/20"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <User size={20} />
                                </div>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-surface border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                                <div className="py-1">
                                    <Link
                                        href="/ajuda"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <HelpCircle size={18} />
                                        <span>Ajuda</span>
                                    </Link>
                                    <Link
                                        href="/configuracoes"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <Settings size={18} />
                                        <span>Configurações</span>
                                    </Link>
                                    <Link
                                        href="/configuracoes-avancadas"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <Sliders size={18} />
                                        <span>Config. Avançadas</span>
                                    </Link>
                                    <div className="my-1 border-t border-divider" />
                                    <button
                                        onClick={async () => {
                                            setUserMenuOpen(false);
                                            const supabase = createClient();
                                            await supabase.auth.signOut();
                                            router.push("/login");
                                            router.refresh();
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>Sair</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header >

            {/* Search Modal */}
            {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
        </>
    );
}

// Inline SearchModal component
import { storage } from "@/lib/storage";

interface SearchResult {
    type: "cliente" | "pedido" | "orcamento" | "produto" | "fornecedor";
    id: string;
    title: string;
    subtitle?: string;
    href: string;
}

const typeConfig = {
    cliente: { icon: User, label: "Clientes", color: "text-blue-500" },
    pedido: { icon: ShoppingBag, label: "Pedidos", color: "text-primary" },
    orcamento: { icon: FileText, label: "Orçamentos", color: "text-purple-500" },
    produto: { icon: Package, label: "Produtos", color: "text-green-500" },
    fornecedor: { icon: Truck, label: "Fornecedores", color: "text-orange-500" },
};

function SearchModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const search = useCallback((q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }

        const searchResults: SearchResult[] = [];
        const lowerQuery = q.toLowerCase();

        // Search clientes
        storage.getClientes()
            .filter((c) => c.nome.toLowerCase().includes(lowerQuery) || c.telefone.includes(q))
            .slice(0, 3)
            .forEach((c) => {
                searchResults.push({
                    type: "cliente",
                    id: c.id,
                    title: c.nome,
                    subtitle: c.telefone,
                    href: `/clientes?search=${c.nome}`,
                });
            });

        // Search pedidos
        storage.getPedidos()
            .filter((p) => p.numero.toString().includes(q) || p.cliente.nome.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .forEach((p) => {
                searchResults.push({
                    type: "pedido",
                    id: p.id,
                    title: `#${p.numero} - ${p.cliente.nome}`,
                    subtitle: `${p.status} • R$ ${p.financeiro.valorTotal.toFixed(2)}`,
                    href: `/pedidos/${p.id}`,
                });
            });

        // Search orçamentos
        storage.getOrcamentos()
            .filter((o) => o.numero.toString().includes(q) || o.cliente.nome.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .forEach((o) => {
                searchResults.push({
                    type: "orcamento",
                    id: o.id,
                    title: `#${o.numero} - ${o.cliente.nome}`,
                    subtitle: `${o.status} • R$ ${o.valorTotal.toFixed(2)}`,
                    href: `/orcamentos/${o.id}`,
                });
            });

        // Search produtos
        storage.getProdutos()
            .filter((p) => p.nome.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .forEach((p) => {
                searchResults.push({
                    type: "produto",
                    id: p.id,
                    title: p.nome,
                    subtitle: `${p.categoria} • R$ ${p.preco.toFixed(2)}`,
                    href: `/produtos?search=${p.nome}`,
                });
            });

        // Search fornecedores
        storage.getFornecedores()
            .filter((f) => f.nomeFantasia.toLowerCase().includes(lowerQuery) || f.razaoSocial.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .forEach((f) => {
                searchResults.push({
                    type: "fornecedor",
                    id: f.id,
                    title: f.nomeFantasia || f.razaoSocial,
                    subtitle: f.categoria,
                    href: `/fornecedores?search=${f.nomeFantasia}`,
                });
            });

        setResults(searchResults);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => search(query), 300);
        return () => clearTimeout(timer);
    }, [query, search]);

    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.type]) acc[result.type] = [];
        acc[result.type].push(result);
        return acc;
    }, {} as Record<string, SearchResult[]>);

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-surface rounded-2xl shadow-2xl overflow-hidden mx-4">
                <div className="flex items-center gap-3 px-4 border-b border-border">
                    <Search size={20} className="text-text-secondary shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar em tudo..."
                        className="flex-1 py-4 bg-transparent text-text-primary placeholder:text-text-secondary outline-none"
                    />
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {query && results.length === 0 && (
                        <div className="py-8 text-center text-text-secondary">
                            <p>Nenhum resultado para "{query}"</p>
                        </div>
                    )}

                    {Object.entries(groupedResults).map(([type, items]) => {
                        const config = typeConfig[type as keyof typeof typeConfig];
                        const Icon = config.icon;

                        return (
                            <div key={type}>
                                <div className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase bg-neutral-50">
                                    {config.label} ({items.length})
                                </div>
                                {items.map((result) => (
                                    <Link
                                        key={result.id}
                                        href={result.href}
                                        onClick={onClose}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
                                    >
                                        <div className={cn("p-2 rounded-lg bg-neutral-100", config.color)}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{result.title}</p>
                                            {result.subtitle && (
                                                <p className="text-xs text-text-secondary truncate">{result.subtitle}</p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        );
                    })}

                    {!query && (
                        <div className="py-8 text-center text-text-secondary">
                            <p className="text-sm">Digite para buscar...</p>
                            <p className="text-xs mt-2 opacity-60">
                                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-xs">ESC</kbd> para fechar
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
