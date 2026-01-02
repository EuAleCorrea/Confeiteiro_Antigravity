/**
 * Storage Index
 * Re-exports the Supabase storage as the default storage implementation
 * Mantém compatibilidade com código existente
 */

// Exportar tudo do Supabase Storage
export * from './supabase-storage';

// Para compatibilidade, também exportar como "storage"
import { supabaseStorage } from './supabase-storage';
export const storage = supabaseStorage;

// Re-exportar interfaces originais para compatibilidade total
// (as interfaces estão definidas em supabase-storage.ts)

// Re-exportar tipos do storage original que ainda não foram migrados
export type {
    CashFlowMonthData,
    CashFlowCategory,
    Transaction,
    Pagamento,
    ContaReceber,
    ContaPagar,
    CategoriaAdereco,
    ItemCompraAdereco,
    CompraAderecos,
    AgendaSemanal,
    ConfigProducao
} from './storage-legacy';

// Hooks de React para uso com Supabase
export { useSupabaseData } from './supabase-storage';
