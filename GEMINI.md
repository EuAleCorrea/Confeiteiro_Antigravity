# GEMINI.md - Regras do Projeto Confeiteiro

> Este arquivo define regras específicas do projeto que a IA deve seguir **SEM EXCEÇÃO**.

---

## 🚀 DEPLOY VIA EASYPANEL

### ⚠️ REGRA CRÍTICA: Deploy APENAS via EasyPanel

**NUNCA** fazer deploy via SSH direto ou Cloudflare Pages. O deploy é **EXCLUSIVAMENTE** via EasyPanel na VPS Hostinger.

### URLs do Projeto

| Ambiente | URL |
|----------|-----|
| **DESENVOLVIMENTO / TESTES** | https://confeiteiro.sinapseai.com |
| **PRODUÇÃO** | *A definir (Requer autorização enfática)* |

### Processo de Deploy Completo

1. **Commit e Push:**
   ```bash
   git add -A
   git commit -m "mensagem"
   git push Confeiteiro feature/supabase-migration
   ```

2. **Deploy no EasyPanel:**
   - Acessar EasyPanel: `https://srv561524.hstgr.cloud` (porta padrão)
   - Navegar para: **Projeto `meu_negocio`** → **App `confeiteiro`**
   - Clicar em **"Rebuild"** ou **"Deploy"**
   - Aguardar build do Nixpacks concluir

3. **Verificar Deploy:**
   ```bash
   curl -s -o /dev/null -w '%{http_code}' https://confeiteiro.sinapseai.com
   ```
   Deve retornar `200`.

4. **Lembrete de Segurança**: Antes de iniciar qualquer deploy, a IA deve obrigatoriamente lembrar o USER de que existem vulnerabilidades pendentes documentadas em `docs/vulnerabilities.md` que precisam ser corrigidas. Este lembrete **não impede** a execução do deploy caso o USER deseje prosseguir.

5. **Lembrete de SEO**: Antes de iniciar qualquer deploy, a IA deve lembrar o USER de verificar se as pendências de SEO/GEO listadas em `docs/SEO_Pendencias.md` foram atendidas. Este lembrete **não impede** a execução do deploy.

### Informações do Servidor (EasyPanel)

| Item | Valor |
|------|-------|
| **IP** | 195.200.4.198 |
| **Hostname** | srv561524.hstgr.cloud |
| **Painel** | EasyPanel |
| **Projeto** | `meu_negocio` |
| **App** | `confeiteiro` |
| **Build** | Nixpacks (auto-detecta Next.js) |
| **SSL** | Let's Encrypt (gerenciado pelo EasyPanel) |
| **Senha Root** | `Ale386124613300#` |

### ⚠️ IMPORTANTE: next.config.ts

O `next.config.ts` DEVE ter `output: "standalone"` para funcionar com EasyPanel/Nixpacks:

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  trailingSlash: false,
};
```

### Variáveis de Ambiente (Configuradas no EasyPanel)

As seguintes variáveis estão configuradas na aba "Environment" do app:
- `NODE_ENV`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_BASICO`, `STRIPE_PRICE_PROFISSIONAL`, `STRIPE_PRICE_PREMIUM`

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

### 3. Deployment (ATUALIZADO 2026-02-01)
- **Arquitetura**: EasyPanel gerencia containers Docker via Nixpacks na VPS Hostinger.
- **OBRIGATÓRIO usar `output: 'standalone'`**: Necessário para builds em containers.
- **Encoding de arquivos**: Sempre verificar se arquivos `.ts` estão em UTF-8 (não UTF-16). Nixpacks falha com encoding incorreto.
- **Processo**: Push para GitHub → Rebuild no EasyPanel → Verificar com curl.
- **SSL**: Gerenciado automaticamente pelo EasyPanel via Let's Encrypt.

### 4. EasyPanel Configuration
- **Painel**: https://srv561524.hstgr.cloud
- **Projeto**: `meu_negocio`
- **App**: `confeiteiro`
- **Build**: Nixpacks (auto-detecta Next.js)
- **Variáveis de ambiente**: Configuradas na aba "Environment" do app
- **Domínio**: `confeiteiro.sinapseai.com`

### 5. Nixpacks - Erros Críticos Conhecidos (NOVO 2026-02-01)

| Problema | Causa | Solução |
|----------|-------|---------|
| `npm: command not found` | Nixpacks detectando Deno | Usar `providers = ["node"]` (ARRAY!) no nixpacks.toml |
| `invalid type: map, expected sequence` | Syntax errada: `[providers]` | Usar `providers = ["node"]` (não `[providers]`) |
| CSS não carrega | static/ não copiado para standalone | Adicionar `cp -r .next/static .next/standalone/.next/static` no build |
| 500 Internal Server Error externo | Domain config errada | No EasyPanel Domains: **Protocolo = HTTP** (não HTTPS), Porta = 8000 |
| Login redireciona domínio antigo | URLs desatualizadas | Atualizar NEXTAUTH_URL, NEXT_PUBLIC_APP_URL e Supabase Redirect URLs |

### 6. nixpacks.toml Correto (Referência)
```toml
providers = ["node"]

[variables]
NODE_VERSION = "20"

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = [
    "npm run build",
    "cp -r .next/static .next/standalone/.next/static",
    "cp -r public .next/standalone/public"
]

[start]
cmd = "node .next/standalone/server.js"
```

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
