import { useState, useEffect } from "react";

export interface Cliente {
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    endereco: {
        cep: string;
        rua: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
    };
    observacoes?: string;
}

export interface Produto {
    id: string;
    nome: string;
    categoria: 'Bolo' | 'Adicional' | 'Serviço';
    preco: number;
    descricao?: string;
    foto?: string;
    tamanhos?: string[];
    tempoProducao?: number; // horas
    ativo: boolean;
}

export interface Sabor {
    id: string;
    nome: string;
    tipo: 'Massa' | 'Recheio';
    descricao?: string;
    custoAdicional?: number;
}

export interface Fornecedor {
    id: string;
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    categoria: 'Ingredientes' | 'Embalagens' | 'Decorações' | 'Serviços' | 'Equipamentos';
    telefone: string;
    email?: string;
    contato?: string;
    endereco?: {
        cep: string;
        rua: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
    };
    dadosBancarios?: {
        banco: string;
        agencia: string;
        conta: string;
        pix?: string;
    };
    observacoes?: string;
    ativo: boolean;
}

export interface Colaborador {
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
    email?: string;
    funcao: 'Confeiteira' | 'Auxiliar' | 'Decoradora' | 'Motorista' | 'Atendimento';
    dataAdmissao?: string;
    status: 'Ativo' | 'Inativo' | 'Férias' | 'Licença';
    escala?: string[]; // Dias da semana
    horarioEntrada?: string;
    horarioSaida?: string;
    observacoes?: string;
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
            distanciaMaximaFixa: number; // km
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

export interface ItemOrcamento {
    id: string;
    tipo: 'Produto' | 'Adicional' | 'Servico';
    produtoId?: string; // ID do produto ou adicional
    nome: string;
    tamanho?: string;
    saborMassa?: string;
    saborRecheio?: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
}

export interface Orcamento {
    id: string;
    numero: number;
    dataCriacao: string;
    dataValidade: string;
    cliente: {
        id?: string;
        nome: string;
        telefone: string;
        email?: string;
    };
    itens: ItemOrcamento[];
    entrega: {
        tipo: 'Entrega' | 'Retirada';
        data: string;
        horario: string;
        endereco?: {
            cep: string;
            rua: string;
            numero: string;
            complemento?: string;
            bairro: string;
            cidade: string;
            estado: string;
        };
        taxa: number;
        distancia?: number;
        instrucoesRetirada?: string;
    };
    decoracao: {
        descricao: string;
        imagens: string[];
        observacoes?: string;
    };
    termos: {
        pagamento: string;
        importante: string;
        cuidados: string;
        transporte: string;
        cancelamento: string;
    };
    status: 'Pendente' | 'Enviado' | 'Aprovado' | 'Recusado' | 'Expirado' | 'Convertido';
    valorTotal: number;
    historico: {
        data: string;
        acao: string;
        usuario: string;
    }[];
}

export interface Pedido {
    id: string;
    numero: number;
    orcamentoId?: string; // ID do orçamento origem

    // Cliente
    cliente: {
        id?: string;
        nome: string;
        telefone: string;
        email?: string;
    };

    // Pedido
    dataCriacao: string;
    dataEntrega: string;
    horaEntrega: string;
    tipo: 'Entrega' | 'Retirada';

    // Produtos
    itens: ItemOrcamento[];

    // Decoração
    decoracao: {
        descricao: string;
        imagensReferencia: string[];
        observacoes?: string;
    };

    // Entrega/Retirada
    entrega: {
        tipo: 'Entrega' | 'Retirada';
        endereco?: {
            rua: string;
            numero: string;
            complemento?: string;
            bairro: string;
            cidade: string;
            estado: string;
            cep: string;
        };
        taxaEntrega: number;
        distancia?: number;
        motorista?: { id: string; nome: string; };
        instrucoes?: string;
        horarioSaida?: string;
        horarioEntrega?: string;
        fotoEntrega?: string;
        recebidoPor?: string;
        assinatura?: string; // base64
    };

    // Produção
    producao: {
        responsavel?: { id: string; nome: string; };
        dataInicio?: string;
        dataTermino?: string;
        calculosTecnicos?: {
            discosMassa: string[];
            quantidadeRecheio: Record<string, string>;
            ingredientes: string[];
        };
        checklist: { item: string; concluido: boolean; }[];
        fotos: string[];
    };

    // Financeiro
    financeiro: {
        valorTotal: number;
        valorPago: number;
        saldoPendente: number;
        formaPagamento: 'PIX' | 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Transferência';
        dataPagamento?: string;
        comprovante?: string; // url
        statusPagamento: 'Pago' | 'Pendente' | 'Parcial' | 'Atrasado';
    };

    // Status e controle
    status: 'Pagamento Pendente' | 'Aguardando Produção' | 'Em Produção' | 'Pronto' | 'Saiu para Entrega' | 'Entregue' | 'Cancelado';
    prioridade: 'Normal' | 'Urgente';

    // Histórico
    historico: {
        data: string;
        acao: string;
        usuario: string;
        detalhes?: string;
    }[];

    // Metadados
    criadoPor?: { id: string; nome: string; };
    atualizadoEm: string;
}

// --- Módulo 5: Produção ---

export interface Categoria {
    id: string;
    nome: string;
}

export interface Ingrediente {
    id: string;
    nome: string;
    unidade: 'g' | 'kg' | 'ml' | 'l' | 'un';
    categoria: string; // Changed from union type to string for dynamic categories

    // Estoque
    estoqueAtual: number;
    estoqueMinimo: number;
    estoqueMaximo?: number;

    // Financeiro
    custoUnitario: number; // Preço da última compra ou atual
    custoMedio?: number;   // Preço médio ponderado

    // Detalhes
    fornecedorId?: string;
    codigoProduto?: string;
    localizacao?: string;
    marca?: string;
    ultimaCompra?: string;

    atualizadoEm?: string;
}

export interface Movimentacao {
    // ... rest of Movimentacao interface
    id: string;
    tipo: 'Entrada' | 'Saida' | 'Ajuste';
    ingredienteId: string;
    data: string; // ISO Date

    // Quantidades
    quantidade: number;
    quantidadeAnterior: number;
    quantidadePosterior: number;

    // Financeiro (apenas para Entrada)
    valorUnitario?: number;
    valorTotal?: number;

    // Contexto
    motivo: string; // "Compra", "Produção", "Perda", "Inventário"
    pedidoId?: string; // Se vinculado a produção
    notaFiscal?: string; // Se compra
    fornecedorId?: string; // Se compra
    usuario?: string;

    observacoes?: string;
}

export interface Receita {
    id: string;
    nome: string;
    tipo: 'Massa' | 'Recheio';

    // Base de rendimento (1 Lote/Panela)
    rendimentoBase?: { // Tornado opcional para compatibilidade ou migração
        quantidade: number;
        diametro: number; // ex: 18 (cm)
    };
    rendimentoLote: {
        descricao: string; // "1 Panela", "1 Batida"
        pesoTotalg?: number; // Importante para recheios (ex: 450g por panela)
    };

    ingredientes: {
        ingredienteId: string;
        nome: string; // Cache for display
        quantidade: number; // Quantidade para 1 lote (na unidade do ingrediente)
    }[];

    // Apenas para Massas: Conversão de Lote -> Discos
    rendimentoPorDiametro?: {
        diametro: number; // ex: 15
        quantidadeDiscos: number; // ex: 4 (1 receita faz 4 discos de 15cm)
    }[];

    // Detalhes Técnicos
    modoPreparo?: string;
    tempoForno?: string; // ex: "25-30 minutos"
    temperatura?: number; // ex: 180

    criadoEm?: string;
    atualizadoEm?: string;
}

export interface ConfigProducao {
    // Configuração de demanda de recheio
    recheioPorCamada: {
        diametro: number;
        gramas: number;
    }[];

    // Configurações Gerais
    antecedenciaMinima?: number; // dias
    temposProducao?: {
        massas: number; // horas
        recheios: number; // horas
        montagem: number; // horas
        decoracao: number; // horas
    };
    notificacoes?: {
        alertaPrazoCurto: boolean;
        alertaEstoque: boolean;
    };
}

const STORAGE_KEYS = {
    CLIENTES: 'confeiteiro_clientes',
    PRODUTOS: 'confeiteiro_produtos',
    SABORES: 'confeiteiro_sabores',
    FORNECEDORES: 'confeiteiro_fornecedores',
    COLABORADORES: 'confeiteiro_colaboradores',
    CONFIGURACOES: 'confeiteiro_configuracoes',
    ORCAMENTOS: 'confeiteiro_orcamentos',
    PEDIDOS: 'confeiteiro_pedidos',
    NEXT_ORCAMENTO_NUM: 'confeiteiro_next_orcamento_num',
    // Stage 5
    INGREDIENTES: 'confeiteiro_ingredientes',
    RECEITAS: 'confeiteiro_receitas',
    CONFIG_PRODUCAO: 'confeiteiro_config_producao',
    // Stage 6
    MOVIMENTACOES: 'confeiteiro_movimentacoes',
    CATEGORIAS: 'confeiteiro_categorias_insumos',
};

// Seed data
const initialData = {
    // ... other seeds
    sabores: [
        { id: '1', nome: 'Baunilha', tipo: 'Massa', descricao: 'Massa fofinha de baunilha', custoAdicional: 0 },
        { id: '2', nome: 'Chocolate', tipo: 'Massa', descricao: 'Massa rica de chocolate 50%', custoAdicional: 0 },
        { id: '3', nome: 'Brigadeiro', tipo: 'Recheio', descricao: 'Brigadeiro tradicional cremoso', custoAdicional: 0 },
    ],
    configuracoes: {
        empresa: { nome: 'Minha Confeitaria', cnpj: '', telefone: '', email: '', endereco: '' },
        negocio: { prazoMinimoPedidos: 3, prazoCancelamento: 7, taxaEntrega: { valorFixo: 10, distanciaMaximaFixa: 5, valorPorKm: 2 }, raioMaximoEntrega: 20, horarios: { dias: ['Seg', 'Sex'], horario: '09:00 - 18:00' } },
        termos: { pagamento: '', cancelamento: '', cuidados: '', transporte: '', importante: '' }
    },
    // Stage 5 Defaults
    configProducao: {
        recheioPorCamada: [
            { diametro: 13, gramas: 165 },
            { diametro: 15, gramas: 220 },
            { diametro: 18, gramas: 280 },
            { diametro: 20, gramas: 390 },
            { diametro: 23, gramas: 480 },
            { diametro: 25, gramas: 550 },
        ]
    },
    categoriasPadrao: [
        'Laticínios', 'Secos', 'Hortifruti', 'Líquidos', 'Embalagens',
        'Decoração', 'Descartáveis', 'Equipamentos', 'Outros'
    ]
};

// ... StorageService class start ...
class StorageService {
    private getItem<T>(key: string, defaultValue: T): T {
        if (typeof window === 'undefined') return defaultValue;
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    }

    private setItem<T>(key: string, value: T): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Generic CRUD
    private getList<T>(key: string): T[] {
        return this.getItem<T[]>(key, []);
    }

    private saveItem<T extends { id: string }>(key: string, item: T): void {
        const list = this.getList<T>(key);
        const index = list.findIndex(i => i.id === item.id);
        if (index >= 0) {
            list[index] = item;
        } else {
            list.push(item);
        }
        this.setItem(key, list);
    }

    private deleteItem<T extends { id: string }>(key: string, id: string): void {
        const list = this.getList<T>(key);
        this.setItem(key, list.filter(i => i.id !== id));
    }

    // Clientes
    getClientes() { return this.getList<Cliente>(STORAGE_KEYS.CLIENTES); }
    saveCliente(cliente: Cliente) { this.saveItem(STORAGE_KEYS.CLIENTES, cliente); }
    deleteCliente(id: string) { this.deleteItem<Cliente>(STORAGE_KEYS.CLIENTES, id); }

    // Produtos
    getProdutos() { return this.getList<Produto>(STORAGE_KEYS.PRODUTOS); }
    saveProduto(produto: Produto) { this.saveItem(STORAGE_KEYS.PRODUTOS, produto); }
    deleteProduto(id: string) { this.deleteItem<Produto>(STORAGE_KEYS.PRODUTOS, id); }

    // Sabores
    getSabores() {
        const list = this.getList<Sabor>(STORAGE_KEYS.SABORES);
        return list.length ? list : initialData.sabores as Sabor[];
    }
    saveSabor(sabor: Sabor) { this.saveItem(STORAGE_KEYS.SABORES, sabor); }
    deleteSabor(id: string) { this.deleteItem<Sabor>(STORAGE_KEYS.SABORES, id); }

    // Fornecedores
    getFornecedores() { return this.getList<Fornecedor>(STORAGE_KEYS.FORNECEDORES); }
    saveFornecedor(fornecedor: Fornecedor) { this.saveItem(STORAGE_KEYS.FORNECEDORES, fornecedor); }
    deleteFornecedor(id: string) { this.deleteItem<Fornecedor>(STORAGE_KEYS.FORNECEDORES, id); }

    // Colaboradores
    getColaboradores() { return this.getList<Colaborador>(STORAGE_KEYS.COLABORADORES); }
    saveColaborador(colaborador: Colaborador) { this.saveItem(STORAGE_KEYS.COLABORADORES, colaborador); }
    deleteColaborador(id: string) { this.deleteItem<Colaborador>(STORAGE_KEYS.COLABORADORES, id); }

    // Configuracoes
    getConfiguracoes() {
        const config = this.getItem<Configuracoes | null>(STORAGE_KEYS.CONFIGURACOES, null);
        return config || initialData.configuracoes as Configuracoes;
    }
    saveConfiguracoes(config: Configuracoes) { this.setItem(STORAGE_KEYS.CONFIGURACOES, config); }

    // Orcamentos
    getOrcamentos() { return this.getList<Orcamento>(STORAGE_KEYS.ORCAMENTOS); }
    getOrcamentoById(id: string) { const list = this.getOrcamentos(); return list.find(o => o.id === id); }
    saveOrcamento(orcamento: Orcamento) {
        if (!orcamento.numero) {
            const nextNum = this.getItem<number>(STORAGE_KEYS.NEXT_ORCAMENTO_NUM, 25338);
            orcamento.numero = nextNum;
            this.setItem(STORAGE_KEYS.NEXT_ORCAMENTO_NUM, nextNum + 1);
        }
        this.saveItem(STORAGE_KEYS.ORCAMENTOS, orcamento);
    }
    deleteOrcamento(id: string) { this.deleteItem<Orcamento>(STORAGE_KEYS.ORCAMENTOS, id); }

    // Pedidos
    getPedidos() { return this.getList<Pedido>(STORAGE_KEYS.PEDIDOS); }
    getPedidoById(id: string) { const list = this.getPedidos(); return list.find(p => p.id === id); }
    savePedido(pedido: Pedido) {
        if (!pedido.numero) {
            const nextNum = this.getItem<number>(STORAGE_KEYS.NEXT_ORCAMENTO_NUM, 25338);
            pedido.numero = nextNum;
            this.setItem(STORAGE_KEYS.NEXT_ORCAMENTO_NUM, nextNum + 1);
        }
        this.saveItem(STORAGE_KEYS.PEDIDOS, pedido);
    }
    deletePedido(id: string) { this.deleteItem<Pedido>(STORAGE_KEYS.PEDIDOS, id); }

    // --- Módulo 5: Produção ---

    // Ingredientes
    getIngredientes() { return this.getList<Ingrediente>(STORAGE_KEYS.INGREDIENTES); }
    saveIngrediente(ing: Ingrediente) { this.saveItem(STORAGE_KEYS.INGREDIENTES, ing); }
    deleteIngrediente(id: string) { this.deleteItem<Ingrediente>(STORAGE_KEYS.INGREDIENTES, id); }

    // Categorias
    getCategorias() {
        const list = this.getList<Categoria>(STORAGE_KEYS.CATEGORIAS);
        if (list.length === 0) {
            return initialData.categoriasPadrao.map(nome => ({ id: crypto.randomUUID(), nome }));
        }
        return list;
    }
    saveCategoria(cat: Categoria) {
        // Ensure storage has defaults first if empty?
        const list = this.getList<Categoria>(STORAGE_KEYS.CATEGORIAS);
        if (list.length === 0) {
            const defaults = initialData.categoriasPadrao.map(nome => ({ id: crypto.randomUUID(), nome }));
            this.setItem(STORAGE_KEYS.CATEGORIAS, defaults);
        }
        this.saveItem(STORAGE_KEYS.CATEGORIAS, cat);
    }
    deleteCategoria(id: string) { this.deleteItem<Categoria>(STORAGE_KEYS.CATEGORIAS, id); }


    // Receitas
    getReceitas() { return this.getList<Receita>(STORAGE_KEYS.RECEITAS); }
    saveReceita(rec: Receita) { this.saveItem(STORAGE_KEYS.RECEITAS, rec); }
    deleteReceita(id: string) { this.deleteItem<Receita>(STORAGE_KEYS.RECEITAS, id); }

    // Config Producao
    getConfigProducao() {
        const config = this.getItem<ConfigProducao | null>(STORAGE_KEYS.CONFIG_PRODUCAO, null);
        return config || initialData.configProducao as ConfigProducao;
    }
    saveConfigProducao(config: ConfigProducao) { this.setItem(STORAGE_KEYS.CONFIG_PRODUCAO, config); }

    // --- Módulo 6: Estoque ---
    getMovimentacoes(ingredienteId?: string) {
        const all = this.getList<Movimentacao>(STORAGE_KEYS.MOVIMENTACOES);
        if (ingredienteId) return all.filter(m => m.ingredienteId === ingredienteId).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        return all.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }

    saveMovimentacao(mov: Movimentacao) {
        const list = this.getList<Movimentacao>(STORAGE_KEYS.MOVIMENTACOES);
        list.push(mov);
        this.setItem(STORAGE_KEYS.MOVIMENTACOES, list);
    }
}

export const storage = new StorageService();
