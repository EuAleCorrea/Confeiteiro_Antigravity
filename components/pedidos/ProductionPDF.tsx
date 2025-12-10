import { Pedido } from "@/lib/storage";
import { CheckSquare } from "lucide-react";

interface ProductionPDFProps {
    pedido: Pedido;
}

export function ProductionPDF({ pedido }: ProductionPDFProps) {
    return (
        <div className="p-8 bg-white text-black print:p-0 max-w-[210mm] mx-auto min-h-screen">
            <style jsx global>{`
                @page { size: A4; margin: 15mm; }
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            `}</style>

            {/* Header */}
            <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Ficha de Produção</h1>
                    <p className="text-xl font-bold mt-1">Pedido #{pedido.numero}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">Entrega: {new Date(pedido.dataEntrega).toLocaleDateString()}</p>
                    <p className="text-2xl font-black">{pedido.horaEntrega}</p>
                    <p className="text-sm font-medium uppercase mt-1 px-2 py-0.5 border border-black inline-block rounded">
                        {pedido.tipo}
                    </p>
                </div>
            </div>

            {/* Client Info (Minimal) */}
            <div className="mb-6 p-2 border border-dashed border-gray-400 rounded">
                <p className="text-sm">
                    <span className="font-bold">Cliente:</span> {pedido.cliente.nome}
                    {pedido.decoracao.descricao && <span className="ml-4 font-bold text-red-600">VER DECIRAÇÃO ABAIXO</span>}
                </p>
            </div>

            {/* Items (Large Font for Kitchen) */}
            <div className="mb-8">
                <h2 className="text-lg font-bold border-b border-black mb-4 pb-1">ITENS A PRODUZIR</h2>
                <div className="space-y-4">
                    {pedido.itens.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                            <div className="w-12 h-12 border-2 border-black flex items-center justify-center text-2xl font-black bg-gray-100 shrink-0">
                                {item.quantidade}
                            </div>
                            <div className="flex-1">
                                <p className="text-xl font-bold leading-tight">{item.nome}</p>
                                <p className="text-md text-gray-700">
                                    {item.tamanho && <span className="mr-3">Tam: <strong>{item.tamanho}</strong></span>}
                                    {item.saborMassa && <span className="mr-3">Massa: <strong>{item.saborMassa}</strong></span>}
                                    {item.saborRecheio && <span>Recheio: <strong>{item.saborRecheio}</strong></span>}
                                </p>
                            </div>
                            <div className="w-8 h-8 border border-gray-400 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decoration / Technical Details */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                {pedido.decoracao.descricao && (
                    <div className="break-inside-avoid">
                        <h2 className="text-lg font-bold border-b border-black mb-2 pb-1">DECORAÇÃO / ACABAMENTO</h2>
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded text-lg leading-relaxed whitespace-pre-wrap">
                            {pedido.decoracao.descricao}
                        </div>
                        {pedido.decoracao.observacoes && (
                            <p className="mt-2 text-sm italic">Obs: {pedido.decoracao.observacoes}</p>
                        )}
                        {/* Placeholder for images if printed in color, but mostly text for kitchen */}
                    </div>
                )}

                {pedido.producao.checklist && pedido.producao.checklist.length > 0 && (
                    <div className="break-inside-avoid">
                        <h2 className="text-lg font-bold border-b border-black mb-2 pb-1">CHECKLIST</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {pedido.producao.checklist.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <div className="w-4 h-4 border border-black"></div>
                                    <span>{item.item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Notes Section */}
            <div className="border-t-2 border-black pt-2 mt-auto">
                <p className="text-center text-xs font-bold uppercase text-gray-400">Gerado pelo Sistema Confeiteiro</p>
            </div>
        </div>
    );
}
