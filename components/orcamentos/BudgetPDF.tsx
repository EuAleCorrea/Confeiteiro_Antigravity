import { Orcamento, Configuracoes } from "@/lib/storage";

interface BudgetPDFProps {
    orcamento: Orcamento;
    config: Configuracoes;
}

export function BudgetPDF({ orcamento, config }: BudgetPDFProps) {
    return (
        <div className="max-w-[210mm] mx-auto bg-white p-8 md:p-12 shadow-none print:shadow-none">
            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b border-orange-500/30 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-orange-600 tracking-tight">{config.empresa.nome}</h1>
                    <div className="mt-2 text-sm text-neutral-600 space-y-0.5">
                        <p>{config.empresa.endereco}</p>
                        <p>{config.empresa.telefone} | {config.empresa.email}</p>
                        {config.empresa.social?.instagram && <p>Instagram: {config.empresa.social.instagram}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-light text-neutral-800">Orçamento</h2>
                    <p className="text-lg font-medium text-orange-600">#{orcamento.numero}</p>
                    <p className="text-sm text-neutral-500 mt-1">Data: {new Date(orcamento.dataCriacao).toLocaleDateString()}</p>
                    <p className="text-sm text-neutral-500">Validade: {new Date(orcamento.dataValidade).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Client Info */}
            <div className="mb-10 p-6 bg-orange-50 rounded-xl border border-orange-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 mb-3">Dados do Cliente</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-bold text-neutral-800">{orcamento.cliente.nome}</p>
                        <p className="text-neutral-600">{orcamento.cliente.telefone}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-neutral-600">
                            <strong>Entrega:</strong> {orcamento.entrega.tipo} - {new Date(orcamento.entrega.data).toLocaleDateString()}
                        </p>
                        {orcamento.entrega.endereco && (
                            <p className="text-neutral-600 opacity-80 mt-1">
                                {orcamento.entrega.endereco.rua}, {orcamento.entrega.endereco.numero}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-orange-100 text-left">
                            <th className="pb-3 pl-2 font-bold text-neutral-700">Qtd</th>
                            <th className="pb-3 font-bold text-neutral-700">Descrição</th>
                            <th className="pb-3 text-right font-bold text-neutral-700">Unitário</th>
                            <th className="pb-3 pr-2 text-right font-bold text-neutral-700">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {orcamento.itens.map((item, idx) => (
                            <tr key={idx} className="group">
                                <td className="py-4 pl-2 font-medium">{item.quantidade}x</td>
                                <td className="py-4">
                                    <p className="font-bold text-neutral-800">{item.nome}</p>
                                    <p className="text-neutral-500 text-xs mt-0.5">
                                        {item.tamanho ? `${item.tamanho}` : ''}
                                        {item.saborMassa ? ` • Massa: ${item.saborMassa}` : ''}
                                        {item.saborRecheio ? ` • Rech: ${item.saborRecheio}` : ''}
                                    </p>
                                </td>
                                <td className="py-4 text-right tabular-nums text-neutral-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario)}
                                </td>
                                <td className="py-4 pr-2 text-right tabular-nums font-medium text-neutral-800">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="pt-4 text-right text-neutral-600">Subtotal:</td>
                            <td className="pt-4 pr-2 text-right tabular-nums">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.itens.reduce((acc, i) => acc + i.subtotal, 0))}
                            </td>
                        </tr>
                        {orcamento.entrega.taxa > 0 && (
                            <tr>
                                <td colSpan={3} className="pt-2 text-right text-neutral-600">Taxa de Entrega:</td>
                                <td className="pt-2 pr-2 text-right tabular-nums">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.entrega.taxa)}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={3} className="pt-4 text-right font-bold text-lg text-orange-600">TOTAL:</td>
                            <td className="pt-4 pr-2 text-right font-bold text-lg text-orange-600 tabular-nums">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.valorTotal)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Decoration & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-xs text-neutral-600 mb-12">
                <div>
                    <h3 className="font-bold text-orange-600 mb-2 uppercase tracking-wide text-xs">Decoração</h3>
                    <p className="bg-neutral-50 p-3 rounded border border-neutral-100 italic">
                        {orcamento.decoracao.descricao || "Conforme combinado."}
                    </p>
                </div>
                <div>
                    <h3 className="font-bold text-orange-600 mb-2 uppercase tracking-wide text-xs">Formas de Pagamento</h3>
                    <p className="whitespace-pre-line">{orcamento.termos.pagamento}</p>
                </div>
            </div>

            {/* Footer Terms */}
            <div className="bg-neutral-900 text-neutral-400 p-6 rounded-lg text-xs md:text-[10px] leading-relaxed">
                <p><strong>Política de Cancelamento:</strong> {orcamento.termos.cancelamento}</p>
                <div className="mt-2 pt-2 border-t border-neutral-800 flex justify-between">
                    <span>Orçamento válido por 7 dias.</span>
                    <span>Gerado por Confeiteiro App</span>
                </div>
            </div>
        </div>
    );
}

