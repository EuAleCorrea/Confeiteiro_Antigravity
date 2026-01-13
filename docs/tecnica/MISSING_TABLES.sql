-- =====================================================
-- TABELAS COMPLEMENTARES (Faltantes no script original)
-- Execute este SQL no projeto de DESENVOLVIMENTO
-- =====================================================

-- 1. Adereços (Decorações, toppers, etc.)
CREATE TABLE IF NOT EXISTS aderecos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) DEFAULT 0,
    estoque INTEGER DEFAULT 0,
    estoque_min INTEGER DEFAULT 0,
    categoria VARCHAR,
    foto TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Categorias de Ingredientes
CREATE TABLE IF NOT EXISTS categorias_ingredientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Movimentações de Estoque
CREATE TABLE IF NOT EXISTS movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR NOT NULL,
    ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
    data TIMESTAMPTZ DEFAULT now(),
    quantidade DECIMAL(10,3) NOT NULL,
    quantidade_anterior DECIMAL(10,3) NOT NULL,
    quantidade_posterior DECIMAL(10,3) NOT NULL,
    valor_unitario DECIMAL(10,2),
    valor_total DECIMAL(10,2),
    motivo VARCHAR NOT NULL,
    pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
    nota_fiscal VARCHAR,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    usuario VARCHAR,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Histórico de Pedidos
CREATE TABLE IF NOT EXISTS historico_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    data TIMESTAMPTZ DEFAULT now(),
    acao VARCHAR NOT NULL,
    usuario VARCHAR NOT NULL,
    detalhes TEXT
);

-- 5. Envios de Orçamento
CREATE TABLE IF NOT EXISTS envios_orcamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    data TIMESTAMPTZ DEFAULT now(),
    tipo VARCHAR NOT NULL,
    telefone VARCHAR NOT NULL
);

-- 6. Adereços do Pedido
CREATE TABLE IF NOT EXISTS aderecos_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    adereco_id UUID REFERENCES aderecos(id) ON DELETE SET NULL,
    nome VARCHAR NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2)
);

-- =====================================================
-- FIM DO SCRIPT COMPLEMENTAR
-- =====================================================
