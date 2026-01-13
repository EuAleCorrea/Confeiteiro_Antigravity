---
description: Regras de ambiente DEV/PROD para o projeto Confeiteiro
---

# Regras de Ambiente (DEV/PROD)

## Ambientes Disponíveis

| Ambiente | Projeto Supabase | URL | Uso |
|----------|------------------|-----|-----|
| **DEV** | `hzbstufkhnurrvnslvkc` | `https://hzbstufkhnurrvnslvkc.supabase.co` | Desenvolvimento local e testes |
| **PROD** | `jtzhuvqkszsveybakbwp` | `https://jtzhuvqkszsveybakbwp.supabase.co` | Aplicação em produção |

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
