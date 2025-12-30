"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, TrendingUp, Receipt, CreditCard, Users, Calendar, Target, AlertTriangle, Download, X } from "lucide-react";

interface Report {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    href?: string;
}

const reports: Report[] = [
    { id: 'fluxo', title: 'Fluxo de Caixa', description: 'Entradas e saídas por período', icon: <TrendingUp className="w-6 h-6" />, color: 'blue', href: '/financeiro/fluxo-caixa' },
    { id: 'dre', title: 'DRE Mensal', description: 'Demonstrativo de resultados', icon: <FileText className="w-6 h-6" />, color: 'purple', href: '/financeiro/dre' },
    { id: 'receber', title: 'Contas a Receber', description: 'Relatório de recebíveis', icon: <Receipt className="w-6 h-6" />, color: 'green', href: '/financeiro/contas-receber' },
    { id: 'pagar', title: 'Contas a Pagar', description: 'Relatório de pagáveis', icon: <CreditCard className="w-6 h-6" />, color: 'red', href: '/financeiro/contas-pagar' },
    { id: 'rentabilidade', title: 'Rentabilidade', description: 'Análise por produto', icon: <Target className="w-6 h-6" />, color: 'orange' },
    { id: 'clientes', title: 'Top Clientes', description: 'Ranking de clientes', icon: <Users className="w-6 h-6" />, color: 'pink' },
    { id: 'vendas', title: 'Vendas por Período', description: 'Histórico de vendas', icon: <Calendar className="w-6 h-6" />, color: 'indigo' },
    { id: 'inadimplencia', title: 'Inadimplência', description: 'Contas em atraso', icon: <AlertTriangle className="w-6 h-6" />, color: 'yellow' },
];

const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', hover: 'hover:bg-green-100' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', hover: 'hover:bg-red-100' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', hover: 'hover:bg-pink-100' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', hover: 'hover:bg-yellow-100' },
};

export default function RelatoriosPage() {
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const handleReportClick = (report: Report) => {
        if (report.href) {
            // Navigate directly
            window.location.href = report.href;
        } else {
            // Show config modal
            setSelectedReport(report);
            setShowModal(true);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/financeiro" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-neutral-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800">📊 Centro de Relatórios</h1>
                    <p className="text-sm text-neutral-500">Gere relatórios financeiros e gerenciais</p>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {reports.map(report => {
                    const colors = colorClasses[report.color];
                    return (
                        <button
                            key={report.id}
                            onClick={() => handleReportClick(report)}
                            className={`${colors.bg} ${colors.border} ${colors.hover} border rounded-xl p-5 text-left transition-all hover:shadow-md group`}
                        >
                            <div className={`${colors.text} mb-3 group-hover:scale-110 transition-transform`}>
                                {report.icon}
                            </div>
                            <h3 className="font-bold text-neutral-800 mb-1">{report.title}</h3>
                            <p className="text-xs text-neutral-500">{report.description}</p>
                            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-neutral-600">
                                <Download className="w-3 h-3" /> Gerar
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="mt-10">
                <h2 className="text-lg font-bold text-neutral-800 mb-4">📈 Resumo Rápido</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                        <p className="text-xs text-neutral-500 mb-1">Relatórios Disponíveis</p>
                        <p className="text-2xl font-bold text-neutral-800">{reports.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                        <p className="text-xs text-neutral-500 mb-1">Categorias</p>
                        <p className="text-2xl font-bold text-neutral-800">3</p>
                        <p className="text-xs text-neutral-400">Financeiro, Vendas, Clientes</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                        <p className="text-xs text-neutral-500 mb-1">Formatos</p>
                        <p className="text-2xl font-bold text-neutral-800">PDF</p>
                        <p className="text-xs text-neutral-400">Impressão otimizada</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                        <p className="text-xs text-neutral-500 mb-1">Última Geração</p>
                        <p className="text-lg font-bold text-neutral-800">-</p>
                        <p className="text-xs text-neutral-400">Nenhum ainda</p>
                    </div>
                </div>
            </div>

            {/* Config Modal */}
            {showModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                            <h2 className="text-xl font-bold text-neutral-800">Gerar: {selectedReport.title}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700">Período</label>
                                <select className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                                    <option>Dezembro 2025</option>
                                    <option>Novembro 2025</option>
                                    <option>Outubro 2025</option>
                                    <option>Último trimestre</option>
                                    <option>Ano 2025</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700">Formato</label>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100">
                                        <input type="radio" name="format" defaultChecked className="text-orange-600" />
                                        <span className="text-sm">PDF</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100 opacity-50">
                                        <input type="radio" name="format" disabled />
                                        <span className="text-sm">Excel</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100 opacity-50">
                                        <input type="radio" name="format" disabled />
                                        <span className="text-sm">CSV</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" defaultChecked className="rounded text-orange-600" />
                                    Incluir gráficos
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" className="rounded text-orange-600" />
                                    Comparar com período anterior
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-3 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-xl hover:bg-neutral-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowInfoModal(true);
                                        setShowModal(false);
                                    }}
                                    className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700"
                                >
                                    Gerar Relatório
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {showInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-neutral-800 font-medium">Funcionalidade de exportação em desenvolvimento!</p>
                        <button
                            onClick={() => setShowInfoModal(false)}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
