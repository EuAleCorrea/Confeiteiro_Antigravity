/**
 * Supabase Storage Service
 * Substitui completamente o localStorage pelo Supabase
 */

import { supabase } from './supabase';
import type { Database } from './database.types';

// ==================== TIPOS ====================
// Re-exportando tipos do banco para compatibilidade
export type {
    Categoria,
    Cliente,
    Produto,
    Pedido,
    Orcamento,
    Ingrediente,
    Fornecedor,
    Sabor,
    Colaborador,
    FAQ,
    Ticket,
    Receita,
    Movimentacao,
    Adereco
} from './database.types';

// Tipos compostos para compatibilidade com código existente
export interface Endereco {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
}

export interface ItemOrcamento {
    id: string;
    tipo: 'Produto' | 'Adicional' | 'Servico';
    produtoId?: string;
    nome: string;
    tamanho?: string;
    saborMassa?: string;
    saborRecheio?: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
}

export interface ItemPedido {
    id: string;
    tipo: 'Produto' | 'Adicional' | 'Servico';
    produtoId?: string;
    nome: string;
    tamanho?: string;
    saborMassa?: string;
    saborRecheio?: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
}

export interface AderecoPedido {
    id: string;
    aderecoId?: string;
    nome: string;
    quantidade: number;
    precoUnitario?: number;
    subtotal?: number;
}

export interface Configuracoes {
    empresa: {
        logo?: string;
        nome: string;
        cnpj: string;
        telefone: string;
        email: string;
        endereco: string;
        social?: {
            instagram?: string;
            facebook?: string;
            whatsapp?: string;
        };
    };
    negocio: {
        prazoMinimoPedidos: number;
        prazoCancelamento: number;
        taxaEntrega: {
            valorFixo: number;
            distanciaMaximaFixa: number;
            valorPorKm: number;
        };
        raioMaximoEntrega: number;
        horarios: {
            dias: string[];
            horario: string;
        };
    };
    termos: {
        pagamento: string;
        cancelamento: string;
        cuidados: string;
        transporte: string;
        importante?: string;
    };
}

// ==================== STORAGE SERVICE ====================
class SupabaseStorageService {
    // ==================== CATEGORIAS ====================
    async getCategorias(): Promise<Database['public']['Tables']['categorias']['Row'][]> {
        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .order('ordem', { ascending: true });

        if (error) {
            console.error('Erro ao buscar categorias:', error);
            return [];
        }
        return data || [];
    }

    async saveCategoria(categoria: Partial<Database['public']['Tables']['categorias']['Row']>): Promise<Database['public']['Tables']['categorias']['Row'] | null> {
        if (categoria.id) {
            const { data, error } = await supabase
                .from('categorias')
                .update({ nome: categoria.nome, ordem: categoria.ordem })
                .eq('id', categoria.id)
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar categoria:', error);
                return null;
            }
            return data;
        } else {
            const { data, error } = await supabase
                .from('categorias')
                .insert({ nome: categoria.nome!, ordem: categoria.ordem })
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar categoria:', error);
                return null;
            }
            return data;
        }
    }

    async deleteCategoria(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar categoria:', error);
            return false;
        }
        return true;
    }

    // Alias for compatibility
    getProdutoCategorias = this.getCategorias;
    saveProdutoCategoria = this.saveCategoria;
    deleteProdutoCategoria = this.deleteCategoria;

    // ==================== PRODUTOS ====================
    async getProdutos(): Promise<any[]> {
        const { data, error } = await supabase
            .from('produtos')
            .select(`
                *,
                categoria:categorias(id, nome)
            `)
            .order('ordem', { ascending: true });

        if (error) {
            console.error('Erro ao buscar produtos:', error);
            return [];
        }

        // Transformar para formato compatível com código existente
        return (data || []).map(p => ({
            id: p.id,
            nome: p.nome,
            categoria: p.categoria?.nome || '',
            preco: Number(p.preco) || 0,
            precosPorTamanho: p.precos_por_tamanho as Record<string, number> | undefined,
            descricao: p.descricao,
            foto: p.foto,
            tamanhos: p.tamanhos,
            tempoProducao: p.tempo_producao,
            ativo: p.ativo ?? true,
            ordem: p.ordem ?? 0
        }));
    }

    async saveProduto(produto: any): Promise<any> {
        // Buscar categoria_id pelo nome
        let categoriaId = produto.categoria_id;
        if (!categoriaId && produto.categoria) {
            const { data: cat } = await supabase
                .from('categorias')
                .select('id')
                .eq('nome', produto.categoria)
                .single();
            categoriaId = cat?.id;
        }

        const dbProduto = {
            nome: produto.nome,
            categoria_id: categoriaId,
            preco: produto.preco,
            precos_por_tamanho: produto.precosPorTamanho || produto.precos_por_tamanho,
            descricao: produto.descricao,
            foto: produto.foto,
            tamanhos: produto.tamanhos,
            tempo_producao: produto.tempoProducao || produto.tempo_producao,
            ativo: produto.ativo ?? true,
            ordem: produto.ordem ?? 0
        };

        if (produto.id) {
            const { data, error } = await supabase
                .from('produtos')
                .update(dbProduto)
                .eq('id', produto.id)
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar produto:', error);
                throw error;
            }
            return data;
        } else {
            const { data, error } = await supabase
                .from('produtos')
                .insert(dbProduto)
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar produto:', error);
                throw error;
            }
            return data;
        }
    }

    async deleteProduto(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar produto:', error);
            return false;
        }
        return true;
    }

    // ==================== CLIENTES ====================
    async getClientes(): Promise<any[]> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar clientes:', error);
            return [];
        }

        return (data || []).map(c => ({
            id: c.id,
            nome: c.nome,
            cpf: c.cpf || '',
            telefone: c.telefone,
            email: c.email || '',
            endereco: c.endereco as Endereco || {},
            observacoes: c.observacoes
        }));
    }

    async saveCliente(cliente: any): Promise<any> {
        const dbCliente = {
            nome: cliente.nome,
            cpf: cliente.cpf || null,
            telefone: cliente.telefone,
            email: cliente.email || null,
            endereco: cliente.endereco || {},
            observacoes: cliente.observacoes || null
        };

        if (cliente.id) {
            const { data, error } = await supabase
                .from('clientes')
                .update(dbCliente)
                .eq('id', cliente.id)
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar cliente:', error);
                throw error;
            }
            return data;
        } else {
            const { data, error } = await supabase
                .from('clientes')
                .insert(dbCliente)
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar cliente:', error);
                throw error;
            }
            return data;
        }
    }

    async deleteCliente(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar cliente:', error);
            return false;
        }
        return true;
    }

    // ==================== SABORES ====================
    async getSabores(): Promise<any[]> {
        const { data, error } = await supabase
            .from('sabores')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar sabores:', error);
            return [];
        }

        return (data || []).map(s => ({
            id: s.id,
            nome: s.nome,
            tipo: s.tipo as 'Massa' | 'Recheio',
            descricao: s.descricao,
            custoAdicional: Number(s.custo_adicional) || 0
        }));
    }

    async saveSabor(sabor: any): Promise<any> {
        const dbSabor = {
            nome: sabor.nome,
            tipo: sabor.tipo,
            descricao: sabor.descricao || null,
            custo_adicional: sabor.custoAdicional || 0
        };

        if (sabor.id) {
            const { data, error } = await supabase
                .from('sabores')
                .update(dbSabor)
                .eq('id', sabor.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('sabores')
                .insert(dbSabor)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    async deleteSabor(id: string): Promise<boolean> {
        const { error } = await supabase.from('sabores').delete().eq('id', id);
        return !error;
    }

    // ==================== FORNECEDORES ====================
    async getFornecedores(): Promise<any[]> {
        const { data, error } = await supabase
            .from('fornecedores')
            .select('*')
            .order('nome_fantasia', { ascending: true });

        if (error) {
            console.error('Erro ao buscar fornecedores:', error);
            return [];
        }

        return (data || []).map(f => ({
            id: f.id,
            razaoSocial: f.razao_social,
            nomeFantasia: f.nome_fantasia,
            cnpj: f.cnpj || '',
            categoria: f.categoria as any,
            telefone: f.telefone,
            email: f.email,
            contato: f.contato,
            endereco: f.endereco as any || {},
            dadosBancarios: f.dados_bancarios as any || {},
            observacoes: f.observacoes,
            ativo: f.ativo ?? true
        }));
    }

    async saveFornecedor(fornecedor: any): Promise<any> {
        const dbFornecedor = {
            razao_social: fornecedor.razaoSocial,
            nome_fantasia: fornecedor.nomeFantasia,
            cnpj: fornecedor.cnpj || null,
            categoria: fornecedor.categoria,
            telefone: fornecedor.telefone,
            email: fornecedor.email || null,
            contato: fornecedor.contato || null,
            endereco: fornecedor.endereco || {},
            dados_bancarios: fornecedor.dadosBancarios || {},
            observacoes: fornecedor.observacoes || null,
            ativo: fornecedor.ativo ?? true
        };

        if (fornecedor.id) {
            const { data, error } = await supabase
                .from('fornecedores')
                .update(dbFornecedor)
                .eq('id', fornecedor.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('fornecedores')
                .insert(dbFornecedor)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    async deleteFornecedor(id: string): Promise<boolean> {
        const { error } = await supabase.from('fornecedores').delete().eq('id', id);
        return !error;
    }

    // ==================== COLABORADORES ====================
    async getColaboradores(): Promise<any[]> {
        const { data, error } = await supabase
            .from('colaboradores')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar colaboradores:', error);
            return [];
        }

        return (data || []).map(c => ({
            id: c.id,
            nome: c.nome,
            cpf: c.cpf || '',
            telefone: c.telefone,
            email: c.email,
            funcao: c.funcao as any,
            dataAdmissao: c.data_admissao,
            status: c.status as any,
            escala: c.escala,
            horarioEntrada: c.horario_entrada,
            horarioSaida: c.horario_saida,
            observacoes: c.observacoes
        }));
    }

    async saveColaborador(colaborador: any): Promise<any> {
        const dbColaborador = {
            nome: colaborador.nome,
            cpf: colaborador.cpf || null,
            telefone: colaborador.telefone,
            email: colaborador.email || null,
            funcao: colaborador.funcao,
            data_admissao: colaborador.dataAdmissao || null,
            status: colaborador.status || 'Ativo',
            escala: colaborador.escala || [],
            horario_entrada: colaborador.horarioEntrada || null,
            horario_saida: colaborador.horarioSaida || null,
            observacoes: colaborador.observacoes || null
        };

        if (colaborador.id) {
            const { data, error } = await supabase
                .from('colaboradores')
                .update(dbColaborador)
                .eq('id', colaborador.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('colaboradores')
                .insert(dbColaborador)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    async deleteColaborador(id: string): Promise<boolean> {
        const { error } = await supabase.from('colaboradores').delete().eq('id', id);
        return !error;
    }

    // ==================== INGREDIENTES ====================
    async getIngredientes(): Promise<any[]> {
        const { data, error } = await supabase
            .from('ingredientes')
            .select(`
                *,
                fornecedor:fornecedores(id, nome_fantasia)
            `)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar ingredientes:', error);
            return [];
        }

        return (data || []).map(i => ({
            id: i.id,
            nome: i.nome,
            unidade: i.unidade as any,
            categoria: i.categoria,
            estoqueAtual: Number(i.estoque_atual) || 0,
            estoqueMinimo: Number(i.estoque_minimo) || 0,
            estoqueMaximo: i.estoque_maximo ? Number(i.estoque_maximo) : undefined,
            custoUnitario: Number(i.custo_unitario) || 0,
            custoMedio: i.custo_medio ? Number(i.custo_medio) : undefined,
            fornecedorId: i.fornecedor_id,
            codigoProduto: i.codigo_produto,
            localizacao: i.localizacao,
            marca: i.marca,
            ultimaCompra: i.ultima_compra,
            atualizadoEm: i.updated_at
        }));
    }

    async saveIngrediente(ingrediente: any): Promise<any> {
        const dbIngrediente = {
            nome: ingrediente.nome,
            unidade: ingrediente.unidade,
            categoria: ingrediente.categoria,
            estoque_atual: ingrediente.estoqueAtual || 0,
            estoque_minimo: ingrediente.estoqueMinimo || 0,
            estoque_maximo: ingrediente.estoqueMaximo || null,
            custo_unitario: ingrediente.custoUnitario || 0,
            custo_medio: ingrediente.custoMedio || null,
            fornecedor_id: ingrediente.fornecedorId || null,
            codigo_produto: ingrediente.codigoProduto || null,
            localizacao: ingrediente.localizacao || null,
            marca: ingrediente.marca || null,
            ultima_compra: ingrediente.ultimaCompra || null
        };

        if (ingrediente.id) {
            const { data, error } = await supabase
                .from('ingredientes')
                .update(dbIngrediente)
                .eq('id', ingrediente.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('ingredientes')
                .insert(dbIngrediente)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    async deleteIngrediente(id: string): Promise<boolean> {
        const { error } = await supabase.from('ingredientes').delete().eq('id', id);
        return !error;
    }

    // ==================== MOVIMENTAÇÕES ====================
    async getMovimentacoes(): Promise<any[]> {
        const { data, error } = await supabase
            .from('movimentacoes')
            .select(`
                *,
                ingrediente:ingredientes(id, nome)
            `)
            .order('data', { ascending: false });

        if (error) {
            console.error('Erro ao buscar movimentações:', error);
            return [];
        }

        return (data || []).map(m => ({
            id: m.id,
            tipo: m.tipo as any,
            ingredienteId: m.ingrediente_id,
            data: m.data,
            quantidade: Number(m.quantidade),
            quantidadeAnterior: Number(m.quantidade_anterior),
            quantidadePosterior: Number(m.quantidade_posterior),
            valorUnitario: m.valor_unitario ? Number(m.valor_unitario) : undefined,
            valorTotal: m.valor_total ? Number(m.valor_total) : undefined,
            motivo: m.motivo,
            pedidoId: m.pedido_id,
            notaFiscal: m.nota_fiscal,
            fornecedorId: m.fornecedor_id,
            usuario: m.usuario,
            observacoes: m.observacoes
        }));
    }

    async saveMovimentacao(mov: any): Promise<any> {
        const dbMov = {
            tipo: mov.tipo,
            ingrediente_id: mov.ingredienteId,
            quantidade: mov.quantidade,
            quantidade_anterior: mov.quantidadeAnterior,
            quantidade_posterior: mov.quantidadePosterior,
            valor_unitario: mov.valorUnitario || null,
            valor_total: mov.valorTotal || null,
            motivo: mov.motivo,
            pedido_id: mov.pedidoId || null,
            nota_fiscal: mov.notaFiscal || null,
            fornecedor_id: mov.fornecedorId || null,
            usuario: mov.usuario || null,
            observacoes: mov.observacoes || null
        };

        const { data, error } = await supabase
            .from('movimentacoes')
            .insert(dbMov)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ==================== ADEREÇOS ====================
    async getAderecos(): Promise<any[]> {
        const { data, error } = await supabase
            .from('aderecos')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar adereços:', error);
            return [];
        }

        return (data || []).map(a => ({
            id: a.id,
            nome: a.nome,
            descricao: a.descricao,
            preco: Number(a.preco) || 0,
            estoque: a.estoque || 0,
            estoqueMin: a.estoque_min || 0,
            categoria: a.categoria,
            foto: a.foto,
            ativo: a.ativo ?? true
        }));
    }

    async saveAdereco(adereco: any): Promise<any> {
        const dbAdereco = {
            nome: adereco.nome,
            descricao: adereco.descricao || null,
            preco: adereco.preco || 0,
            estoque: adereco.estoque || 0,
            estoque_min: adereco.estoqueMin || 0,
            categoria: adereco.categoria || null,
            foto: adereco.foto || null,
            ativo: adereco.ativo ?? true
        };

        if (adereco.id) {
            const { data, error } = await supabase
                .from('aderecos')
                .update(dbAdereco)
                .eq('id', adereco.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('aderecos')
                .insert(dbAdereco)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    async deleteAdereco(id: string): Promise<boolean> {
        const { error } = await supabase.from('aderecos').delete().eq('id', id);
        return !error;
    }

    // ==================== RECEITAS ====================
    async getReceitas(): Promise<any[]> {
        const { data, error } = await supabase
            .from('receitas')
            .select(`
                *,
                ingredientes:itens_receita(
                    id,
                    quantidade,
                    unidade,
                    ingrediente:ingredientes(id, nome)
                )
            `)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar receitas:', error);
            return [];
        }

        return (data || []).map(r => ({
            id: r.id,
            nome: r.nome,
            tipo: r.tipo as any,
            rendimentoBase: undefined,
            rendimentos: r.rendimentos as any || [],
            ingredientes: (r.ingredientes as any[] || []).map((i: any) => ({
                ingredienteId: i.ingrediente?.id,
                quantidade: Number(i.quantidade),
                unidade: i.unidade
            })),
            modoPreparo: r.modo_preparo,
            tempoForno: r.tempo_forno,
            temperatura: r.temperatura,
            criadoEm: r.created_at,
            atualizadoEm: r.updated_at
        }));
    }

    async saveReceita(receita: any): Promise<any> {
        const dbReceita = {
            nome: receita.nome,
            tipo: receita.tipo,
            rendimentos: receita.rendimentos || [],
            modo_preparo: receita.modoPreparo || null,
            tempo_forno: receita.tempoForno || null,
            temperatura: receita.temperatura || null
        };

        if (receita.id) {
            // Update receita
            const { data, error } = await supabase
                .from('receitas')
                .update(dbReceita)
                .eq('id', receita.id)
                .select()
                .single();

            if (error) throw error;

            // Delete existing ingredients and re-insert
            await supabase.from('itens_receita').delete().eq('receita_id', receita.id);

            if (receita.ingredientes?.length) {
                await supabase.from('itens_receita').insert(
                    receita.ingredientes.map((i: any) => ({
                        receita_id: receita.id,
                        ingrediente_id: i.ingredienteId,
                        quantidade: i.quantidade,
                        unidade: i.unidade
                    }))
                );
            }

            return data;
        } else {
            const { data, error } = await supabase
                .from('receitas')
                .insert(dbReceita)
                .select()
                .single();

            if (error) throw error;

            if (receita.ingredientes?.length && data?.id) {
                await supabase.from('itens_receita').insert(
                    receita.ingredientes.map((i: any) => ({
                        receita_id: data.id,
                        ingrediente_id: i.ingredienteId,
                        quantidade: i.quantidade,
                        unidade: i.unidade
                    }))
                );
            }

            return data;
        }
    }

    async deleteReceita(id: string): Promise<boolean> {
        const { error } = await supabase.from('receitas').delete().eq('id', id);
        return !error;
    }

    // ==================== ORÇAMENTOS ====================
    async getOrcamentos(): Promise<any[]> {
        const { data, error } = await supabase
            .from('orcamentos')
            .select(`
                *,
                cliente:clientes(id, nome, telefone, email),
                itens:itens_orcamento(*),
                envios:envios_orcamento(*)
            `)
            .order('numero', { ascending: false });

        if (error) {
            console.error('Erro ao buscar orçamentos:', error);
            return [];
        }

        return (data || []).map(o => ({
            id: o.id,
            numero: o.numero,
            dataCriacao: o.data_criacao,
            dataValidade: o.data_validade,
            cliente: o.cliente || o.cliente_json || {},
            itens: (o.itens as any[] || []).map((i: any) => ({
                id: i.id,
                tipo: i.tipo,
                produtoId: i.produto_id,
                nome: i.nome,
                tamanho: i.tamanho,
                saborMassa: i.sabor_massa,
                saborRecheio: i.sabor_recheio,
                quantidade: i.quantidade,
                precoUnitario: Number(i.preco_unitario),
                subtotal: Number(i.subtotal)
            })),
            valorTotal: Number(o.valor_total) || 0,
            desconto: Number(o.desconto) || 0,
            status: o.status,
            decoracao: o.decoracao || {},
            observacoes: o.observacoes,
            termos: o.termos || {},
            envios: (o.envios as any[] || []).map((e: any) => ({
                numero: e.numero,
                data: e.data,
                tipo: e.tipo,
                telefone: e.telefone
            }))
        }));
    }

    async getOrcamento(id: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('orcamentos')
            .select(`
                *,
                cliente:clientes(id, nome, telefone, email),
                itens:itens_orcamento(*),
                envios:envios_orcamento(*)
            `)
            .eq('id', id)
            .single();

        if (error) return null;

        const o = data;
        return {
            id: o.id,
            numero: o.numero,
            dataCriacao: o.data_criacao,
            dataValidade: o.data_validade,
            cliente: o.cliente || o.cliente_json || {},
            itens: (o.itens as any[] || []).map((i: any) => ({
                id: i.id,
                tipo: i.tipo,
                produtoId: i.produto_id,
                nome: i.nome,
                tamanho: i.tamanho,
                saborMassa: i.sabor_massa,
                saborRecheio: i.sabor_recheio,
                quantidade: i.quantidade,
                precoUnitario: Number(i.preco_unitario),
                subtotal: Number(i.subtotal)
            })),
            valorTotal: Number(o.valor_total) || 0,
            desconto: Number(o.desconto) || 0,
            status: o.status,
            decoracao: o.decoracao || {},
            observacoes: o.observacoes,
            termos: o.termos || {},
            envios: (o.envios as any[] || []).map((e: any) => ({
                numero: e.numero,
                data: e.data,
                tipo: e.tipo,
                telefone: e.telefone
            }))
        };
    }

    async saveOrcamento(orcamento: any): Promise<any> {
        const dbOrcamento = {
            cliente_id: orcamento.cliente?.id || null,
            cliente_json: orcamento.cliente?.id ? null : orcamento.cliente,
            status: orcamento.status || 'Pendente',
            data_validade: orcamento.dataValidade,
            valor_total: orcamento.valorTotal || 0,
            desconto: orcamento.desconto || 0,
            decoracao: orcamento.decoracao || {},
            observacoes: orcamento.observacoes || null,
            termos: orcamento.termos || {}
        };

        if (orcamento.id) {
            const { data, error } = await supabase
                .from('orcamentos')
                .update(dbOrcamento)
                .eq('id', orcamento.id)
                .select()
                .single();

            if (error) throw error;

            // Update items
            await supabase.from('itens_orcamento').delete().eq('orcamento_id', orcamento.id);
            if (orcamento.itens?.length) {
                await supabase.from('itens_orcamento').insert(
                    orcamento.itens.map((i: any) => ({
                        orcamento_id: orcamento.id,
                        tipo: i.tipo,
                        produto_id: i.produtoId || null,
                        nome: i.nome,
                        tamanho: i.tamanho || null,
                        sabor_massa: i.saborMassa || null,
                        sabor_recheio: i.saborRecheio || null,
                        quantidade: i.quantidade,
                        preco_unitario: i.precoUnitario,
                        subtotal: i.subtotal
                    }))
                );
            }

            return data;
        } else {
            const { data, error } = await supabase
                .from('orcamentos')
                .insert(dbOrcamento)
                .select()
                .single();

            if (error) throw error;

            if (orcamento.itens?.length && data?.id) {
                await supabase.from('itens_orcamento').insert(
                    orcamento.itens.map((i: any) => ({
                        orcamento_id: data.id,
                        tipo: i.tipo,
                        produto_id: i.produtoId || null,
                        nome: i.nome,
                        tamanho: i.tamanho || null,
                        sabor_massa: i.saborMassa || null,
                        sabor_recheio: i.saborRecheio || null,
                        quantidade: i.quantidade,
                        preco_unitario: i.precoUnitario,
                        subtotal: i.subtotal
                    }))
                );
            }

            return { ...data, id: data.id };
        }
    }

    async deleteOrcamento(id: string): Promise<boolean> {
        const { error } = await supabase.from('orcamentos').delete().eq('id', id);
        return !error;
    }

    // ==================== PEDIDOS ====================
    async getPedidos(): Promise<any[]> {
        const { data, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                cliente:clientes(id, nome, telefone, email),
                itens:itens_pedido(*),
                historico:historico_pedido(*),
                aderecos:aderecos_pedido(*)
            `)
            .order('numero', { ascending: false });

        if (error) {
            console.error('Erro ao buscar pedidos:', error);
            return [];
        }

        return (data || []).map(p => this.mapPedido(p));
    }

    async getPedido(id: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                cliente:clientes(id, nome, telefone, email),
                itens:itens_pedido(*),
                historico:historico_pedido(*),
                aderecos:aderecos_pedido(*)
            `)
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapPedido(data);
    }

    private mapPedido(p: any): any {
        return {
            id: p.id,
            numero: p.numero,
            orcamentoId: p.orcamento_id,
            cliente: p.cliente || p.cliente_json || {},
            itens: (p.itens as any[] || []).map((i: any) => ({
                id: i.id,
                tipo: i.tipo,
                produtoId: i.produto_id,
                nome: i.nome,
                tamanho: i.tamanho,
                saborMassa: i.sabor_massa,
                saborRecheio: i.sabor_recheio,
                quantidade: i.quantidade,
                precoUnitario: Number(i.preco_unitario),
                subtotal: Number(i.subtotal)
            })),
            status: p.status,
            dataCriacao: p.data_criacao,
            entrega: {
                data: p.data_entrega,
                tipo: p.tipo_entrega,
                endereco: p.endereco_entrega,
                taxa: Number(p.taxa_entrega) || 0
            },
            valorItens: Number(p.valor_itens) || 0,
            valorTotal: Number(p.valor_total) || 0,
            desconto: Number(p.desconto) || 0,
            decoracao: p.decoracao || {},
            observacoes: p.observacoes,
            historico: (p.historico as any[] || []).map((h: any) => ({
                data: h.data,
                acao: h.acao,
                usuario: h.usuario,
                detalhes: h.detalhes
            })),
            aderecos: (p.aderecos as any[] || []).map((a: any) => ({
                id: a.id,
                aderecoId: a.adereco_id,
                nome: a.nome,
                quantidade: a.quantidade,
                precoUnitario: a.preco_unitario ? Number(a.preco_unitario) : undefined,
                subtotal: a.subtotal ? Number(a.subtotal) : undefined
            })),
            criadoPor: p.criado_por,
            atualizadoEm: p.atualizado_em
        };
    }

    async savePedido(pedido: any): Promise<any> {
        const dbPedido = {
            orcamento_id: pedido.orcamentoId || null,
            cliente_id: pedido.cliente?.id || null,
            cliente_json: pedido.cliente?.id ? null : pedido.cliente,
            status: pedido.status || 'Pendente',
            data_entrega: pedido.entrega?.data || pedido.dataEntrega,
            tipo_entrega: pedido.entrega?.tipo || pedido.tipoEntrega || 'Retirada',
            endereco_entrega: pedido.entrega?.endereco || pedido.enderecoEntrega || null,
            taxa_entrega: pedido.entrega?.taxa || pedido.taxaEntrega || 0,
            valor_itens: pedido.valorItens || 0,
            valor_total: pedido.valorTotal || 0,
            desconto: pedido.desconto || 0,
            decoracao: pedido.decoracao || {},
            observacoes: pedido.observacoes || null,
            criado_por: pedido.criadoPor || null,
            atualizado_em: new Date().toISOString()
        };

        if (pedido.id) {
            const { data, error } = await supabase
                .from('pedidos')
                .update(dbPedido)
                .eq('id', pedido.id)
                .select()
                .single();

            if (error) throw error;

            // Update items
            await supabase.from('itens_pedido').delete().eq('pedido_id', pedido.id);
            if (pedido.itens?.length) {
                await supabase.from('itens_pedido').insert(
                    pedido.itens.map((i: any) => ({
                        pedido_id: pedido.id,
                        tipo: i.tipo,
                        produto_id: i.produtoId || null,
                        nome: i.nome,
                        tamanho: i.tamanho || null,
                        sabor_massa: i.saborMassa || null,
                        sabor_recheio: i.saborRecheio || null,
                        quantidade: i.quantidade,
                        preco_unitario: i.precoUnitario,
                        subtotal: i.subtotal
                    }))
                );
            }

            // Update aderecos
            await supabase.from('aderecos_pedido').delete().eq('pedido_id', pedido.id);
            if (pedido.aderecos?.length) {
                await supabase.from('aderecos_pedido').insert(
                    pedido.aderecos.map((a: any) => ({
                        pedido_id: pedido.id,
                        adereco_id: a.aderecoId || null,
                        nome: a.nome,
                        quantidade: a.quantidade,
                        preco_unitario: a.precoUnitario || null,
                        subtotal: a.subtotal || null
                    }))
                );
            }

            return data;
        } else {
            const { data, error } = await supabase
                .from('pedidos')
                .insert(dbPedido)
                .select()
                .single();

            if (error) throw error;

            if (pedido.itens?.length && data?.id) {
                await supabase.from('itens_pedido').insert(
                    pedido.itens.map((i: any) => ({
                        pedido_id: data.id,
                        tipo: i.tipo,
                        produto_id: i.produtoId || null,
                        nome: i.nome,
                        tamanho: i.tamanho || null,
                        sabor_massa: i.saborMassa || null,
                        sabor_recheio: i.saborRecheio || null,
                        quantidade: i.quantidade,
                        preco_unitario: i.precoUnitario,
                        subtotal: i.subtotal
                    }))
                );
            }

            if (pedido.aderecos?.length && data?.id) {
                await supabase.from('aderecos_pedido').insert(
                    pedido.aderecos.map((a: any) => ({
                        pedido_id: data.id,
                        adereco_id: a.aderecoId || null,
                        nome: a.nome,
                        quantidade: a.quantidade,
                        preco_unitario: a.precoUnitario || null,
                        subtotal: a.subtotal || null
                    }))
                );
            }

            // Add history
            if (data?.id) {
                await supabase.from('historico_pedido').insert({
                    pedido_id: data.id,
                    acao: 'Pedido Criado',
                    usuario: pedido.criadoPor?.nome || 'Admin'
                });
            }

            return { ...data, id: data.id };
        }
    }

    async deletePedido(id: string): Promise<boolean> {
        const { error } = await supabase.from('pedidos').delete().eq('id', id);
        return !error;
    }

    async addHistoricoPedido(pedidoId: string, acao: string, usuario: string, detalhes?: string): Promise<void> {
        await supabase.from('historico_pedido').insert({
            pedido_id: pedidoId,
            acao,
            usuario,
            detalhes: detalhes || null
        });
    }

    // ==================== CONFIGURAÇÕES ====================
    async getConfiguracoes(): Promise<Configuracoes | null> {
        const { data, error } = await supabase
            .from('configuracoes')
            .select('*');

        if (error || !data?.length) return null;

        const config: any = {};
        for (const item of data) {
            config[item.chave] = item.valor;
        }

        return config as Configuracoes;
    }

    async saveConfiguracoes(config: Configuracoes): Promise<void> {
        const updates = [
            { chave: 'empresa', valor: config.empresa },
            { chave: 'negocio', valor: config.negocio },
            { chave: 'termos', valor: config.termos }
        ];

        for (const update of updates) {
            await supabase
                .from('configuracoes')
                .update({ valor: update.valor })
                .eq('chave', update.chave);
        }
    }

    // ==================== FAQ ====================
    async getFAQs(): Promise<any[]> {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('ativo', true)
            .order('ordem', { ascending: true });

        if (error) return [];

        return (data || []).map(f => ({
            id: f.id,
            categoria: f.categoria,
            pergunta: f.pergunta,
            resposta: f.resposta,
            ordem: f.ordem,
            ativo: f.ativo
        }));
    }

    async saveFAQ(faq: any): Promise<any> {
        const dbFAQ = {
            categoria: faq.categoria,
            pergunta: faq.pergunta,
            resposta: faq.resposta,
            ordem: faq.ordem || 0,
            ativo: faq.ativo ?? true
        };

        if (faq.id) {
            const { data, error } = await supabase
                .from('faqs')
                .update(dbFAQ)
                .eq('id', faq.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('faqs')
                .insert(dbFAQ)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    async deleteFAQ(id: string): Promise<boolean> {
        const { error } = await supabase.from('faqs').delete().eq('id', id);
        return !error;
    }

    // ==================== TICKETS ====================
    async getTickets(): Promise<any[]> {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return [];

        return (data || []).map(t => ({
            id: t.id,
            assunto: t.assunto,
            descricao: t.descricao,
            status: t.status,
            prioridade: t.prioridade,
            anexos: t.anexos || [],
            mensagens: t.mensagens || [],
            criadoEm: t.created_at,
            atualizadoEm: t.updated_at
        }));
    }

    async saveTicket(ticket: any): Promise<any> {
        const dbTicket = {
            assunto: ticket.assunto,
            descricao: ticket.descricao,
            status: ticket.status || 'Aberto',
            prioridade: ticket.prioridade || 'Normal',
            anexos: ticket.anexos || [],
            mensagens: ticket.mensagens || []
        };

        if (ticket.id) {
            const { data, error } = await supabase
                .from('tickets')
                .update(dbTicket)
                .eq('id', ticket.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('tickets')
                .insert(dbTicket)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    async deleteTicket(id: string): Promise<boolean> {
        const { error } = await supabase.from('tickets').delete().eq('id', id);
        return !error;
    }

    // ==================== HELPER: Próximo número ====================
    async getNextOrcamentoNumber(): Promise<number> {
        const { data } = await supabase
            .from('orcamentos')
            .select('numero')
            .order('numero', { ascending: false })
            .limit(1);

        return (data?.[0]?.numero || 0) + 1;
    }

    async getNextPedidoNumber(): Promise<number> {
        const { data } = await supabase
            .from('pedidos')
            .select('numero')
            .order('numero', { ascending: false })
            .limit(1);

        return (data?.[0]?.numero || 0) + 1;
    }
}

// ==================== EXPORT SINGLETON ====================
export const supabaseStorage = new SupabaseStorageService();

// ==================== HOOK PARA REACT ====================
import { useState, useEffect } from 'react';

export function useSupabaseData<T>(
    fetchFn: () => Promise<T[]>,
    deps: any[] = []
): { data: T[]; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error, refetch };
}
