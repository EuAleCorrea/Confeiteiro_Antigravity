"use client";

import { Pedido } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, ClipboardList, User, Camera, AlertCircle } from "lucide-react";
import { useState } from "react";

interface TabProducaoProps {
    pedido: Pedido;
    onUpdate?: (pedido: Pedido) => void;
}

export function TabProducao({ pedido, onUpdate }: TabProducaoProps) {
    const [checklist, setChecklist] = useState(pedido.producao.checklist || []);

    const toggleItem = async (index: number) => {
        const newList = [...checklist];
        newList[index].concluido = !newList[index].concluido;
        setChecklist(newList);

        // Save to storage
        const current = await supabaseStorage.getPedido(pedido.id);
        if (current) {
            current.producao.checklist = newList;
            await supabaseStorage.savePedido(current);
            if (onUpdate) onUpdate(current as Pedido);
        }
    };

    const addChecklistItem = async () => {
        const item = prompt("Nome do item do checklist:");
        if (item) {
            const newList = [...checklist, { item, concluido: false }];
            setChecklist(newList);
            // Save
            const current = await supabaseStorage.getPedido(pedido.id);
            if (current) {
                current.producao.checklist = newList;
                await supabaseStorage.savePedido(current);
                if (onUpdate) onUpdate(current as Pedido);
            }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Technical & Team */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Equipe Responsável</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full border border-neutral-200">
                                    <User size={20} className="text-neutral-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-800">Confeiteira Principal</p>
                                    <p className="text-sm text-neutral-500">{pedido.producao.responsavel?.nome || "Não atribuído"}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Alterar</Button>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 p-3 border border-neutral-200 rounded-lg">
                                <p className="text-xs text-neutral-500 uppercase font-bold">Início Previsto</p>
                                <p className="text-sm text-neutral-800 font-mono mt-1">
                                    {pedido.producao.dataInicio ? new Date(pedido.producao.dataInicio).toLocaleString() : '-'}
                                </p>
                            </div>
                            <div className="flex-1 p-3 border border-neutral-200 rounded-lg">
                                <p className="text-xs text-neutral-500 uppercase font-bold">Término Real</p>
                                <p className="text-sm text-neutral-800 font-mono mt-1">
                                    {pedido.producao.dataTermino ? new Date(pedido.producao.dataTermino).toLocaleString() : '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes Técnicos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pedido.producao.calculosTecnicos ? (
                            <>
                                <div>
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Massas e Discos</h4>
                                    <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
                                        {pedido.producao.calculosTecnicos.discosMassa.map((d, i) => (
                                            <li key={i}>{d}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Recheios (Gramatura)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(pedido.producao.calculosTecnicos.quantidadeRecheio).map(([k, v]) => (
                                            <div key={k} className="bg-neutral-50 p-2 rounded border border-neutral-100 text-sm">
                                                <span className="font-medium">{k}:</span> {v}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6 text-neutral-500 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                                <AlertCircle className="mx-auto mb-2 text-neutral-400" />
                                <p className="text-sm">Cálculos técnicos não gerados.</p>
                                <Button variant="ghost" size="sm" className="mt-2 text-primary">Gerar Cálculos</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right: Checklist & Photos */}
            <div className="space-y-6">
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList size={18} /> Checklist de Produção
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={addChecklistItem}>+ Item</Button>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {checklist.length === 0 ? (
                            <p className="text-sm text-neutral-500 italic text-center py-4">Nenhum item no checklist.</p>
                        ) : (
                            <div className="space-y-2">
                                {checklist.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${item.concluido ? 'bg-green-50 border-green-200' : 'bg-white border-neutral-200 hover:border-primary/50'}`}
                                        onClick={() => toggleItem(idx)}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.concluido ? 'bg-green-500 border-green-500 text-white' : 'border-neutral-300'}`}>
                                            {item.concluido && <Check size={14} />}
                                        </div>
                                        <span className={`text-sm ${item.concluido ? 'text-green-800 line-through' : 'text-neutral-800'}`}>
                                            {item.item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera size={18} /> Registro Fotográfico
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                            {pedido.producao.fotos.map((foto, idx) => (
                                <div key={idx} className="aspect-square bg-neutral-100 rounded-lg relative overflow-hidden group">
                                    {/* Mock Image */}
                                    {/* <img src={foto} className="object-cover w-full h-full" /> */}
                                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-500">Foto {idx + 1}</div>
                                </div>
                            ))}
                            <button className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 hover:border-primary hover:text-primary transition-colors bg-neutral-50">
                                <PlusIcon />
                                <span className="text-xs font-medium mt-1">Adicionar</span>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    );
}
