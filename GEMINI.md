# GEMINI.md - Regras do Projeto Confeiteiro

> Este arquivo define regras específicas do projeto que a IA deve seguir **SEM EXCEÇÃO**.

---

## 🚀 DEPLOY NO CLOUDFLARE PAGES

### REGRA CRÍTICA: Sempre usar `--branch=production`

**NUNCA** fazer deploy sem especificar a branch de produção. O comando correto é:

```bash
npx wrangler pages deploy ./out --project-name=confeiteiroantigravity --branch=production
```

### URLs do Projeto

| Ambiente | URL |
|----------|-----|
| **PRODUÇÃO** | https://production.confeiteiroantigravity.pages.dev |
| **Preview** | https://feature-supabase-migration.confeiteiroantigravity.pages.dev |

### Processo de Deploy Completo

1. `git add -A`
2. `git commit -m "mensagem"`
3. `git push Confeiteiro feature/supabase-migration`
4. `npm run build`
5. `npx wrangler pages deploy ./out --project-name=confeiteiroantigravity --branch=production`

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
