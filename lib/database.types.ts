// Types gerados para o banco Supabase do Confeiteiro
// Projeto: jtzhuvqkszsveybakbwp

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            aderecos: {
                Row: {
                    id: string
                    nome: string
                    descricao: string | null
                    preco: number | null
                    estoque: number | null
                    estoque_min: number | null
                    categoria: string | null
                    foto: string | null
                    ativo: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['aderecos']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['aderecos']['Row']>
            }
            categorias: {
                Row: {
                    id: string
                    nome: string
                    ordem: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['categorias']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['categorias']['Row']>
            }
            clientes: {
                Row: {
                    id: string
                    nome: string
                    cpf: string | null
                    telefone: string
                    email: string | null
                    endereco: Json | null
                    observacoes: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['clientes']['Row']>
            }
            colaboradores: {
                Row: {
                    id: string
                    nome: string
                    cpf: string | null
                    telefone: string
                    email: string | null
                    funcao: string
                    data_admissao: string | null
                    status: string | null
                    escala: string[] | null
                    horario_entrada: string | null
                    horario_saida: string | null
                    observacoes: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['colaboradores']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['colaboradores']['Row']>
            }
            configuracoes: {
                Row: {
                    id: string
                    chave: string
                    valor: Json
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['configuracoes']['Row'], 'id'> & { id?: string }
                Update: Partial<Database['public']['Tables']['configuracoes']['Row']>
            }
            faqs: {
                Row: {
                    id: string
                    categoria: string
                    pergunta: string
                    resposta: string
                    ordem: number | null
                    ativo: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['faqs']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['faqs']['Row']>
            }
            fornecedores: {
                Row: {
                    id: string
                    razao_social: string
                    nome_fantasia: string
                    cnpj: string | null
                    categoria: string
                    telefone: string
                    email: string | null
                    contato: string | null
                    endereco: Json | null
                    dados_bancarios: Json | null
                    observacoes: string | null
                    ativo: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['fornecedores']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['fornecedores']['Row']>
            }
            ingredientes: {
                Row: {
                    id: string
                    nome: string
                    unidade: string
                    categoria: string
                    estoque_atual: number | null
                    estoque_minimo: number | null
                    estoque_maximo: number | null
                    custo_unitario: number | null
                    custo_medio: number | null
                    fornecedor_id: string | null
                    codigo_produto: string | null
                    localizacao: string | null
                    marca: string | null
                    ultima_compra: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['ingredientes']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['ingredientes']['Row']>
            }
            orcamentos: {
                Row: {
                    id: string
                    numero: number
                    cliente_id: string | null
                    cliente_json: Json | null
                    status: string | null
                    data_criacao: string | null
                    data_validade: string | null
                    valor_total: number | null
                    desconto: number | null
                    decoracao: Json | null
                    observacoes: string | null
                    termos: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['orcamentos']['Row'], 'id' | 'numero' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['orcamentos']['Row']>
            }
            pedidos: {
                Row: {
                    id: string
                    numero: number
                    orcamento_id: string | null
                    cliente_id: string | null
                    cliente_json: Json | null
                    status: string | null
                    data_criacao: string | null
                    data_entrega: string
                    tipo_entrega: string
                    endereco_entrega: Json | null
                    taxa_entrega: number | null
                    valor_itens: number | null
                    valor_total: number | null
                    desconto: number | null
                    decoracao: Json | null
                    observacoes: string | null
                    criado_por: Json | null
                    atualizado_em: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['pedidos']['Row'], 'id' | 'numero' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['pedidos']['Row']>
            }
            produtos: {
                Row: {
                    id: string
                    nome: string
                    categoria_id: string
                    preco: number | null
                    precos_por_tamanho: Json | null
                    descricao: string | null
                    foto: string | null
                    tamanhos: string[] | null
                    tempo_producao: number | null
                    ativo: boolean | null
                    ordem: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['produtos']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['produtos']['Row']>
            }
            receitas: {
                Row: {
                    id: string
                    nome: string
                    tipo: string
                    rendimentos: Json | null
                    modo_preparo: string | null
                    tempo_forno: string | null
                    temperatura: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['receitas']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['receitas']['Row']>
            }
            sabores: {
                Row: {
                    id: string
                    nome: string
                    tipo: string
                    descricao: string | null
                    custo_adicional: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['sabores']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['sabores']['Row']>
            }
            tickets: {
                Row: {
                    id: string
                    assunto: string
                    descricao: string
                    status: string | null
                    prioridade: string | null
                    anexos: string[] | null
                    mensagens: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['tickets']['Row']>
            }
            movimentacoes: {
                Row: {
                    id: string
                    tipo: string
                    ingrediente_id: string
                    data: string | null
                    quantidade: number
                    quantidade_anterior: number
                    quantidade_posterior: number
                    valor_unitario: number | null
                    valor_total: number | null
                    motivo: string
                    pedido_id: string | null
                    nota_fiscal: string | null
                    fornecedor_id: string | null
                    usuario: string | null
                    observacoes: string | null
                    created_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['movimentacoes']['Row'], 'id' | 'created_at'> & { id?: string }
                Update: Partial<Database['public']['Tables']['movimentacoes']['Row']>
            }
            itens_pedido: {
                Row: {
                    id: string
                    pedido_id: string
                    tipo: string
                    produto_id: string | null
                    nome: string
                    tamanho: string | null
                    sabor_massa: string | null
                    sabor_recheio: string | null
                    quantidade: number
                    preco_unitario: number
                    subtotal: number
                }
                Insert: Omit<Database['public']['Tables']['itens_pedido']['Row'], 'id'> & { id?: string }
                Update: Partial<Database['public']['Tables']['itens_pedido']['Row']>
            }
            itens_orcamento: {
                Row: {
                    id: string
                    orcamento_id: string
                    tipo: string
                    produto_id: string | null
                    nome: string
                    tamanho: string | null
                    sabor_massa: string | null
                    sabor_recheio: string | null
                    quantidade: number
                    preco_unitario: number
                    subtotal: number
                }
                Insert: Omit<Database['public']['Tables']['itens_orcamento']['Row'], 'id'> & { id?: string }
                Update: Partial<Database['public']['Tables']['itens_orcamento']['Row']>
            }
            itens_receita: {
                Row: {
                    id: string
                    receita_id: string
                    ingrediente_id: string
                    quantidade: number
                    unidade: string
                }
                Insert: Omit<Database['public']['Tables']['itens_receita']['Row'], 'id'> & { id?: string }
                Update: Partial<Database['public']['Tables']['itens_receita']['Row']>
            }
            historico_pedido: {
                Row: {
                    id: string
                    pedido_id: string
                    data: string | null
                    acao: string
                    usuario: string
                    detalhes: string | null
                }
                Insert: Omit<Database['public']['Tables']['historico_pedido']['Row'], 'id'> & { id?: string }
                Update: Partial<Database['public']['Tables']['historico_pedido']['Row']>
            }
            envios_orcamento: {
                Row: {
                    id: string
                    orcamento_id: string
                    numero: number
                    data: string | null
                    tipo: string
                    telefone: string
                }
                Insert: Omit<Database['public']['Tables']['envios_orcamento']['Row'], 'id'> & { id?: string }
                Update: Partial<Database['public']['Tables']['envios_orcamento']['Row']>
            }
            aderecos_pedido: {
                Row: {
                    id: string
                    pedido_id: string
                    adereco_id: string | null
                    nome: string
                    quantidade: number
                    preco_unitario: number | null
                    subtotal: number | null
                }
                Insert: Omit<Database['public']['Tables']['aderecos_pedido']['Row'], 'id'> & { id?: string }
                Update: Partial<Database['public']['Tables']['aderecos_pedido']['Row']>
            }
        }
        Views: {}
        Functions: {}
        Enums: {}
    }
}

// Tipos simplificados para uso direto
export type Adereco = Database['public']['Tables']['aderecos']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type Colaborador = Database['public']['Tables']['colaboradores']['Row']
export type Configuracao = Database['public']['Tables']['configuracoes']['Row']
export type FAQ = Database['public']['Tables']['faqs']['Row']
export type Fornecedor = Database['public']['Tables']['fornecedores']['Row']
export type Ingrediente = Database['public']['Tables']['ingredientes']['Row']
export type Orcamento = Database['public']['Tables']['orcamentos']['Row']
export type Pedido = Database['public']['Tables']['pedidos']['Row']
export type Produto = Database['public']['Tables']['produtos']['Row']
export type Receita = Database['public']['Tables']['receitas']['Row']
export type Sabor = Database['public']['Tables']['sabores']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type Movimentacao = Database['public']['Tables']['movimentacoes']['Row']
export type ItemPedido = Database['public']['Tables']['itens_pedido']['Row']
export type ItemOrcamento = Database['public']['Tables']['itens_orcamento']['Row']
export type ItemReceita = Database['public']['Tables']['itens_receita']['Row']
export type HistoricoPedido = Database['public']['Tables']['historico_pedido']['Row']
export type EnvioOrcamento = Database['public']['Tables']['envios_orcamento']['Row']
export type AderecoPedido = Database['public']['Tables']['aderecos_pedido']['Row']
