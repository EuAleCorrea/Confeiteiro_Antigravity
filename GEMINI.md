# GEMINI.md - Regras do Projeto Confeiteiro

> Este arquivo define regras específicas do projeto que a IA deve seguir **SEM EXCEÇÃO**.

---

## 🚀 DEPLOY NA VPS HOSTINGER

### ⚠️ REGRA CRÍTICA: Deploy APENAS na Hostinger

**NUNCA** fazer deploy no Cloudflare Pages. O deploy de produção é **EXCLUSIVAMENTE** na VPS Hostinger.

### URLs do Projeto

| Ambiente | URL |
|----------|-----|
| **PRODUÇÃO** | https://confeiteiro.automacaototal.com |

### Processo de Deploy Completo

1. **Commit e Push:**
   ```bash
   git add -A
   git commit -m "mensagem"
   git push Confeiteiro feature/supabase-migration
   ```

2. **Deploy no Servidor (SSH):**
   ```bash
   ssh root@195.200.4.198
   cd /var/www/confeiteiro
   git pull origin feature/supabase-migration
   npm ci
   npm run build
   ```

3. **Verificar Deploy:**
   ```bash
   curl -I https://confeiteiro.automacaototal.com
   ```

### Informações do Servidor

- **IP**: 195.200.4.198
- **Hostname**: srv561524.hstgr.cloud
- **Senha Root**: `fyS22vc9SSZ#lElX`
- **Diretório**: `/var/www/confeiteiro`
- **Arquitetura**: Next.js Static Export + Nginx
- **SSL**: Let's Encrypt (auto-renovação)

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

## 📋 TODOs PENDENTES

### 🔴 Alta Prioridade

1. **Reimplementar Importação de Contatos do Google**
   - **Arquivo**: `components/clientes/ImportGoogleContactsModal.tsx`
   - **Página afetada**: `/dashboard/clientes`
   - **Problema**: Usava `next-auth` que foi removido na migração para Supabase Auth
   - **Solução necessária**: Refatorar para usar Supabase Auth com Google People API
   - **Data desabilitado**: 2026-01-24
