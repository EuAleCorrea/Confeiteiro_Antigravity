"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { calculateProduction, ProductionPlan } from "@/components/producao/calculations";
import { TechnicalTable } from "@/components/producao/TechnicalTable";

export default function ProductionPrintPage() {
    // Default to current week start
    const [startDate, setStartDate] = useState<Date>(getMonday(new Date()));
    const [plan, setPlan] = useState<ProductionPlan>({ massas: [], recheios: [], listaCompras: [] });

    useEffect(() => {
        loadData();
    }, [startDate]);

    const loadData = () => {
        const allOrders = storage.getPedidos();
        const receitas = storage.getReceitas();
        const ingredientes = storage.getIngredientes();
        const config = storage.getConfigProducao();

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const weekOrders = allOrders.filter(o => {
            const d = new Date(o.dataEntrega + 'T00:00:00');
            return d >= startDate && d < endDate;
        });

        const productionPlan = calculateProduction(weekOrders, receitas, ingredientes, config);
        setPlan(productionPlan);
    };

    const endOfWeek = new Date(startDate);
    endOfWeek.setDate(startDate.getDate() + 6);

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return (
        <div className="bg-white min-h-screen p-8 max-w-[210mm] mx-auto">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 10mm; }
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none; }
                }
            `}} />

            {/* Controls */}
            <div className="flex items-center justify-between mb-8 no-print">
                <div className="flex items-center gap-4">
                    <Link href="/producao">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-800">Fichas de Produção</h1>
                    </div>
                </div>
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer size={18} className="mr-2" /> Imprimir
                </Button>
            </div>

            {/* Header */}
            <div className="border-b-2 border-neutral-800 pb-4 mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 uppercase tracking-tighter">Planejamento de Produção</h1>
                <div className="flex justify-between items-end mt-2">
                    <p className="text-neutral-600">Período: <strong>{formatDate(startDate)} a {formatDate(endOfWeek)}</strong></p>
                    <p className="text-sm text-neutral-400">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Massas Section */}
                <div>
                    <h2 className="text-xl font-bold text-orange-600 mb-6 uppercase border-b border-orange-200 pb-2">
                        Divisão de Massas (Tabela Técnica)
                    </h2>

                    {plan.massas.length === 0 && <p className="italic text-neutral-400">Sem produção de massas.</p>}

                    <div className="space-y-8">
                        {plan.massas.map(massa => {
                            const receita = storage.getReceitas().find(r => r.id === massa.receitaId);
                            const allIngredientes = storage.getIngredientes();

                            return (
                                <div key={massa.receitaId}>
                                    {/* Matrix Table */}
                                    <TechnicalTable
                                        massa={massa}
                                        receitas={storage.getReceitas()}
                                        ingredientes={allIngredientes}
                                    />

                                    {/* Prep Instructions */}
                                    <div className="border border-neutral-200 rounded p-4 bg-neutral-50 break-inside-avoid">
                                        <div className="flex gap-6 text-sm text-neutral-700 mb-2 font-bold uppercase">
                                            <span><span className="text-neutral-500">Forno:</span> {receita?.tempoForno || '-'}</span>
                                            <span><span className="text-neutral-500">Temp:</span> {receita?.temperatura ? `${receita.temperatura}ºC` : '-'}</span>
                                            <span><span className="text-neutral-500">Rendimento Base:</span> {receita?.rendimentoLote?.descricao}</span>
                                        </div>
                                        <div className="text-sm text-neutral-800 whitespace-pre-wrap">
                                            <span className="font-bold block mb-1 uppercase text-xs text-neutral-500">Modo de Preparo:</span>
                                            {receita?.modoPreparo || 'Sem modo de preparo cadastrado.'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recheios Section */}
                <div>
                    <h2 className="text-xl font-bold text-blue-600 mb-4 uppercase border-b border-blue-200 pb-1">Recheios</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {plan.recheios.length === 0 && <p className="italic text-neutral-400">Sem produção de recheios.</p>}
                        {plan.recheios.map(recheio => (
                            <div key={recheio.receitaId} className="break-inside-avoid border border-neutral-200 rounded p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{recheio.receitaNome}</h3>
                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold text-sm">
                                        Total: {recheio.totalPanelas}x Panelas
                                    </div>
                                </div>
                                <div className="text-xs text-neutral-500 mb-2">Peso Total Estimado: {(recheio.totalPesoGramas / 1000).toFixed(2)}kg</div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-100 text-neutral-500 text-left">
                                            <th className="py-1">Tam.</th>
                                            <th className="py-1 text-right">Camadas</th>
                                            <th className="py-1 text-right">Peso (g)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recheio.detalhes.map(d => (
                                            <tr key={d.diametro} className="border-b border-neutral-50 last:border-0">
                                                <td className="py-1">{d.diametro}cm</td>
                                                <td className="py-1 text-right">{d.camadas}</td>
                                                <td className="py-1 text-right font-bold">{d.pesoTotal}g</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getMonday(d: Date) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}
