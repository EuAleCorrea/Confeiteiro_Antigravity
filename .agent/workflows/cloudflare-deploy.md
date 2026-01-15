---
description: Checklist obrigatório antes de fazer deploy para Cloudflare
---

# Deploy Cloudflare - Checklist Obrigatório

Este workflow define os passos obrigatórios a serem verificados antes de qualquer deploy para Cloudflare.

## ⚠️ REGRA PRINCIPAL

**Antes de fazer push para a branch main (deploy Cloudflare), SEMPRE execute todas as verificações abaixo.**

---

## 📋 Checklist de Verificação

### 1. Verificar arquivo `.env`

```bash
# Verificar se existe
Test-Path .env

# Verificar se está no git
git ls-files .env

# Verificar conteúdo
cat .env | Select-String "SUPABASE"
```

**Esperado:**
- `.env` existe ✅
- `.env` está rastreado pelo git ✅
- Contém `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

**Se falhar:** Recriar o arquivo `.env` com as variáveis do Supabase DEV.

---

### 2. Verificar `next.config.ts`

```bash
cat next.config.ts | Select-String "output"
```

**Esperado:** `output: 'export'`

**Se falhar:** Editar `next.config.ts` e adicionar `output: 'export'`.

---

### 3. Verificar `wrangler.jsonc`

```bash
cat wrangler.jsonc
```

**Esperado:**
```json
{
    "name": "confeiteiroantigravity",
    "compatibility_date": "2025-12-23",
    "assets": {
        "directory": "./out"
    }
}
```

---

### 4. Verificar Auth Callback

```bash
# Deve ser page.tsx, NÃO route.ts
Test-Path "app/auth/callback/page.tsx"
Test-Path "app/auth/callback/route.ts"
```

**Esperado:**
- `page.tsx` existe ✅
- `route.ts` NÃO existe ✅

**Se falhar:** Converter o callback de server-side para client-side.

---

### 5. Verificar `.gitignore`

```bash
cat .gitignore | Select-String "env"
```

**Esperado:**
- `.env.local` está ignorado
- `.env` NÃO está ignorado (ou seja, é permitido)

---

### 6. Testar build local

```bash
# Limpar cache anterior
if (Test-Path .next) { Remove-Item .next -Recurse -Force }

# Executar build
npm run build
```

**Esperado:** Build conclui sem erros.

**Se falhar:** Verificar os erros e corrigir antes de fazer push.

---

## 🔐 Verificar Supabase DEV

Antes do primeiro deploy ou após alterações de URL:

### Site URL
- Deve ser: `https://confeiteiroantigravity.soft-tooth-9331.workers.dev`

### Redirect URLs
- Deve conter: `https://confeiteiroantigravity.soft-tooth-9331.workers.dev/auth/callback`

---

## 🚀 Comandos de Deploy

// turbo
```bash
git add .
git status
```

```bash
git commit -m "sua mensagem de commit"
```

// turbo
```bash
git push Confeiteiro feature/supabase-migration:main --force
```

---

## 🐛 Troubleshooting Rápido

| Erro | Causa | Solução |
|------|-------|---------|
| "URL and API key required" | `.env` não existe ou não está no git | Recriar `.env` e comitar |
| "PKCE code verifier not found" | Callback usa server-side auth | Converter para `page.tsx` client-side |
| "Export error on /auth/callback" | Faltando `<Suspense>` | Envolver `useSearchParams` em `<Suspense>` |
| "Module not found" | Arquivos deletados | Restaurar com `git checkout HEAD~1 -- caminho` |
| Build falha no Cloudflare | Cache antigo | Fazer pequena alteração e novo push |

---

## 📚 Documentação Relacionada

- `docs/tecnica/DEPLOY_CLOUDFLARE.md` - Documentação completa
- `docs/tecnica/SUPABASE_CREDENTIALS.md` - Credenciais do Supabase
- `.agent/workflows/dev-prod-rules.md` - Regras de ambiente DEV/PROD
