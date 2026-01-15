# Deploy para Cloudflare Workers/Pages

Este documento descreve o processo completo de deploy do Confeiteiro para Cloudflare, usando o projeto Supabase DEV para ambiente de testes.

## 📋 Pré-requisitos

- Conta no Cloudflare com projeto Workers/Pages configurado
- Repositório GitHub conectado ao Cloudflare
- Projeto Supabase DEV configurado (`hzbstufkhnurrvnslvkc`)

## 🌐 URLs do Ambiente

| Ambiente | URL |
|----------|-----|
| **Cloudflare** | `https://confeiteiroantigravity.soft-tooth-9331.workers.dev` |
| **Supabase DEV** | `https://hzbstufkhnurrvnslvkc.supabase.co` |

---

## ⚙️ Configurações Necessárias

### 1. Arquivo `next.config.ts`

Para funcionar no Cloudflare como site estático:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // OBRIGATÓRIO para Cloudflare
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
```

**⚠️ IMPORTANTE:** `output: 'export'` gera arquivos estáticos HTML/JS/CSS. Isso significa que:
- Não há servidor Node.js
- API Routes não funcionam (use Supabase ou APIs externas)
- Middleware é limitado

### 2. Arquivo `wrangler.jsonc`

```json
{
    "name": "confeiteiroantigravity",
    "compatibility_date": "2025-12-23",
    "assets": {
        "directory": "./out"
    }
}
```

### 3. Arquivo `.env` (CRÍTICO!)

**Este arquivo DEVE existir no repositório** para que as variáveis estejam disponíveis durante o build no Cloudflare:

```env
# Variáveis de ambiente para build (Cloudflare Pages)
# Projeto DESENVOLVIMENTO (DEV)

NEXT_PUBLIC_SUPABASE_URL=https://hzbstufkhnurrvnslvkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **NOTA:** Variáveis `NEXT_PUBLIC_*` são públicas e podem ser comitadas. O Cloudflare NÃO injeta variáveis de ambiente durante o build - ele precisa do arquivo `.env`.

### 4. Arquivo `.gitignore`

O `.gitignore` deve permitir o `.env` mas ignorar o `.env.local`:

```gitignore
# env files
# .env é permitido (contém apenas NEXT_PUBLIC_* para build no Cloudflare)
# .env.local é ignorado (contém chaves locais de desenvolvimento)
.env.local
.env*.local
```

### 5. Auth Callback (Client-Side)

Para funcionar com static export, o callback de autenticação deve ser **client-side**:

**Arquivo:** `app/auth/callback/page.tsx`

```tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            const supabase = createClient()
            
            // Verifica se já há sessão (fluxo implícito)
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session) {
                router.push(searchParams.get('next') ?? '/')
                return
            }

            // Tenta trocar código por sessão (fluxo PKCE)
            const code = searchParams.get('code')
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code)
                if (!error) {
                    router.push(searchParams.get('next') ?? '/')
                } else {
                    setError(error.message)
                }
            }
        }
        handleCallback()
    }, [router, searchParams])

    // ... resto do componente
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AuthCallbackContent />
        </Suspense>
    )
}
```

**⚠️ IMPORTANTE:** O componente deve usar `<Suspense>` para `useSearchParams` funcionar em static export.

---

## 🔐 Configuração do Supabase DEV

### URL Configuration

No dashboard do Supabase DEV (`hzbstufkhnurrvnslvkc`):

1. **Site URL:**
   ```
   https://confeiteiroantigravity.soft-tooth-9331.workers.dev
   ```

2. **Redirect URLs:**
   ```
   https://confeiteiroantigravity.soft-tooth-9331.workers.dev/auth/callback
   ```

### Google OAuth

No Google Cloud Console, adicionar às **Origens JavaScript autorizadas**:
```
https://confeiteiroantigravity.soft-tooth-9331.workers.dev
```

---

## 🚀 Processo de Deploy

### Deploy Automático (via GitHub)

1. Fazer commit das alterações
2. Push para a branch `main`
3. Cloudflare detecta automaticamente e inicia o build
4. Build: `npm run build`
5. Deploy: arquivos do diretório `./out` são publicados

### Comandos

```bash
# Commit e push
git add .
git commit -m "feat: sua mensagem"
git push origin main  # ou 'git push Confeiteiro feature/supabase-migration:main'
```

---

## 🐛 Problemas Comuns e Soluções

### Erro: "Your project's URL and API key are required"

**Causa:** Arquivo `.env` não existe ou não está no repositório.

**Solução:**
1. Verificar se `.env` existe: `Test-Path .env`
2. Verificar se está no git: `git ls-files .env`
3. Se não estiver, criar e comitar

### Erro: "PKCE code verifier not found in storage"

**Causa:** Fluxo de autenticação OAuth incompatível com static export.

**Solução:**
- Converter o callback de `route.ts` (server-side) para `page.tsx` (client-side)
- Usar `supabase.auth.getSession()` antes de tentar `exchangeCodeForSession`

### Erro: "Export encountered an error on /auth/callback"

**Causa:** Usando `useSearchParams` sem `<Suspense>`.

**Solução:**
- Envolver o componente que usa `useSearchParams` em `<Suspense>`

### Erro: "Module not found: ./WhatsAppRedirect"

**Causa:** Arquivos deletados acidentalmente durante conflitos de git/OneDrive.

**Solução:**
- Restaurar arquivos: `git checkout HEAD~1 -- "caminho/do/arquivo"`

---

## 📁 Estrutura de Arquivos Críticos

```
confeiteiro/
├── .env                          # ⚠️ CRÍTICO - variáveis para build
├── .env.local                    # Para desenvolvimento local (ignorado no git)
├── .gitignore                    # Deve permitir .env, ignorar .env.local
├── next.config.ts                # output: 'export'
├── wrangler.jsonc                # assets: { directory: "./out" }
├── app/
│   └── auth/
│       └── callback/
│           └── page.tsx          # Client-side callback (não route.ts!)
└── lib/
    └── supabase/
        └── client.ts             # Cliente Supabase browser
```

---

## ✅ Checklist Pré-Deploy

- [ ] Arquivo `.env` existe e contém `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env` está no git (`git ls-files .env` retorna `.env`)
- [ ] `next.config.ts` tem `output: 'export'`
- [ ] `wrangler.jsonc` tem `assets.directory: "./out"`
- [ ] Auth callback é `page.tsx` (não `route.ts`)
- [ ] Auth callback usa `<Suspense>` para `useSearchParams`
- [ ] Supabase DEV tem Site URL correto
- [ ] Supabase DEV tem Redirect URL correto
- [ ] Build local funciona: `npm run build`

---

## 📅 Histórico de Alterações

| Data | Alteração |
|------|-----------|
| 2026-01-15 | Documentação inicial criada |
