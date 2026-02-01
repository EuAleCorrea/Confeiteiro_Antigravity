# Relatório de Vulnerabilidades de Segurança
**Data**: 2026-01-29 | **Auditor**: `@security-auditor`

Este relatório detalha **7 vulnerabilidades** identificadas durante a auditoria de segurança do projeto Confeiteiro.

---

## 🚨 Vulnerabilidades Críticas

### 1. Middleware de Autenticação Desativado (A01)
| Severidade | CVSS | Status |
|------------|------|--------|
| **CRÍTICA** | 9.8 | ⏳ Pendente |

**Arquivo**: `middleware.ts.disabled`
**Risco**: Rotas protegidas (`/dashboard/*`) acessíveis sem autenticação.
**Correção**: Renomear para `middleware.ts` para reativar proteção global.

---

### 2. CORS Wildcard no Webhook (A02)
| Severidade | CVSS | Status |
|------------|------|--------|
| **ALTA** | 7.5 | ⏳ Pendente |

**Arquivo**: `supabase/functions/stripe-webhook/index.ts` (linha 11)
```typescript
"Access-Control-Allow-Origin": "*"
```
**Risco**: Permite requisições cross-origin de qualquer domínio, facilitando ataques CSRF.
**Correção**: Restringir a origens confiáveis (`https://confeiteiro.automacaototal.com`).

---

### 3. Payment Links de TESTE em Produção (A08)
| Severidade | CVSS | Status |
|------------|------|--------|
| **ALTA** | 8.0 | ⏳ Pendente |

**Arquivo**: `app/checkout/[planId]/CheckoutClient.tsx` (linhas 11-15)
```typescript
basico: 'https://buy.stripe.com/test_...',
```
**Risco**: Links de teste não processam pagamentos reais. Usuários que "pagarem" não terão acesso.
**Correção**: Substituir por Payment Links de produção no Stripe Dashboard.

---

## ⚠️ Vulnerabilidades Moderadas

### 4. Chave Pública Supabase no Git (A04)
| Severidade | CVSS | Status |
|------------|------|--------|
| **MÉDIA** | 5.3 | ⏳ Pendente |

**Arquivo**: `.env` (commitado no Git)
**Risco**: A `anon_key` está exposta. Embora seja pública por design, sua exposição no código-fonte facilita ataques automatizados se RLS estiver mal configurado.
**Correção**: 
1. Mover para `.env.local` (já ignorado)
2. Regenerar chaves se necessário

---

### 5. Falta de Security Headers (A02)
| Severidade | CVSS | Status |
|------------|------|--------|
| **MÉDIA** | 5.0 | ⏳ Pendente |

**Arquivo**: `next.config.ts`
**Risco**: Sem headers de segurança (CSP, X-Frame-Options, HSTS), a aplicação é vulnerável a XSS, Clickjacking, e MITM.
**Correção**: Adicionar configuração de headers no Next.js.

---

### 6. RLS Incompleto em Tabelas (A01)
| Severidade | CVSS | Status |
|------------|------|--------|
| **ALTA** | 7.0 | ⚠️ A Verificar |

**Arquivo**: Tabelas Supabase (clientes, produtos, pedidos, etc.)
**Risco**: O `schema.sql` mostra RLS apenas para `profiles`. Outras tabelas podem estar desprotegidas, permitindo que usuários acessem dados de outros usuários.
**Correção**: Implementar políticas RLS em TODAS as tabelas de negócio.

> [!IMPORTANT]
> Executar `supabase.mcp get_advisors type:security` para verificar status atual do RLS.

---

## 📋 Vulnerabilidades de Baixa Prioridade

### 7. Código Morto de NextAuth (A06)
| Severidade | CVSS | Status |
|------------|------|--------|
| **BAIXA** | 2.0 | ⏳ Pendente |

**Arquivos**: 
- `components/clientes/ImportGoogleContactsModal.tsx`
- `package.json` (dependências `next-auth`, `@auth/core`)

**Risco**: Confusão de desenvolvedores, aumento da superfície de ataque, e funcionalidade quebrada.
**Correção**: Remover dependências não utilizadas e refatorar modal para Supabase Auth.

---

## 📊 Resumo e Priorização

| # | Vulnerabilidade | Severidade | Esforço | Prioridade |
|---|-----------------|------------|---------|------------|
| 1 | Middleware desativado | CRÍTICA | Baixo | 🔴 Imediato |
| 2 | CORS Wildcard | ALTA | Baixo | 🔴 Imediato |
| 3 | Payment Links TESTE | ALTA | Baixo | 🟠 Urgente |
| 4 | .env no Git | MÉDIA | Médio | 🟡 Em breve |
| 5 | Security Headers | MÉDIA | Médio | 🟡 Em breve |
| 6 | RLS Incompleto | ALTA | Alto | 🟠 Urgente |
| 7 | NextAuth Dead Code | BAIXA | Médio | 🟢 Planejado |

---

## Próximos Passos

1. **Aprovar este plano** para prosseguir com as correções
2. Correções serão aplicadas na ordem de prioridade acima
3. Após correções, realizar nova auditoria para validação
