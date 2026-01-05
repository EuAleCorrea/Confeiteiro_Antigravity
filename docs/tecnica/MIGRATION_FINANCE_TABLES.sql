-- =====================================================
-- MIGRAÇÃO: Tabelas Financeiras
-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/jtzhuvqkszsveybakbwp/sql/new
-- =====================================================

-- Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR NOT NULL,
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

-- Tabela de Contas a Receber
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

-- Tabela de Contas a Pagar
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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
