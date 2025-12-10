import { ProductionPlan } from "./calculations";
import { Receita, Ingrediente } from "@/lib/storage";

interface TechnicalTableProps {
    massa: ProductionPlan['massas'][0];
    receitas: Receita[];
    ingredientes: Ingrediente[];
}

export function TechnicalTable({ massa, receitas, ingredientes }: TechnicalTableProps) {
    const receita = receitas.find(r => r.id === massa.receitaId);
    if (!receita) return null;

    // Get all diameters relevant to this production
    const diameters = massa.detalhes.map(d => d.diametro).sort((a, b) => a - b);

    // Calculate columns: Diameter x Yield
    // The header should show e.g. "15x4" (Diameter x Discs per batch)? 
    // Or "15cm (qtd)". The spec says: "13x4 | 15x4 ... | TOTAL"
    // Where "4" is likely the yield per batch? Or the number of discs needed?
    // "13x4" in the spec likely means "4 discos de 13cm" implies 1 batch?
    // Actually the spec example:
    // "13x4 | 15x4..." -> and the value is "0g" or "200g".
    // It seems to be showing the breakdown of ingredients for the *required production*.

    return (
        <div className="break-inside-avoid border border-neutral-800 rounded-sm mb-8">
            {/* Header */}
            <div className="bg-neutral-800 text-white p-2 font-bold uppercase flex justify-between items-center">
                <span>Tabela Técnica - {massa.receitaNome}</span>
                <span className="text-xs bg-neutral-700 px-2 py-0.5 rounded">Total: {massa.totalLotes.toFixed(1)} receitas</span>
            </div>

            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-800 font-bold">
                        <th className="p-2 text-left border-r border-neutral-300">Ingredientes</th>
                        {diameters.map(d => (
                            <th key={d} className="p-2 text-center border-r border-neutral-300 w-24">
                                {d}cm
                                <div className="text-[10px] font-normal text-neutral-500">
                                    {massa.detalhes.find(x => x.diametro === d)?.lotes.toFixed(1)} rec.
                                </div>
                            </th>
                        ))}
                        <th className="p-2 text-right w-24">TOTAL</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                    {receita.ingredientes.map((ingItem, idx) => {
                        const ingNome = ingredientes.find(i => i.id === ingItem.ingredienteId)?.nome || ingItem.nome;
                        const unidade = ingredientes.find(i => i.id === ingItem.ingredienteId)?.unidade || 'g';

                        let totalRow = 0;

                        return (
                            <tr key={idx} className="even:bg-neutral-50">
                                <td className="p-2 border-r border-neutral-300 font-medium">{ingNome}</td>
                                {diameters.map(d => {
                                    const detail = massa.detalhes.find(x => x.diametro === d);
                                    let qty = 0;
                                    if (detail) {
                                        // Qty = Ingredient per Batch * Batches Needed
                                        qty = ingItem.quantidade * detail.lotes;
                                    }
                                    totalRow += qty;

                                    return (
                                        <td key={d} className="p-2 text-center border-r border-neutral-300 text-neutral-600">
                                            {qty > 0 ? (
                                                <>
                                                    {Math.round(qty)}{unidade}
                                                </>
                                            ) : '-'}
                                        </td>
                                    );
                                })}
                                <td className="p-2 text-right font-bold">
                                    {Math.round(totalRow)}{unidade}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
