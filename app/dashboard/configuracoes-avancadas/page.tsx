"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import {
    Settings, Bell, Link2, Database, Shield,
    Sun, Moon, Monitor, Download, Upload,
    Check, AlertCircle, Trash2, Plus, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { supabaseStorage } from "@/lib/supabase-storage";

type TabId = "geral" | "notificacoes" | "integracoes" | "backup" | "seguranca";

const tabs: { id: TabId; label: string; icon: typeof Settings }[] = [
    { id: "geral", label: "Geral", icon: Settings },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "integracoes", label: "Integrações", icon: Link2 },
    { id: "backup", label: "Backup", icon: Database },
    { id: "seguranca", label: "Segurança", icon: Shield },
];

export default function ConfiguracoesAvancadasPage() {
    const [activeTab, setActiveTab] = useState<TabId>("geral");
    const { showToast } = useToast();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Configurações Avançadas</h1>
                <p className="text-text-secondary mt-1">
                    Personalize o sistema de acordo com suas necessidades
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            activeTab === tab.id
                                ? "bg-primary text-white"
                                : "bg-neutral-100 text-text-secondary hover:bg-neutral-200"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "geral" && <TabGeral onSave={() => showToast("success", "Configurações salvas!")} />}
                {activeTab === "notificacoes" && <TabNotificacoes onSave={() => showToast("success", "Preferências salvas!")} />}
                {activeTab === "integracoes" && <TabIntegracoes />}
                {activeTab === "backup" && <TabBackup showToast={showToast} />}
                {activeTab === "seguranca" && <TabSeguranca onSave={() => showToast("success", "Alterações salvas!")} />}
            </div>
        </div>
    );
}

// Tab Components
function TabGeral({ onSave }: { onSave: () => void }) {
    const [theme, setTheme] = useState("claro");
    const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Preferências Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Idioma</label>
                        <select className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-text-primary">
                            <option>Português (Brasil)</option>
                            <option>English</option>
                            <option>Español</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Fuso Horário</label>
                        <select className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-text-primary">
                            <option>America/Sao_Paulo</option>
                            <option>America/Manaus</option>
                            <option>America/Fortaleza</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">Formato de Data</label>
                    <div className="flex gap-4">
                        {["DD/MM/YYYY", "MM/DD/YYYY"].map((format) => (
                            <label key={format} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="dateFormat"
                                    checked={dateFormat === format}
                                    onChange={() => setDateFormat(format)}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm text-text-primary">
                                    {format} ({format === "DD/MM/YYYY" ? "06/12/2025" : "12/06/2025"})
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">Tema</label>
                    <div className="flex gap-3">
                        {[
                            { id: "claro", label: "Claro", icon: Sun },
                            { id: "escuro", label: "Escuro", icon: Moon },
                            { id: "auto", label: "Automático", icon: Monitor },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                                    theme === t.id
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-text-secondary hover:border-primary/30"
                                )}
                            >
                                <t.icon size={16} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <Button onClick={onSave}>Salvar Configurações</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function TabNotificacoes({ onSave }: { onSave: () => void }) {
    const [settings, setSettings] = useState({
        sistema: true,
        email: false,
        whatsapp: false,
        pedidos: true,
        producao: true,
        estoque: true,
        financeiro: true,
        horarioInicio: "08:00",
        horarioFim: "20:00",
    });

    const toggle = (key: keyof typeof settings) => {
        if (typeof settings[key] === "boolean") {
            setSettings({ ...settings, [key]: !settings[key] });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Preferências de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-medium text-text-primary mb-3">Canais de Notificação</h4>
                    <div className="space-y-3">
                        {[
                            { key: "sistema", label: "No sistema (badge)" },
                            { key: "email", label: "Por e-mail" },
                            { key: "whatsapp", label: "Por WhatsApp" },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <span className="text-sm text-text-primary">{item.label}</span>
                                <Toggle
                                    checked={settings[item.key as keyof typeof settings] as boolean}
                                    onChange={() => toggle(item.key as keyof typeof settings)}
                                    size="sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-text-primary mb-3">Tipos de Notificação</h4>
                    <div className="space-y-3">
                        {[
                            { key: "pedidos", label: "Pedidos" },
                            { key: "producao", label: "Produção" },
                            { key: "estoque", label: "Estoque" },
                            { key: "financeiro", label: "Financeiro" },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <span className="text-sm text-text-primary">{item.label}</span>
                                <Toggle
                                    checked={settings[item.key as keyof typeof settings] as boolean}
                                    onChange={() => toggle(item.key as keyof typeof settings)}
                                    size="sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-text-primary mb-3">Horário de Notificações</h4>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-text-secondary">Das</span>
                        <input
                            type="time"
                            value={settings.horarioInicio}
                            onChange={(e) => setSettings({ ...settings, horarioInicio: e.target.value })}
                            className="px-3 py-2 rounded-xl border border-border bg-surface"
                        />
                        <span className="text-sm text-text-secondary">às</span>
                        <input
                            type="time"
                            value={settings.horarioFim}
                            onChange={(e) => setSettings({ ...settings, horarioFim: e.target.value })}
                            className="px-3 py-2 rounded-xl border border-border bg-surface"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <Button onClick={onSave}>Salvar Preferências</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function TabIntegracoes() {
    const integrations = [
        { id: "whatsapp", name: "WhatsApp Business", status: false, icon: "📱" },
        { id: "email", name: "E-mail (SMTP)", status: false, icon: "📧" },
        { id: "calendar", name: "Google Calendar", status: false, icon: "📅" },
    ];

    return (
        <div className="space-y-4">
            {integrations.map((integration) => (
                <Card key={integration.id}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{integration.icon}</span>
                                <div>
                                    <h4 className="font-medium text-text-primary">{integration.name}</h4>
                                    <p className="text-sm text-text-secondary">
                                        Status: {integration.status ? (
                                            <span className="text-success">Conectado</span>
                                        ) : (
                                            <span className="text-text-secondary">Desconectado</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                Conectar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">💳 Gateways de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {["Mercado Pago", "PagSeguro", "Stripe"].map((gateway) => (
                            <div key={gateway} className="flex items-center justify-between">
                                <span className="text-sm text-text-primary">{gateway}</span>
                                <Toggle checked={false} onChange={() => { }} size="sm" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function TabBackup({ showToast }: { showToast: (type: "success" | "error" | "warning" | "info", message: string) => void }) {
    const [autoBackup, setAutoBackup] = useState(true);
    const [frequency, setFrequency] = useState("Diário");

    const handleExportJSON = async () => {
        try {
            showToast("info", "Gerando backup... aguarde.");

            const [
                clientes, produtos, sabores, fornecedores,
                colaboradores, orcamentos, pedidos, ingredientes,
                receitas, transacoes, contasReceber, contasPagar
            ] = await Promise.all([
                supabaseStorage.getClientes(),
                supabaseStorage.getProdutos(),
                supabaseStorage.getSabores(),
                supabaseStorage.getFornecedores(),
                supabaseStorage.getColaboradores(),
                supabaseStorage.getOrcamentos(),
                supabaseStorage.getPedidos(),
                supabaseStorage.getIngredientes(),
                supabaseStorage.getReceitas(),
                supabaseStorage.getTransacoes(),
                supabaseStorage.getContasReceber(),
                supabaseStorage.getContasPagar()
            ]);

            const data = {
                clientes,
                produtos,
                sabores,
                fornecedores,
                colaboradores,
                orcamentos,
                pedidos,
                ingredientes,
                receitas,
                transacoes,
                contasReceber,
                contasPagar,
                exportedAt: new Date().toISOString(),
                source: "Supabase"
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `backup-confeiteiro-${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast("success", "Backup exportado com sucesso!");
        } catch (error) {
            console.error("Erro ao exportar backup:", error);
            showToast("error", "Erro ao gerar backup. Tente novamente.");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">💾 Backup Automático</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">Ativar backup automático</span>
                        <Toggle
                            checked={autoBackup}
                            onChange={setAutoBackup}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Frequência</label>
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-border bg-surface"
                            >
                                <option>Diário</option>
                                <option>Semanal</option>
                                <option>Mensal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Horário</label>
                            <input
                                type="time"
                                defaultValue="02:00"
                                className="w-full px-4 py-2 rounded-xl border border-border bg-surface"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Check size={16} className="text-success" />
                        Último backup: {new Date().toLocaleDateString("pt-BR")} 02:00 - Sucesso
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">📥 Backup Manual</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleExportJSON}>
                        <Download size={16} className="mr-2" />
                        Fazer Backup Agora
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">📤 Exportar Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-text-secondary mb-3">Exportar tudo:</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleExportJSON}>
                                📄 JSON
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                📊 Excel
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <p className="text-sm text-text-secondary mb-3">Exportar módulo específico:</p>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <select className="w-full px-4 py-2 rounded-xl border border-border bg-surface">
                                    <option>Pedidos</option>
                                    <option>Clientes</option>
                                    <option>Orçamentos</option>
                                    <option>Produtos</option>
                                    <option>Estoque</option>
                                    <option>Financeiro</option>
                                </select>
                            </div>
                            <Button variant="outline">Exportar</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">📥 Importar Dados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <Upload size={32} className="mx-auto text-text-secondary mb-2" />
                        <p className="text-sm text-text-secondary mb-2">
                            Arraste um arquivo ou clique para selecionar
                        </p>
                        <p className="text-xs text-text-secondary">Formatos: JSON, Excel, CSV</p>
                        <input type="file" className="hidden" accept=".json,.xlsx,.csv" />
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-xs text-warning">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>Atenção: A importação pode substituir dados existentes</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function TabSeguranca({ onSave }: { onSave: () => void }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">🔐 Alterar Senha</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input label="Senha atual" type="password" />
                    <Input label="Nova senha" type="password" />
                    <Input label="Confirmar nova senha" type="password" />
                    <Button onClick={onSave}>Alterar Senha</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">👥 Usuários e Permissões</CardTitle>
                    <Button size="sm">
                        <Plus size={16} className="mr-2" />
                        Adicionar Usuário
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 text-text-secondary">
                                <tr>
                                    <th className="px-4 py-3 text-left">Usuário</th>
                                    <th className="px-4 py-3 text-left">Perfil</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { name: "Admin (você)", role: "Admin", status: "Ativo" },
                                    { name: "Maria", role: "Produção", status: "Ativo" },
                                    { name: "João", role: "Financeiro", status: "Inativo" },
                                ].map((user, i) => (
                                    <tr key={i} className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 font-medium">{user.name}</td>
                                        <td className="px-4 py-3">{user.role}</td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                user.status === "Ativo" ? "bg-success/10 text-success" : "bg-neutral-100 text-text-secondary"
                                            )}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!user.name.includes("você") && (
                                                <Button variant="ghost" size="sm">
                                                    <Trash2 size={14} />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-sm text-text-secondary">
                        <p className="font-medium mb-1">Perfis disponíveis:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li><strong>Admin:</strong> acesso total</li>
                            <li><strong>Financeiro:</strong> apenas financeiro</li>
                            <li><strong>Produção:</strong> pedidos e produção</li>
                            <li><strong>Atendimento:</strong> orçamentos e pedidos</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">📝 Log de Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 mb-4">
                        {[
                            { key: "acoes", label: "Registrar todas as ações", checked: true },
                            { key: "dataHora", label: "Incluir data e hora", checked: true },
                            { key: "usuario", label: "Incluir usuário responsável", checked: true },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <span className="text-sm text-text-primary">{item.label}</span>
                                <Toggle
                                    checked={item.checked}
                                    onChange={() => { }}
                                    size="sm"
                                />
                            </div>
                        ))}
                    </div>
                    <Button variant="outline">Ver Log Completo →</Button>
                </CardContent>
            </Card>
        </div>
    );
}

