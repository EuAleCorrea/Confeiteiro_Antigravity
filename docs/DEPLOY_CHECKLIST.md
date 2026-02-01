# Checklist de Deploy - EasyPanel/Nixpacks

> Documento criado a partir de problemas reais encontrados durante o deploy. Execute ANTES de cada deploy.

---

## ✅ Checklist Pré-Deploy

### 1. Verificar Encoding de Arquivos

**Problema:** Nixpacks falha ao ler arquivos com encoding UTF-16LE (comum no Windows).

**Comando para detectar arquivos com encoding errado:**
```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object { 
  $enc = [System.IO.File]::ReadAllBytes($_.FullName)
  if ($enc.Length -ge 2 -and $enc[0] -eq 0xFF -and $enc[1] -eq 0xFE) { 
    Write-Host "UTF-16LE: $($_.FullName)" 
  } 
}
```

**Correção:**
```powershell
Get-Content -Path "arquivo.ts" -Encoding Unicode | Set-Content -Path "arquivo.temp.ts" -Encoding UTF8
Remove-Item "arquivo.ts"
Rename-Item "arquivo.temp.ts" "arquivo.ts"
```

---

### 2. Verificar nixpacks.toml

**Problema:** Nixpacks pode detectar Deno ao invés de Node.js se houver arquivos Deno no projeto (ex: `supabase/functions/`).

**Verificar se existe:**
```
c:\...\Confeiteiro\nixpacks.toml
```

**Conteúdo mínimo obrigatório:**
```toml
[phases.setup]
nixPkgs = ["nodejs_22"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node .next/standalone/server.js"
```

---

### 3. Verificar Versão do Node.js

**Problema:** Next.js 16+ requer Node.js >=20.9.0

**Requisito no nixpacks.toml:**
- ❌ `nodejs_20` (pode ser 20.6.1, muito antigo)
- ✅ `nodejs_22` (versão LTS mais recente)

---

### 4. Verificar next.config.ts

**Problema:** Falta de `output: "standalone"` quebra deploy em containers.

**Obrigatório:**
```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  trailingSlash: false,
};
```

---

### 5. Build Local Antes de Push

**Sempre rodar antes de fazer push:**
```bash
npm run build
```

Se falhar localmente, vai falhar no Nixpacks também.

---

### 6. Variáveis de Ambiente no EasyPanel

**Lista obrigatória:**
- `NODE_ENV=production`
- `HOSTNAME=0.0.0.0` (para aceitar conexões externas)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_URL` (URL de produção)
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- Variáveis Stripe (`STRIPE_SECRET_KEY`, etc.)

---

### 7. Configuração de Domínio no EasyPanel

**Porta correta:** O Nixpacks roda Next.js na porta **8000** por padrão (não 3000!)

| Campo | Valor |
|-------|-------|
| Host | `confeiteiro.sinapseai.com` |
| Porta | `8000` |
| Protocolo | HTTP |
| HTTPS | Ativado |

---

## 🔧 Problemas Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `stream did not contain valid UTF-8` | Arquivo em UTF-16LE | Converter para UTF-8 |
| `deno run` no processo | Nixpacks detectou Deno | Criar/verificar nixpacks.toml |
| `Node.js version >=20.9.0 required` | Node.js antigo | Usar `nodejs_22` no nixpacks.toml |
| `502 Bad Gateway` | Porta errada ou app não rodando | Verificar porta (8000) e logs |
| `Unexpected end of JSON input` | App respondendo erro | Verificar variáveis de ambiente |

---

## 📋 Resumo Rápido

```bash
# 1. Verificar encoding
# 2. Verificar nixpacks.toml existe
# 3. Build local: npm run build
# 4. Commit e push
# 5. Rebuild no EasyPanel
# 6. Verificar logs
# 7. Testar URL
```

---

*Última atualização: 2026-02-01*
