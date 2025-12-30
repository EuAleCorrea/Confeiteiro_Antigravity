import { useState, useEffect } from "react";
import { storage, ConfigProducao } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Toggle } from "@/components/ui/Toggle";
import { Save, Plus, Trash2, CheckCircle, AlertTriangle } from "lucide-react";

export function TabGeral() {
    const [config, setConfig] = useState<ConfigProducao | null>(null);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    useEffect(() => {
        setConfig(storage.getConfigProducao());
    }, []);

    const handleSave = () => {
        if (config) {
            storage.saveConfigProducao(config);
            setSuccessModal(true);
        }
    };

    const updateLayerWeight = (diametro: number, gramas: number) => {
        if (!config) return;
        const newLayers = config.recheioPorCamada.map(l =>
            l.diametro === diametro ? { ...l, gramas } : l
        );
        setConfig({ ...config, recheioPorCamada: newLayers });
    };

    const addLayerConfig = () => {
        if (!config) return;
        const newDiametro = 20; // Default
        if (config.recheioPorCamada.some(l => l.diametro === newDiametro)) {
            setErrorModal({ open: true, message: 'Diâmetro já existe' });
            return;
        }

        setConfig({
            ...config,
            recheioPorCamada: [...config.recheioPorCamada, { diametro: newDiametro, gramas: 300 }].sort((a, b) => a.diametro - b.diametro)
        });
    };

    const removeLayerConfig = (diametro: number) => {
        if (!config) return;
        setConfig({
            ...config,
            recheioPorCamada: config.recheioPorCamada.filter(l => l.diametro !== diametro)
        });
    };

    if (!config) return <div>Carregando...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Padrão de Recheios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-neutral-500">
                        Defina a quantidade média de recheio (em gramas) utilizada por CAMADA para cada tamanho de bolo.
                        Isso é usado para calcular a demanda total de recheios.
                    </p>

                    <div className="space-y-3">
                        {config.recheioPorCamada.map((item) => (
                            <div key={item.diametro} className="flex items-center gap-4">
                                <div className="w-24 font-medium text-sm">
                                    {item.diametro}cm
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={item.gramas}
                                        onChange={e => updateLayerWeight(item.diametro, Number(e.target.value))}
                                        className="h-9"
                                    />
                                    <span className="text-sm text-neutral-500">gramas</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeLayerConfig(item.diametro)}>
                                    <Trash2 size={16} className="text-neutral-400 hover:text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button variant="outline" size="sm" onClick={addLayerConfig} className="w-full mt-2">
                        <Plus size={16} className="mr-2" /> Adicionar Tamanho
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Configurações Gerais</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Antecedência Mínima Padrão (Dias)"
                            type="number"
                            value={config.antecedenciaMinima || 2}
                            onChange={e => setConfig({ ...config, antecedenciaMinima: Number(e.target.value) })}
                        />

                        <div>
                            <h4 className="font-medium mb-2 text-sm text-neutral-700">Tempos de Produção (Estimativa Horas)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Massas"
                                    type="number"
                                    value={config.temposProducao?.massas || 0}
                                    onChange={e => setConfig({ ...config, temposProducao: { ...config.temposProducao!, massas: Number(e.target.value) } })}
                                />
                                <Input
                                    label="Recheios"
                                    type="number"
                                    value={config.temposProducao?.recheios || 0}
                                    onChange={e => setConfig({ ...config, temposProducao: { ...config.temposProducao!, recheios: Number(e.target.value) } })}
                                />
                                <Input
                                    label="Montagem"
                                    type="number"
                                    value={config.temposProducao?.montagem || 0}
                                    onChange={e => setConfig({ ...config, temposProducao: { ...config.temposProducao!, montagem: Number(e.target.value) } })}
                                />
                                <Input
                                    label="Decoração"
                                    type="number"
                                    value={config.temposProducao?.decoracao || 0}
                                    onChange={e => setConfig({ ...config, temposProducao: { ...config.temposProducao!, decoracao: Number(e.target.value) } })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Notificações</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Alertar sobre prazos curtos (menos de 24h)</span>
                            <Toggle
                                checked={config.notificacoes?.alertaPrazoCurto || false}
                                onChange={(checked) => setConfig({ ...config, notificacoes: { ...config.notificacoes!, alertaPrazoCurto: checked } })}
                                size="sm"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Alertar sobre estoque baixo (Ingredientes)</span>
                            <Toggle
                                checked={config.notificacoes?.alertaEstoque || false}
                                onChange={(checked) => setConfig({ ...config, notificacoes: { ...config.notificacoes!, alertaEstoque: checked } })}
                                size="sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button variant="primary" onClick={handleSave} className="w-full h-12 text-lg">
                    <Save size={20} className="mr-2" /> Salvar Todas Configurações
                </Button>
            </div>

            {/* Success Modal */}
            <Dialog
                isOpen={successModal}
                onClose={() => setSuccessModal(false)}
                title="Sucesso"
                className="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} className="text-success" />
                    </div>
                    <p className="text-text-primary font-medium">Configurações salvas!</p>
                    <Button onClick={() => setSuccessModal(false)} className="w-full">
                        OK
                    </Button>
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
