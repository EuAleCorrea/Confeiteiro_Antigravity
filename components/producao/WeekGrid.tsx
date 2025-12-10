import { Pedido } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface WeekGridProps {
    startDate: Date;
    orders: Pedido[];
}

export function WeekGrid({ startDate, orders }: WeekGridProps) {
    // Generate 7 days from startDate
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d;
    });

    // Helper to get orders for a day
    const getOrdersForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        return orders.filter(o => o.dataEntrega === dateStr).sort((a, b) => a.horaEntrega.localeCompare(b.horaEntrega));
    };

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    const formatDay = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');

    // Mock functionality for "Folga" (Day Off) - In real app, this would come from roster
    const getFolga = (date: Date) => {
        const d = date.getDay();
        if (d === 1) return "GINA"; // Seg
        if (d === 2) return "RICARDO"; // Ter
        return null;
    };

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[1200px] border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">

                {/* Table Header */}
                <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-neutral-100 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    <div className="p-3 border-r border-neutral-200 flex items-center justify-center bg-neutral-50">#</div>
                    {days.map((day, i) => (
                        <div key={i} className={cn(
                            "p-2 text-center border-r border-neutral-200 last:border-r-0 flex flex-col justify-center",
                            day.toDateString() === new Date().toDateString() ? "bg-orange-50 text-orange-800" : ""
                        )}>
                            <div className="text-[10px] text-neutral-500 mb-0.5">{formatDay(day)}</div>
                            <div className="text-sm font-black">{formatDate(day)}</div>
                        </div>
                    ))}
                </div>

                {/* Data Rows (Transposed Logic: We show rows as attributes? No, spec shows Columns as Days) 
                    The spec shows a matrix:
                    Rows: DATA, CLIENTE, TAMANHO, SABOR, OBS, E/R, HORA, COLABORADOR, FOLGA
                    Cols: Days of the week
                */}

                {/* We need to render ONE cell per day, but that cell contains a STACK of orders? 
                   The spec image actually shows specific rows for attributes, but multiple ORDERS per day would break this grid if it's strictly 1 column per day.
                   Looking at the ascii art:
                   | CLIENT | RICARDO | GINA | ...
                   This implies usually 1 major order per day or just listing them? 
                   "Visualização rápida de todos os pedidos"
                   If there are multiple orders, the cell needs to accommodate them or repeat the column?
                   Actually, the ASCII table shows Dates as Columns (SEG, TER...).
                   And rows are attributes of A SINGLE ORDER??
                   "RICARDO", "GINA" are Clients.
                   It seems ideally suited for a daily route, but if there are 5 orders on Friday?
                   
                   Let's stick to the visual grid "Panorama Geral" but adapted:
                   Vertical list of orders per DAY column makes more sense for a web app than a rigid spreadsheet that breaks with >1 order.
                   
                   WAIT, the user requirement says: "Panorama geral dos pedidos da semana ... Tabela Visual (inspirada no documento)".
                   The document shows:
                   Row 1: Header (Days)
                   Row 2: Client Names
                   Row 3: Sizes
                   Row 4: Flavors
                   Row 5: Obs
                   Row 6: E/R
                   Row 7: Time
                   Row 8: Collaborator
                   Row 9: Folga
                   
                   This strongly suggests a fixed slot or "Main Order" view, OR it handles multiple orders by stacking cards within the column.
                   I will implement it as valid Columns for Days, ensuring we can scroll vertically if there are many orders.
                */}

                <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] divide-x divide-neutral-200">
                    {/* Header Col (Legend) */}
                    <div className="bg-neutral-50 text-[10px] font-bold text-neutral-500 uppercase flex flex-col">
                        <div className="h-8 flex items-center px-2 border-b border-neutral-100">Cliente</div>
                        <div className="h-8 flex items-center px-2 border-b border-neutral-100">Tam/Prod</div>
                        <div className="h-8 flex items-center px-2 border-b border-neutral-100">Sabor</div>
                        <div className="h-16 flex items-start py-2 px-2 border-b border-neutral-100">Obs</div>
                        <div className="h-8 flex items-center px-2 border-b border-neutral-100">Tipo</div>
                        <div className="h-8 flex items-center px-2 border-b border-neutral-100">Hora</div>
                        <div className="h-8 flex items-center px-2 border-b border-neutral-100">Resp.</div>
                        <div className="h-8 flex items-center px-2 bg-neutral-100 text-neutral-400">Folga</div>
                    </div>

                    {/* Day Columns */}
                    {days.map((day, i) => {
                        const dayOrders = getOrdersForDay(day);
                        const folga = getFolga(day);

                        return (
                            <div key={i} className="flex flex-col relative h-[500px]"> {/* Fixed height or scrollable? */}
                                {dayOrders.length === 0 ? (
                                    <div className="flex-1 bg-neutral-50/50 flex flex-col items-center justify-center p-4">
                                        <span className="text-neutral-300 text-xs italic">Sem pedidos</span>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex overflow-x-auto snap-x">
                                        {/* If multiple orders, we show them side-by-side in the column or stacked? 
                                            Stacked makes alignment with "Rows" impossible.
                                            Side-by-side makes the column wide.
                                            Let's stack cards that LOOK like the rows.
                                        */}
                                        {dayOrders.map((order, idx) => (
                                            <Link key={order.id} href={`/pedidos/${order.id}`} className="min-w-[100%] hover:brightness-95 transition-all group border-r last:border-0 border-dashed border-neutral-300">
                                                <div className={cn(
                                                    "h-full flex flex-col text-xs",
                                                    order.tipo === 'Entrega' ? "bg-orange-50/30" : "bg-blue-50/30"
                                                )}>

                                                    {/* Client */}
                                                    <div className="h-8 flex items-center px-2 border-b border-neutral-100 font-bold text-neutral-800 truncate" title={order.cliente.nome}>
                                                        {order.cliente.nome.split(' ')[0]}
                                                    </div>

                                                    {/* Size/Product */}
                                                    <div className="h-8 flex items-center px-2 border-b border-neutral-100 truncate text-neutral-700">
                                                        {order.itens[0]?.tamanho || order.itens[0]?.nome || '-'}
                                                    </div>

                                                    {/* Flavor */}
                                                    <div className="h-8 flex items-center px-2 border-b border-neutral-100 truncate text-neutral-600" title={`${order.itens[0]?.saborMassa} / ${order.itens[0]?.saborRecheio}`}>
                                                        {order.itens[0]?.saborMassa || '-'}
                                                    </div>

                                                    {/* Obs (Taller) */}
                                                    <div className="h-16 flex items-start py-2 px-2 border-b border-neutral-100 text-[10px] text-neutral-500 leading-tight overflow-hidden text-ellipsis">
                                                        {order.decoracao?.descricao || order.itens[0]?.nome || 'Sem obs'}
                                                    </div>

                                                    {/* Type (E/R) */}
                                                    <div className={cn(
                                                        "h-8 flex items-center justify-center px-2 border-b border-neutral-100 font-bold",
                                                        order.tipo === 'Entrega' ? "text-orange-700 bg-orange-100" : "text-blue-700 bg-blue-100"
                                                    )}>
                                                        {order.tipo === 'Entrega' ? 'ENTREGA' : 'RETIRADA'}
                                                    </div>

                                                    {/* Time */}
                                                    <div className="h-8 flex items-center justify-center px-2 border-b border-neutral-100 font-mono text-neutral-600">
                                                        {order.horaEntrega}
                                                    </div>

                                                    {/* Collaborator */}
                                                    <div className="h-8 flex items-center justify-center px-2 border-b border-neutral-100 text-neutral-700 font-medium">
                                                        {order.producao?.responsavel?.nome.split(' ')[0] || '-'}
                                                    </div>

                                                    {/* Folga (Empty spacer mostly, unless we overlay) */}
                                                    <div className="h-8 bg-neutral-100"></div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Folga Footer - Overlay at button */}
                                <div className="absolute bottom-0 w-full h-8 bg-neutral-100 border-t border-neutral-200 flex items-center justify-center text-[10px] text-neutral-400 font-medium z-10">
                                    {folga ? <span className="text-red-400">Folga: {folga}</span> : <span>-</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-2 text-[10px] text-neutral-400 flex gap-4">
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></span> Entrega</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></span> Retirada</div>
            </div>
        </div>
    );
}
