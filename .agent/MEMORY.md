# Memória do Projeto Confeiteiro

Este arquivo contém regras obrigatórias que o Antigravity DEVE seguir ao trabalhar neste projeto.

---

## 🚨 REGRAS OBRIGATÓRIAS

### 1. Deploy para Cloudflare

**ANTES de fazer qualquer deploy para Cloudflare (push para main ou branch de produção):**

1. **OBRIGATÓRIO:** Ler o arquivo `.agent/workflows/cloudflare-deploy.md`
2. **EXECUTAR** todas as verificações do checklist
3. **CORRIGIR** qualquer problema encontrado antes de fazer push
4. **TESTAR** o build local com `npm run build` antes de push

**Comando para consultar o workflow:**
```
view_file .agent/workflows/cloudflare-deploy.md
```

### 2. Ambientes DEV/PROD

- **SEMPRE** consultar `.agent/workflows/dev-prod-rules.md` antes de alterações em variáveis de ambiente ou credenciais
- **NUNCA** comitar chaves de PROD no código
- **VERIFICAR** qual ambiente está sendo usado antes de testar

### 3. Supabase

- **DEV:** `hzbstufkhnurrvnslvkc` - Para localhost e Cloudflare (testes)
- **PROD:** `jtzhuvqkszsveybakbwp` - Para Hostinger (produção)
- **NUNCA** misturar credenciais entre ambientes

---

## 📁 Arquivos de Referência

| Arquivo | Descrição | Quando Consultar |
|---------|-----------|------------------|
| `.agent/workflows/cloudflare-deploy.md` | Checklist deploy Cloudflare | Antes de push para main |
| `.agent/workflows/dev-prod-rules.md` | Regras DEV/PROD | Alterações de ambiente |
| `docs/tecnica/DEPLOY_CLOUDFLARE.md` | Documentação completa Cloudflare | Problemas de deploy |
| `docs/tecnica/SUPABASE_CREDENTIALS.md` | Credenciais Supabase | Configuração de auth |

---

## ⚠️ Erros Comuns a Evitar

1. **Arquivo `.env` deletado:** Sempre verificar se existe antes de push
2. **Arquivos deletados por OneDrive:** Verificar status do git antes de commit
3. **PKCE error:** Callback deve ser client-side (`page.tsx`, não `route.ts`)
4. **Variáveis não disponíveis no build:** `.env` deve estar no git para Cloudflare

---

## 📝 Fluxo de Trabalho

```
Alteração no código
        ↓
Testar localmente (npm run dev)
        ↓
Se deploy para Cloudflare:
   → Consultar .agent/workflows/cloudflare-deploy.md
   → Executar checklist
   → Corrigir problemas
        ↓
npm run build (testar build local)
        ↓
git add . && git commit && git push
```
