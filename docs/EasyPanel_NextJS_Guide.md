# Guia EasyPanel - Deploy de Projetos Next.js

> Guia genérico para deploy de qualquer projeto Next.js no EasyPanel com Nixpacks.
> Baseado em problemas reais encontrados em produção.

---

## 📋 Pré-Requisitos do Projeto

### 1. Arquivo `nixpacks.toml` (OBRIGATÓRIO)

Criar na raiz do projeto:

```toml
# nixpacks.toml - Forçar Node.js (Nixpacks pode detectar Deno erroneamente)

[phases.setup]
nixPkgs = ["nodejs_22"]  # Next.js 16+ requer >=20.9.0

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node .next/standalone/server.js"
```

**Por que é necessário:**
- Nixpacks auto-detecta frameworks, mas pode confundir com Deno se houver `supabase/functions/`
- A versão padrão `nodejs_20` pode vir como 20.6.1 (abaixo do mínimo 20.9.0)

---

### 2. Configuração `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  output: "standalone",  // OBRIGATÓRIO para containers
  images: { unoptimized: true },
  trailingSlash: false,
};
```

---

### 3. Encoding de Arquivos (Windows)

⚠️ **Problema comum no Windows:** Arquivos salvos como UTF-16LE quebram o Nixpacks.

**Detectar arquivos com encoding errado:**
```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.json | ForEach-Object { 
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) { 
    Write-Host "UTF-16LE: $($_.FullName)" 
  } 
}
```

**Corrigir (converter para UTF-8):**
```powershell
$file = "caminho/para/arquivo.ts"
Get-Content -Path $file -Encoding Unicode | Set-Content -Path "$file.temp" -Encoding UTF8
Remove-Item $file; Rename-Item "$file.temp" $file
```

---

## 🔧 Configuração no EasyPanel

### Passo 1: Criar App

1. Acessar EasyPanel → Projeto
2. **+ Create Service** → **App**
3. Nome: `nome-do-app`

### Passo 2: Configurar Source

| Campo | Valor |
|-------|-------|
| Type | **GitHub** |
| Repository | `usuario/repo` |
| Branch | `main` ou `feature/...` |
| Build Type | **Nixpacks** |

### Passo 3: Variáveis de Ambiente

**Obrigatórias:**
```
NODE_ENV=production
HOSTNAME=0.0.0.0
```

**Específicas do projeto (adicionar conforme necessário):**
- `NEXT_PUBLIC_*` (variáveis públicas)
- `DATABASE_URL`, `NEXTAUTH_SECRET`, etc.

### Passo 4: Configurar Domínio

1. Aba **Domains** → **Add Domain**
2. Host: `app.seudominio.com`
3. **Porta: 8000** (Next.js no Nixpacks usa 8000, não 3000!)
4. Protocol: HTTP
5. HTTPS: Ativado

### Passo 5: DNS (Cloudflare ou outro)

| Tipo | Nome | Conteúdo | Proxy |
|------|------|----------|-------|
| A | app | IP_DA_VPS | Proxied |

---

## 🚀 Processo de Deploy

```bash
# 1. Build local (testar antes)
npm run build

# 2. Commit e push
git add -A
git commit -m "mensagem"
git push origin branch

# 3. No EasyPanel: Clicar "Rebuild"

# 4. Verificar
curl -s -o /dev/null -w '%{http_code}' https://app.seudominio.com
```

---

## 🐛 Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| `stream did not contain valid UTF-8` | Arquivo UTF-16LE | Converter para UTF-8 |
| `deno run` nos logs | Nixpacks detectou Deno | Criar `nixpacks.toml` |
| `Node.js version >=X required` | Versão antiga | Usar `nodejs_22` no nixpacks.toml |
| `502 Bad Gateway` | Porta errada | Usar porta **8000** no domínio |
| App não inicia | Falta `output: standalone` | Adicionar no `next.config.ts` |

---

## 🔍 Debug no Container

Se o app não funcionar, acessar shell do container:

```bash
# Ver estrutura
ls -la /app/
ls -la /app/.next/

# Ver processo rodando
ps aux

# Testar localmente
curl http://localhost:8000/
```

---

## ⚙️ Arquivos de Template

### nixpacks.toml
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

### next.config.ts (mínimo)
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
};

export default nextConfig;
```

---

## 📝 Checklist Rápido

- [ ] `nixpacks.toml` existe na raiz
- [ ] `next.config.ts` tem `output: "standalone"`
- [ ] Todos arquivos em UTF-8 (não UTF-16)
- [ ] `npm run build` passa localmente
- [ ] Variáveis de ambiente configuradas no EasyPanel
- [ ] Porta do domínio é **8000**
- [ ] DNS configurado apontando para IP da VPS

---

*Criado: 2026-02-01 | Baseado em deploy real com problemas documentados*
