# Pendências e Known Issues

Este documento lista funcionalidades pendentes, bugs conhecidos e débitos técnicos que precisam ser endereçados em futuras interações. É obrigatória a leitura deste documento antes de iniciar manutenções em módulos relacionados.

## Módulo: Integração WhatsApp (Evolution API v2)

### 1. Renderização de Imagens em Mensagens (Erro 403)
**Status:** 🔴 Pendente / Adiado
**Data de Identificação:** 27/12/2025

#### Descrição do Problema
As imagens recebidas nas mensagens do WhatsApp carregam corretamente a URL da mídia (`mmg.whatsapp.net`), mas não são exibidas no navegador.
- O navegador retorna erro **403 Forbidden** ao tentar carregar a imagem diretamente.
- Isso ocorre porque as URLs de mídia do WhatsApp são protegidas e rejeitam requisições diretas do navegador sem os headers de autenticação corretos ou cookies de sessão.
- A propriedade `jpegThumbnail` (base64) que poderia ser usada como fallback de baixa resolução não está sendo retornada pela API (valor `undefined` ou `hasThumbnail: false`).

#### Tentativas de Solução Realizadas
1.  **Acesso Direto:** Tentativa de usar a URL fornecida no `imageMessage.url`. **Falha:** Bloqueio CORS/Referer (403).
2.  **Fallback para Thumbnail:** Tentativa de usar `imageMessage.jpegThumbnail`. **Falha:** API não está retornando este campo consistentemente.

#### Solução Recomendada (Próximos Passos)
Implementar um **Media Proxy** no backend (Next.js API Route).
1.  Criar rota `/api/media-proxy?url=...`.
2.  O backend faz o fetch da imagem (server-side geralmente ignora as restrições de browser ou pode passar headers simulados).
3.  O backend repassa o blob da imagem para o frontend.
4.  Frontend altera `<img src={msg.url}>` para `<img src={`/api/media-proxy?url=${msg.url}`}>`.

**Alternativa:** Verificar configurações da Evolution API para forçar o download da mídia (`/chat/findMessages` com opção de download) ou converter para base64 no retorno (pode pesar o payload).

---
