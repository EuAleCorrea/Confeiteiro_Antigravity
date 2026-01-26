-- ============================================
-- MIGRAÇÃO: Sistema de Assinaturas Stripe
-- Projeto: Confeiteiro
-- Data: 2026-01-26
-- ============================================

-- 1. Tabela de clientes Stripe vinculados a usuários
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON public.stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para stripe_customers
CREATE POLICY "Users can view own stripe customer" 
ON public.stripe_customers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all stripe customers" 
ON public.stripe_customers FOR ALL 
USING (auth.role() = 'service_role');

-- 6. Políticas RLS para subscriptions
CREATE POLICY "Users can view own subscription" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" 
ON public.subscriptions FOR ALL 
USING (auth.role() = 'service_role');

-- 7. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON public.stripe_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSTRUÇÕES PARA EXECUTAR:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
-- 2. Selecione o projeto: hzbstufkhnurrvnslvkc
-- 3. Vá em SQL Editor
-- 4. Cole e execute este script
-- ============================================
