# GEMINI.md - Regras do Projeto Confeiteiro

> Este arquivo define regras específicas do projeto que a IA deve seguir **SEM EXCEÇÃO**.

---

## 🚀 DEPLOY NA VPS HOSTINGER

### ⚠️ REGRA CRÍTICA: Deploy APENAS na Hostinger

**NUNCA** fazer deploy no Cloudflare Pages. O deploy de produção é **EXCLUSIVAMENTE** na VPS Hostinger.

### URLs do Projeto

| Ambiente | URL |
|----------|-----|
| **DESENVOLVIMENTO / TESTES** | https://confeiteiro.automacaototal.com |
| **PRODUÇÃO** | *A definir (Requer autorização enfática)* |

### Processo de Deploy Completo

1. **Commit e Push:**
   ```bash
   git add -A
   git commit -m "mensagem"
   git push Confeiteiro feature/supabase-migration
   ```

2. **Deploy no Servidor (via plink do Windows):**
   ```bash
   plink -batch -pw fyS22vc9SSZ#lElX root@195.200.4.198 "cd /var/www/confeiteiro && git pull origin feature/supabase-migration && npm run build && pm2 restart confeiteiro"
   ```

3. **Verificar Deploy:**
   ```bash
   plink -batch -pw fyS22vc9SSZ#lElX root@195.200.4.198 "curl -s -o /dev/null -w '%{http_code}' https://confeiteiro.automacaototal.com"
   ```
   Deve retornar `200`.

### Informações do Servidor

- **IP**: 195.200.4.198
- **Hostname**: srv561524.hstgr.cloud
- **Senha Root**: `fyS22vc9SSZ#lElX`
- **Diretório**: `/var/www/confeiteiro`
- **Arquitetura**: Next.js Server Mode (PM2) + Nginx Proxy Reverso
- **SSL**: Let's Encrypt (auto-renovação)
- **Gerenciador de Processos**: PM2 (app name: `confeiteiro`)

### ⚠️ IMPORTANTE: next.config.ts

**NÃO usar `output: 'export'`** no servidor. Esta opção é incompatível com Server Actions e impede o modo servidor.

O `next.config.ts` no servidor deve ter:
```typescript
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: false,
};
```

---

## 🔐 BANCO DE DADOS SUPABASE

### Projeto DEV (Atual)
- **Project ID**: `hzbstufkhnurrvnslvkc`
- **URL**: https://hzbstufkhnurrvnslvkc.supabase.co
- **Conta**: appconfeiteiro@gmail.com / Ale386124$

### Redirect URLs Configuradas
- `http://localhost:3000/**`
- `https://confeiteiroantigravity.pages.dev/**`
- `https://*.confeiteiroantigravity.pages.dev/**`

---

## 🔧 CONFIGURAÇÕES IMPORTANTES

### Git Remote
- **Nome do remote**: `Confeiteiro` (NÃO é `origin`)
- **Branch principal de trabalho**: `feature/supabase-migration`

### OAuth / Login Social
- Sempre usar `window.location.origin` para redirect (detecta automaticamente localhost vs produção)
- NÃO usar variáveis de ambiente para redirect URL (Cloudflare Workers estático não suporta env vars em runtime)

---

## ⚠️ ERROS COMUNS A EVITAR

1. **Deploy sem `--branch=production`** → Resultado: URL principal não atualiza
2. **Push para `origin`** → Resultado: Erro, remote não existe (usar `Confeiteiro`)
3. **Usar `process.env.NEXT_PUBLIC_*` para URLs dinâmicas** → Resultado: Valor fixado no build

---

## 📁 ESTRUTURA DE ROTAS

- Landing Page: `/` (marketing)
- Dashboard: `/dashboard/*` (autenticado)
- Login: `/login`
- Auth Callback: `/auth/callback`

---

## ️ PROTOCOLO DE PRODUÇÃO

1. **Status Atual**: Todo o trabalho e deploys atuais são destinados ao ambiente de **DESENVOLVIMENTO e TESTES**.
2. **Autorização para Produção**: Qualquer movimentação para um ambiente de produção real (clientes pagantes reais) deve ser solicitada pelo USER de maneira **enfática e explícita**.
3. **Double-Check Obrigatório**: A IA deve **sempre questionar** o USER ("Tem certeza que deseja aplicar isso em produção?") antes de realizar qualquer alteração em ambiente produtivo ou crítico.

---

## 🧠 DIRETRIZES DE IA & APRENDIZADOS (MEMÓRIA PERSISTENTE)

### 1. Autenticação e Onboarding (Supabase)
- **Problema de Envio de Email**: `admin.createUser` + `email_confirm: true` NÃO envia email automaticamente. `admin.generateLink` também não envia.
- **Solução Padronizada**: Usar `supabase.auth.admin.inviteUserByEmail(email)`. Esta função cria o usuário e dispara o template de convite real.
- **Limitações do MCP**: Ferramentas como `execute_sql` e `list_tables` falham por permissão. Sempre gerar script SQL para execução manual pelo usuário.

### 2. Pagamentos (Stripe)
- **Trials**: Sempre gerar Payment Links via API configurando `subscription_data.trial_period_days` explicitamente. O Dashboard é propenso a falhas nesse setup.

### 3. Deployment (ATUALIZADO 2026-01-27)
- **Arquitetura**: Next.js roda como servidor Node.js via PM2, com Nginx como proxy reverso na porta 443.
- **NÃO usar `output: 'export'`**: Server Actions são incompatíveis com static export. O build falha silenciosamente e não gera o diretório `out/`.
- **Comandos de deploy**: Usar `plink -batch` do Windows para automação (evita problemas de autenticação interativa SSH).
- **Após build**: Sempre rodar `pm2 restart confeiteiro` para aplicar mudanças.
- **Verificação**: Testar com `curl` que retorne HTTP 200.

### 4. Nginx Configuration
- **Arquivo**: `/etc/nginx/sites-available/confeiteiro`
- **Modo**: Proxy reverso para `http://127.0.0.1:3000`
- **NUNCA** configurar como static files (`root /var/www/confeiteiro/out`) - isso quebra o app.

---

## 📋 TODOs PENDENTES

### 🔴 Alta Prioridade

1. **Reimplementar Importação de Contatos do Google**
   - **Arquivo**: `components/clientes/ImportGoogleContactsModal.tsx`
   - **Solução necessaria**: Refatorar para Supabase Auth

2. **Configurar Webhook do Stripe (Fluxo Onboarding)**
   - **Status**: Em andamento.
   - **Correção necessária**: Atualizar webhook para usar `inviteUserByEmail`.
   - **Data**: 2026-01-26
