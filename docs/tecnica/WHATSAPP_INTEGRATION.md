# Integração WhatsApp (Evolution API)

Este documento detalha a implementação técnica do módulo de WhatsApp no sistema Confeiteiro, utilizando a Evolution API v2.

## 1. Visão Geral

O módulo permite que o usuário conecte sua instância do WhatsApp para visualizar conversas, enviar mensagens e interagir com clientes diretamente pelo dashboard.

**Stack:**
- **Frontend:** Next.js 15 (App Router)
- **API Client:** `lib/evolution-api.ts`
- **Gateway:** Evolution API v2 (hospedada externamente)

## 2. Estrutura de Arquivos

- `lib/evolution-api.ts`: Singleton service que centraliza todas as chamadas HTTP à Evolution API.
- `app/(dashboard)/whatsapp/page.tsx`: Dashboard principal. Gerencia instâncias (criar, deletar, abrir).
- `app/(dashboard)/whatsapp/[instanceName]/connect/page.tsx`: Tela de conexão via QR Code.
- `app/(dashboard)/whatsapp/[instanceName]/page.tsx`: Interface de Chat (lista de conversas e mensagens).

## 3. Configuração

### Variáveis de Ambiente
A configuração da API utiliza variáveis de ambiente com fallback para localStorage:

```env
# .env.local
NEXT_PUBLIC_EVOLUTION_API_URL=https://apiwp.automacaototal.com
NEXT_PUBLIC_EVOLUTION_API_KEY=sua_api_key_aqui
```

### Prioridade de Configuração
1. **Variáveis de ambiente** (NEXT_PUBLIC_*) têm prioridade máxima
2. **localStorage** (`evolution_config`) usado apenas para `instanceName`
3. A função `loadEvolutionConfig()` mescla ambas as fontes

### Filtragem de Instância
- O usuário define o nome da sua instância nas configurações
- O método `fetchInstances` retorna apenas a instância correspondente
- Instâncias desconhecidas são ignoradas por segurança

## 4. Fluxo de Conexão (Otimizado)

### Criação Automática de Instância
O método `connectInstance()` agora inclui `ensureInstanceExists()`:
1. Verifica se a instância existe no servidor
2. Se não existir, cria automaticamente antes de gerar QR Code
3. Evita erros 404 "instance does not exist"

### Estabilidade do QR Code
1. **Estados Transitórios:** Timer pausado durante `connecting`/`authenticating`
2. **Estado `verifying`:** UI mantém QR visível com overlay de validação
3. **Botão Manual:** "Já escaneei o QR Code" para verificação forçada
4. **Validação Final:** Redirecionamento só com `state: 'open'`

## 5. Interface de Chat

### Endpoints da API (POST obrigatório na v2)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/instance/create` | POST | Criar nova instância |
| `/instance/connect/{name}` | GET | Gerar QR Code |
| `/instance/connectionState/{name}` | GET | Status da conexão |
| `/chat/findChats/{name}` | **POST** | Listar conversas |
| `/chat/findMessages/{name}` | **POST** | Buscar mensagens |
| `/message/sendText/{name}` | POST | Enviar mensagem |

### Mapeamento de Dados

A API Evolution v2 retorna estruturas diferentes do esperado. O service faz mapeamento:

**Chats (`fetchChats`):**
```typescript
// Entrada da API
{ remoteJid, pushName, lastMessage: { messageTimestamp, message: {...} } }

// Saída mapeada
{ id: remoteJid, name: pushName, lastMessage: { timestamp: messageTimestamp * 1000, ... } }
```

**Mensagens (`fetchMessages`):**
```typescript
// Entrada da API (estrutura aninhada)
{ messages: { records: [...], total: N } }

// O service extrai e retorna apenas records[]
```

### Tratamento de Tipos de Mensagem

O campo `lastMessage.message` pode ser:
- `string` (texto simples)
- `object` com `conversation`, `extendedTextMessage`, `imageMessage`, etc.

O frontend trata todos os casos com fallback em cascata.

## 6. Tratamento de Erros

### Retry Logic
1. Se busca de chats falhar, verifica conexão real via `/connectionState`
2. Se conectado, tenta novamente silenciosamente
3. Tela "Conexão Perdida" só após 3 falhas + confirmação de desconexão

### Normalização
- Status normalizado para lowercase (`CONNECTED` → `open`)
- Timestamps convertidos de segundos para milissegundos
- Base64 do QR Code prefixado automaticamente se necessário

## 7. Pontos de Atenção para Desenvolvedores

- **Método HTTP:** Endpoints de busca usam **POST**, não GET
- **Estrutura Aninhada:** `findMessages` retorna `{messages: {records: []}}`
- **Timestamp:** API retorna segundos, frontend espera milissegundos
- **ID do Chat:** Usar `remoteJid`, não `id` (pode ser null)
- **Nome do Contato:** Usar `pushName`, não `name`

## 8. Próximos Passos (To-Do)

- [ ] **Integração com Clientes:** Exibir modal com dados do cliente ao selecionar chat
- [ ] **Mídia:** Implementar upload e envio de imagens/áudio
- [ ] **Pedidos:** Criar pedido diretamente a partir de conversa
- [ ] **Webhooks:** Receber mensagens em tempo real (atualmente usa polling)

## 9. Histórico de Correções

### 27/12/2024
- ✅ Corrigido endpoints para usar POST em vez de GET
- ✅ Adicionado `ensureInstanceExists()` para criar instância automaticamente
- ✅ Configuração via variáveis de ambiente (`.env.local`)
- ✅ Mapeamento de `remoteJid` → `id` e `pushName` → `name`
- ✅ Conversão de timestamp (segundos → milissegundos)
- ✅ Extração de `data.messages.records` para mensagens
- ✅ Tratamento de `lastMessage.message` como objeto
- ✅ Null safety em filtros e renderização

