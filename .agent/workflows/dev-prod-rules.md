---
description: Regras de ambiente DEV/PROD para o projeto Confeiteiro
---

# Regras de Ambiente (DEV/PROD)

## Ambientes Disponíveis

| Ambiente | Projeto Supabase | URL | Site URL (OAuth) | Uso |
|----------|------------------|-----|------------------|-----|
| **DEV** | `hzbstufkhnurrvnslvkc` | `https://hzbstufkhnurrvnslvkc.supabase.co` | `http://localhost:3000` | Desenvolvimento local e testes |
| **PROD** | `jtzhuvqkszsveybakbwp` | `https://jtzhuvqkszsveybakbwp.supabase.co` | `https://app.automacaototal.com` | Aplicação em produção (Hostinger) |

### ⚙️ Configuração Automática de Ambientes

**O sistema detecta automaticamente qual ambiente usar:**

| Situação | Fonte das Variáveis | Projeto Supabase |
|----------|---------------------|------------------|
| `npm run dev` (localhost) | `.env.local` (local, não comitado) | **DEV** |
| Cloudflare Pages (staging) | `wrangler.toml` (variáveis) | **DEV** |
| Docker/Hostinger (produção) | `docker-compose.yml` (variáveis injetadas) | **PROD** |

**Regra:** O arquivo `.env.local` **NUNCA** deve ser copiado para a imagem Docker. Ele é exclusivo para desenvolvimento local.

### Configurações de OAuth por Ambiente

| Ambiente | Site URL | Redirect URLs |
|----------|----------|---------------|
| **DEV** | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| **PROD** | `https://app.automacaototal.com` | `https://app.automacaototal.com/auth/callback` |

---

## ⚠️ IMPORTANTE: Sincronização de Projetos Supabase

### Regra Obrigatória de Sincronização

**Ao subir novas versões ou fazer alterações estruturais, AMBOS os projetos Supabase devem ser atualizados:**

1. **Alterações de Schema (tabelas, colunas, RLS):**
   - Aplicar primeiro em DEV e testar
   - Quando autorizado, aplicar as mesmas alterações em PROD
   - Documentar scripts SQL em `docs/tecnica/`

2. **Alterações em Auth/Providers:**
   - Se adicionar/remover providers OAuth, configurar em AMBOS os projetos
   - Manter as URLs de callback corretas para cada ambiente

3. **Edge Functions:**
   - Deploy em DEV primeiro para testes
   - Deploy em PROD quando autorizado

4. **Storage Buckets:**
   - Criar/modificar buckets em ambos os projetos
   - Manter políticas RLS sincronizadas

### Checklist de Sincronização

Antes de considerar uma alteração "completa", verificar:

- [ ] Alteração aplicada em DEV (`hzbstufkhnurrvnslvkc`)
- [ ] Alteração testada localmente
- [ ] Alteração aplicada em PROD (`jtzhuvqkszsveybakbwp`) quando autorizado
- [ ] Funcionamento verificado em produção

---

## Regras Obrigatórias

### 1. Desenvolvimento Sempre em DEV
- **TODAS** as alterações de código devem ser testadas primeiro no ambiente DEV.
- O arquivo `.env.local` deve apontar para o projeto DEV durante o desenvolvimento.
- Nunca faça alterações diretamente no banco de PROD sem autorização explícita do usuário.

### 2. Alterações no Banco de Dados
- Novos scripts SQL devem ser criados em `docs/tecnica/` com nomes descritivos.
- Sempre rode o script primeiro no projeto DEV e verifique se funcionou.
- Salve o script para aplicar posteriormente em PROD quando autorizado.

### 3. Deploy para Produção
- **SOMENTE** mediante autorização explícita do usuário com a frase: "pode atualizar para produção" ou similar.
- Antes de aplicar em PROD, liste todas as alterações pendentes para revisão.
- Após aplicar em PROD, confirme que tudo está funcionando.

### 4. Troca de Ambiente
Para alternar entre DEV e PROD, edite o arquivo `.env.local`:

**DEV (Padrão para desenvolvimento):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://hzbstufkhnurrvnslvkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG....(chave DEV)
```

**PROD (Apenas quando autorizado):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://jtzhuvqkszsveybakbwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG....(chave PROD)
```

---

## 5. Revisão de Documentação
- **Antes de iniciar qualquer nova funcionalidade**, revisar a documentação existente em `docs/`.
- Manter a documentação atualizada conforme o projeto evolui.
- Documentos importantes a consultar:
  - `docs/tecnica/` - Scripts SQL, migrações e configurações técnicas
  - `.agent/workflows/` - Regras e processos de desenvolvimento
  - `README.md` - Visão geral do projeto
- Ao finalizar uma feature significativa, atualizar a documentação correspondente.

---

## Checklist para Deploy em Produção

Antes de aplicar qualquer alteração em PROD, verifique:

- [ ] Alteração testada e funcionando em DEV
- [ ] Scripts SQL salvos em `docs/tecnica/`
- [ ] Autorização explícita do usuário obtida
- [ ] Backup dos dados de PROD considerado (se necessário)
- [ ] Scripts aplicados em PROD
- [ ] Verificação pós-deploy realizada
