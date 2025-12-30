"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Smartphone,
    Wifi,
    WifiOff,
    Loader2,
    Trash2,
    MessageCircle,
    QrCode,
    Settings,
    RefreshCw,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import evolutionAPI, {
    WhatsAppInstance,
    loadEvolutionConfig,
    saveEvolutionConfig,
    WhatsAppConfig
} from "@/lib/evolution-api";

type ConnectionStatus = 'close' | 'connecting' | 'open';

const statusConfig: Record<ConnectionStatus, { label: string; color: string; icon: React.ElementType }> = {
    close: { label: 'Desconectado', color: 'bg-error/10 text-error', icon: WifiOff },
    connecting: { label: 'Conectando...', color: 'bg-warning/10 text-warning', icon: Loader2 },
    open: { label: 'Conectado', color: 'bg-success/10 text-success', icon: Wifi },
};

export function WhatsAppSettings() {
    const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModal, setCreateModal] = useState(false);
    const [configModal, setConfigModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; instance: WhatsAppInstance | null }>({ open: false, instance: null });
    const [newInstanceName, setNewInstanceName] = useState('');
    const [creating, setCreating] = useState(false);
    const [config, setConfig] = useState<WhatsAppConfig>({ apiUrl: 'https://apiwp.automacaototal.com', apiKey: '', instanceName: '' });
    const [isConfigured, setIsConfigured] = useState(false);
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    // Load config and instances on mount
    useEffect(() => {
        const savedConfig = loadEvolutionConfig();
        if (savedConfig) {
            setConfig(savedConfig);
            setIsConfigured(true);
            loadInstances(savedConfig.instanceName);
        } else {
            setLoading(false);
            setConfigModal(true);
        }
    }, []);

    const loadInstances = async (nameFilter?: string) => {
        setLoading(true);
        try {
            // IMPORTANT: Only fetch the SPECIFIC instance saved in localStorage
            // Do NOT fetch all instances - the API is shared across multiple clients
            const targetName = nameFilter || config.instanceName;

            // If no instance name is configured, show empty state (user needs to create one)
            if (!targetName) {
                setInstances([]);
                setLoading(false);
                return;
            }

            // Fetch only the specific instance by name
            const data = await evolutionAPI.fetchInstances(targetName);

            // Fetch real-time status for the instance
            const updatedData = await Promise.all(data.map(async (instance) => {
                try {
                    const stateData = await evolutionAPI.getConnectionState(instance.instanceName);
                    let realStatus = stateData?.instance?.state || 'close';
                    if ((realStatus as string) === 'connected') realStatus = 'open';
                    return { ...instance, status: realStatus as any };
                } catch (e) {
                    return instance;
                }
            }));

            setInstances(updatedData);
        } catch (error) {
            console.error('Erro ao carregar instâncias:', error);
            // If instance not found (404), clear it from config so user can create a new one
            if ((error as any)?.status === 404) {
                console.log('[WhatsApp] Instance not found, clearing config');
                const newConfig = { ...config, instanceName: '' };
                setConfig(newConfig);
                saveEvolutionConfig(newConfig);
                setInstances([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        saveEvolutionConfig(config);
        setIsConfigured(true);
        setConfigModal(false);

        // Test connection
        const success = await evolutionAPI.testConnection();
        if (success) {
            loadInstances();
        } else {
            setErrorModal({ open: true, message: 'Não foi possível conectar à API. Verifique suas credenciais.' });
        }
    };

    const handleCreateInstance = async () => {
        if (!newInstanceName.trim()) return;

        const name = newInstanceName.trim().toLowerCase().replace(/\s+/g, '-');
        setCreating(true);
        try {
            await evolutionAPI.createInstance(name);

            // Salva o novo nome da instância na configuração local
            const newConfig = { ...config, instanceName: name };
            setConfig(newConfig);
            saveEvolutionConfig(newConfig);

            setCreateModal(false);
            setNewInstanceName('');
            loadInstances(name);
        } catch (error) {
            console.error('Erro ao criar instância:', error);
            setErrorModal({ open: true, message: 'Erro ao criar instância. Tente novamente.' });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteInstance = async () => {
        if (!deleteModal.instance) return;

        try {
            await evolutionAPI.deleteInstance(deleteModal.instance.instanceName);

            // Se a instância deletada for a configurada, limpa a configuração
            if (config.instanceName === deleteModal.instance.instanceName) {
                const newConfig = { ...config, instanceName: '' };
                setConfig(newConfig);
                saveEvolutionConfig(newConfig);
            }

            setDeleteModal({ open: false, instance: null });
            loadInstances();
        } catch (error) {
            console.error('Erro ao deletar instância:', error);
            setErrorModal({ open: true, message: 'Erro ao deletar instância.' });
        }
    };

    const getInstanceStatus = (instance: WhatsAppInstance): ConnectionStatus => {
        if (instance.status === 'open') return 'open';
        if (instance.status === 'connecting') return 'connecting';
        return 'close';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                        <MessageCircle className="text-green-600" size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Conexão WhatsApp</h2>
                        <p className="text-text-secondary">Gerencie suas conexões e instâncias</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => setConfigModal(true)}>
                        <Settings size={18} className="mr-2" />
                        Configurar API
                    </Button>
                    <Button type="button" onClick={() => setCreateModal(true)} disabled={!isConfigured}>
                        <Plus size={20} className="mr-2" />
                        Nova Instância
                    </Button>
                </div>
            </div>

            {/* Not Configured Warning */}
            {!isConfigured && (
                <Card className="border-warning bg-warning/5">
                    <CardContent className="py-8 text-center">
                        <Settings size={48} className="mx-auto text-warning mb-4" />
                        <h3 className="font-bold text-lg text-text-primary mb-2">Configure a Evolution API</h3>
                        <p className="text-text-secondary mb-4">
                            Para usar o WhatsApp, configure sua API Key da Evolution API.
                        </p>
                        <Button type="button" onClick={() => setConfigModal(true)}>
                            Configurar Agora
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Instances Grid */}
            {isConfigured && (
                <>
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-text-primary">Instâncias ({instances.length})</h2>
                        <Button variant="ghost" size="sm" type="button" onClick={() => loadInstances()} disabled={loading}>
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : instances.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Smartphone size={48} className="mx-auto text-text-secondary/50 mb-4" />
                                <h3 className="font-medium text-text-primary mb-2">Nenhuma instância</h3>
                                <p className="text-text-secondary text-sm mb-4">
                                    Crie uma instância para conectar seu WhatsApp
                                </p>
                                <Button type="button" onClick={() => setCreateModal(true)}>
                                    <Plus size={18} className="mr-2" />
                                    Criar Primeira Instância
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {instances.map((instance) => {
                                const status = getInstanceStatus(instance);
                                const statusInfo = statusConfig[status];
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <Card key={instance.instanceName} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <MessageCircle size={20} className="text-green-600" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base">{instance.instanceName}</CardTitle>
                                                        {instance.profileName && (
                                                            <p className="text-xs text-text-secondary">{instance.profileName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge className={statusInfo.color}>
                                                    <StatusIcon size={12} className={status === 'connecting' ? 'animate-spin mr-1' : 'mr-1'} />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex gap-2">
                                                {status === 'open' ? (
                                                    <div className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-success bg-success/10 rounded-md border border-success/20 h-9">
                                                        <Wifi size={16} />
                                                        Conectado
                                                    </div>
                                                ) : (
                                                    <Link href={`/whatsapp/${instance.instanceName}/connect`} className="flex-1">
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            <QrCode size={16} className="mr-2" />
                                                            Conectar
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-error"
                                                    onClick={() => setDeleteModal({ open: true, instance })}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Create Instance Modal */}
            <Dialog
                isOpen={createModal}
                onClose={() => setCreateModal(false)}
                title="Nova Instância WhatsApp"
                className="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Nome da Instância
                        </label>
                        <Input
                            value={newInstanceName}
                            onChange={(e) => setNewInstanceName(e.target.value)}
                            placeholder="ex: minha-confeitaria"
                        />
                        <p className="text-xs text-text-secondary mt-1">
                            Use apenas letras, números e hífens
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setCreateModal(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateInstance}
                            className="flex-1"
                            disabled={!newInstanceName.trim() || creating}
                        >
                            {creating ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus size={16} className="mr-2" />}
                            Criar
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Config Modal */}
            <Dialog
                isOpen={configModal}
                onClose={() => setConfigModal(false)}
                title="Configurar Evolution API"
                className="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            URL da API
                        </label>
                        <Input
                            value={config.apiUrl}
                            onChange={(e) => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                            placeholder="https://apiwp.automacaototal.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            API Key
                        </label>
                        <Input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="Sua chave de API"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Nome da Instância (Opcional)
                        </label>
                        <Input
                            value={config.instanceName}
                            onChange={(e) => setConfig(prev => ({ ...prev, instanceName: e.target.value }))}
                            placeholder="Nome para filtrar sua instância"
                        />
                    </div>
                    <div className="flex gap-3">
                        {isConfigured && (
                            <Button variant="outline" onClick={() => setConfigModal(false)} className="flex-1">
                                Cancelar
                            </Button>
                        )}
                        <Button
                            onClick={handleSaveConfig}
                            className="flex-1"
                            disabled={!config.apiKey}
                        >
                            Salvar Configuração
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Modal */}
            <Dialog
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, instance: null })}
                title="Excluir Instância"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                        <Trash2 size={32} className="text-error" />
                    </div>
                    <p className="text-text-primary">
                        Deseja excluir a instância <strong>{deleteModal.instance?.instanceName}</strong>?
                    </p>
                    <p className="text-sm text-text-secondary">
                        Isso desconectará o WhatsApp e excluirá todos os dados.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setDeleteModal({ open: false, instance: null })} className="flex-1">
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleDeleteInstance} className="flex-1">
                            Excluir
                        </Button>
                    </div>
                </div>
            </Dialog>

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
        </div>
    );
}
