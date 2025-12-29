# Integração WhatsApp + Google Contacts

## Sessão: 27/12/2024

### Objetivos Completados

1. **Google Contacts no WhatsApp**
   - Implementado lookup dinâmico de nomes via Google People API
   - Nomes de contatos do Google aparecem automaticamente nos chats
   - Indicadores visuais: Avatar azul (Google), rosa (local), verde (desconhecido)

2. **Fix Mensagens Desalinhadas (LID vs JID)**
   - Identificado problema de IDs inconsistentes na instância
   - Documentado solução: recriar instância para sincronização limpa
   - Adicionado detecção robusta de `fromMe` com múltiplos fallbacks

### Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `lib/evolution-api.ts` | Detecção robusta de `fromMe` |
| `app/(dashboard)/whatsapp/[instanceName]/page.tsx` | SessionProvider wrapper |
| `app/(dashboard)/whatsapp/[instanceName]/client-page.tsx` | Google Contacts lookup |
| `docs/tecnica/WHATSAPP_INTEGRATION.md` | Documentação LID/JID e Google Contacts |

### Problema Resolvido

**Sintoma:** Mensagens enviadas via WhatsApp Web apareciam do lado errado (como se fossem do contato).

**Causa:** Inconsistência de IDs (LID vs JID) na instância do WhatsApp. Algumas mensagens eram armazenadas com JID tradicional (`55519999@s.whatsapp.net`) e outras com LID (`abc123@lid`).

**Solução:** Recriar a instância força uma sincronização limpa com IDs consistentes.

### Como Funciona o Lookup de Nomes

```
1. Verifica banco de dados local (clientes cadastrados)
   └── Encontrado? → Exibe nome + Avatar Rosa
   
2. Busca nos Google Contacts do usuário logado
   └── Encontrado? → Exibe nome + Avatar Azul + Ícone Google
   
3. Fallback
   └── Exibe número formatado + Avatar Verde
```

### Próximos Passos

- [ ] Implementar normalização automática de IDs (JID prioritário)
- [ ] Adicionar cache local de Google Contacts com expiração
- [ ] Implementar envio de orçamentos via Gmail
