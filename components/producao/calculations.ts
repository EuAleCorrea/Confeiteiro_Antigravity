import { Pedido, Receita, Ingrediente, ConfigProducao } from "@/lib/storage";

export interface ProductionPlan {
    massas: {
        receitaId: string;
        receitaNome: string;
        totalDiscos: number;
        detalhes: {
            diametro: number;
            qtdDiscos: number;
            lotes: number; // batches needed
        }[];
        totalLotes: number;
    }[];
    recheios: {
        receitaId: string;
        receitaNome: string;
        totalPesoGramas: number;
        totalPanelas: number;
        detalhes: {
            diametro: number;
            camadas: number; // total layers needed across all cakes
            pesoTotal: number;
        }[];
    }[];
    listaCompras: {
        ingrediente: Ingrediente;
        quantidadeTotal: number;
    }[];
}

export function calculateProduction(
    orders: Pedido[],
    receitas: Receita[],
    allIngredients: Ingrediente[],
    config: ConfigProducao
): ProductionPlan {
    const plan: ProductionPlan = { massas: [], recheios: [], listaCompras: [] };

    // Map to aggregate totals
    const massaMap = new Map<string, { rec: Receita, diametros: Map<number, number> }>();
    const recheioMap = new Map<string, { rec: Receita, diametros: Map<number, number> }>();

    // Process Orders
    orders.forEach(pedido => {
        pedido.itens.forEach(item => {
            if (item.tipo !== 'Produto') return; // Only process 'Bolo' products assuming they are marked as such

            // Resolve Size (Parsing '15cm' -> 15)
            // Assuming item.tamanho contains string like "15cm" or "M (15cm)"
            const tamanhoStr = item.tamanho || "";
            const diametroMatch = tamanhoStr.match(/(\d+)cm/);
            const diametro = diametroMatch ? parseInt(diametroMatch[1]) : 15; // Default to 15 if not found

            // Resolve Recipes
            const massaNome = item.saborMassa;
            const recheioNome = item.saborRecheio;

            // Find Recipe Objects (Matching by Name for now, ideally by ID if select was used)
            // The system uses Names in ItemOrcamento currently.
            if (massaNome) {
                const rec = receitas.find(r => r.nome === massaNome && r.tipo === 'Massa');
                if (rec) {
                    if (!massaMap.has(rec.id)) massaMap.set(rec.id, { rec, diametros: new Map() });
                    const entry = massaMap.get(rec.id)!;

                    // Logic: 1 Cake = 4 Discs (Standard)
                    const qtdDiscos = 4 * item.quantidade;
                    entry.diametros.set(diametro, (entry.diametros.get(diametro) || 0) + qtdDiscos);
                }
            }

            if (recheioNome) {
                const rec = receitas.find(r => r.nome === recheioNome && r.tipo === 'Recheio');
                if (rec) {
                    if (!recheioMap.has(rec.id)) recheioMap.set(rec.id, { rec, diametros: new Map() });
                    const entry = recheioMap.get(rec.id)!;

                    // Logic: 1 Cake = 3 Layers of Filling (Standard)
                    const qtdCamadas = 3 * item.quantidade;
                    entry.diametros.set(diametro, (entry.diametros.get(diametro) || 0) + qtdCamadas);
                }
            }
        });
    });

    // Finalize Massas Plan
    massaMap.forEach((data, id) => {
        const detalhes: { diametro: number; qtdDiscos: number; lotes: number; }[] = [];
        let totalLotes = 0;
        let totalDiscos = 0;

        data.diametros.forEach((qtdDiscos, diametro) => {
            // Calculate Batches needed based on Recipe Yield for this diameter
            // Recipe: yields X discs of Dia Y per batch.
            const yieldPerBatch = data.rec.rendimentoPorDiametro?.find(y => y.diametro === diametro)?.quantidadeDiscos || 4; // Default safe 4
            const lotes = qtdDiscos / yieldPerBatch;

            detalhes.push({ diametro, qtdDiscos, lotes });
            totalLotes += lotes;
            totalDiscos += qtdDiscos;
        });

        plan.massas.push({
            receitaId: data.rec.id,
            receitaNome: data.rec.nome,
            totalDiscos,
            detalhes,
            totalLotes: Math.ceil(totalLotes * 10) / 10 // Round to 1 decimal
        });
    });

    // Finalize Recheios Plan
    recheioMap.forEach((data, id) => {
        const detalhes: { diametro: number; camadas: number; pesoTotal: number; }[] = [];
        let totalPeso = 0;

        data.diametros.forEach((qtdCamadas, diametro) => {
            // Calculate Weight needed based on Config
            const gramsPerLayer = config.recheioPorCamada.find(c => c.diametro === diametro)?.gramas || 200;
            const peso = qtdCamadas * gramsPerLayer;

            detalhes.push({ diametro, camadas: qtdCamadas, pesoTotal: peso });
            totalPeso += peso;
        });

        const weightPerPan = data.rec.rendimentoLote.pesoTotalg || 450;
        const totalPanelas = totalPeso / weightPerPan;

        plan.recheios.push({
            receitaId: data.rec.id,
            receitaNome: data.rec.nome,
            totalPesoGramas: totalPeso,
            totalPanelas: Math.ceil(totalPanelas * 10) / 10,
            detalhes
        });
    });

    // Finalize Shopping List (Lista de Compras)
    const ingredientMap = new Map<string, { ing: Ingrediente, qtd: number }>();

    // Helper to add ingredients
    const addIngredients = (recipeId: string, multiplier: number) => {
        const rec = receitas.find(r => r.id === recipeId);
        if (!rec) return;

        rec.ingredientes.forEach(item => {
            const fullIng = allIngredients.find(i => i.id === item.ingredienteId);
            if (!fullIng) return; // Skip if ing not found (should not happen if data integrity is good)

            const current = ingredientMap.get(item.ingredienteId);
            const addedQtd = item.quantidade * multiplier;

            if (current) {
                current.qtd += addedQtd;
            } else {
                ingredientMap.set(item.ingredienteId, { ing: fullIng, qtd: addedQtd });
            }
        });
    };

    // 1. Massas
    plan.massas.forEach(m => addIngredients(m.receitaId, m.totalLotes));

    // 2. Recheios
    // For fillings, recipe ingredients are per "Lote" (Panela) usually.
    // If recipe.rendimentoLote.pesoTotalg is defined, we can estimate batches based on total weight required vs batch weight.
    // We already calculated totalPanelas in plan.recheios.
    plan.recheios.forEach(r => addIngredients(r.receitaId, r.totalPanelas));

    // Convert Map to Array
    plan.listaCompras = Array.from(ingredientMap.values()).map(v => ({
        ingrediente: v.ing,
        quantidadeTotal: v.qtd
    })).sort((a, b) => a.ingrediente.categoria.localeCompare(b.ingrediente.categoria));

    return plan;
}
