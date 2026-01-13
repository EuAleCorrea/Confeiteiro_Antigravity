-- =====================================================
-- MASTER MIGRATION: Estrutura Completa do Banco de Dados
-- Projeto: Confeiteiro - Gestão de Confeitaria
-- Use este script para configurar o ambiente de DESENVOLVIMENTO
-- =====================================================

-- 1. Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    cpf VARCHAR,
    telefone VARCHAR NOT NULL,
    email VARCHAR,
    endereco JSONB DEFAULT '{}',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razao_social VARCHAR NOT NULL,
    nome_fantasia VARCHAR NOT NULL,
    cnpj VARCHAR,
    categoria VARCHAR NOT NULL,
    telefone VARCHAR NOT NULL,
    email VARCHAR,
    contato VARCHAR,
    endereco JSONB DEFAULT '{}',
    dados_bancarios JSONB DEFAULT '{}',
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    unidade VARCHAR NOT NULL,
    categoria VARCHAR NOT NULL,
    estoque_atual DECIMAL(10,3) DEFAULT 0,
    estoque_minimo DECIMAL(10,3) DEFAULT 0,
    estoque_maximo DECIMAL(10,3) DEFAULT 0,
    custo_unitario DECIMAL(10,2) DEFAULT 0,
    custo_medio DECIMAL(10,2) DEFAULT 0,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    codigo_produto VARCHAR,
    localizacao VARCHAR,
    marca VARCHAR,
    ultima_compra DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Sabores
CREATE TABLE IF NOT EXISTS sabores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    tipo VARCHAR NOT NULL, -- 'Massa' ou 'Recheio'
    descricao TEXT,
    custo_adicional DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    categoria_id UUID NOT NULL REFERENCES categorias(id),
    preco DECIMAL(10,2),
    precos_por_tamanho JSONB DEFAULT '{}',
    descricao TEXT,
    foto TEXT,
    tamanhos TEXT[] DEFAULT '{}',
    tempo_producao INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero SERIAL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_json JSONB,
    status VARCHAR DEFAULT 'Pendente',
    data_criacao DATE DEFAULT CURRENT_DATE,
    data_validade DATE,
    valor_total DECIMAL(10,2) DEFAULT 0,
    desconto DECIMAL(10,2) DEFAULT 0,
    decoracao JSONB DEFAULT '{}',
    observacoes TEXT,
    termos JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero SERIAL,
    orcamento_id UUID REFERENCES orcamentos(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_json JSONB,
    status VARCHAR DEFAULT 'Pendente',
    data_criacao DATE DEFAULT CURRENT_DATE,
    data_entrega DATE NOT NULL,
    tipo_entrega VARCHAR NOT NULL,
    endereco_entrega JSONB DEFAULT '{}',
    taxa_entrega DECIMAL(10,2) DEFAULT 0,
    valor_itens DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) DEFAULT 0,
    desconto DECIMAL(10,2) DEFAULT 0,
    decoracao JSONB DEFAULT '{}',
    observacoes TEXT,
    criado_por JSONB,
    atualizado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Itens Pedido/Orçamento
CREATE TABLE IF NOT EXISTS itens_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    tipo VARCHAR NOT NULL,
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    nome VARCHAR NOT NULL,
    tamanho VARCHAR,
    sabor_massa VARCHAR,
    sabor_recheio VARCHAR,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS itens_orcamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
    tipo VARCHAR NOT NULL,
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    nome VARCHAR NOT NULL,
    tamanho VARCHAR,
    sabor_massa VARCHAR,
    sabor_recheio VARCHAR,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- 10. Receitas
CREATE TABLE IF NOT EXISTS receitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    tipo VARCHAR NOT NULL,
    rendimentos JSONB DEFAULT '{}',
    modo_preparo TEXT,
    tempo_forno VARCHAR,
    temperatura INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itens_receita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE,
    ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
    quantidade DECIMAL(10,3) NOT NULL,
    unidade VARCHAR NOT NULL
);

-- 11. FINANCEIRO (Novas Tabelas)
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    data DATE NOT NULL,
    descricao VARCHAR NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    categoria_id UUID,
    categoria_nome VARCHAR,
    forma_pagamento VARCHAR,
    status VARCHAR DEFAULT 'Pendente',
    observacoes TEXT,
    pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
    movimentacao_estoque_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contas_receber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_json JSONB,
    descricao VARCHAR NOT NULL,
    categoria VARCHAR,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    saldo_restante DECIMAL(10,2) NOT NULL,
    data_cadastro DATE DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    status VARCHAR DEFAULT 'Pendente',
    pagamentos JSONB DEFAULT '[]',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contas_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    fornecedor_json JSONB,
    categoria VARCHAR,
    descricao VARCHAR NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    saldo_restante DECIMAL(10,2) NOT NULL,
    data_emissao DATE DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    status VARCHAR DEFAULT 'Pendente',
    pagamentos JSONB DEFAULT '[]',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave VARCHAR NOT NULL UNIQUE,
    valor JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Diversos (Faqs, Tickets, Colaboradores, Histórico)
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assunto VARCHAR NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR DEFAULT 'Aberto',
    prioridade VARCHAR DEFAULT 'Média',
    anexos TEXT[] DEFAULT '{}',
    mensagens JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS colaboradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    cpf VARCHAR,
    telefone VARCHAR NOT NULL,
    email VARCHAR,
    funcao VARCHAR NOT NULL,
    data_admissao DATE,
    status VARCHAR DEFAULT 'Ativo',
    escala TEXT[] DEFAULT '{}',
    horario_entrada TIME,
    horario_saida TIME,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices e outros objetos podem ser adicionados conforme necessário.
