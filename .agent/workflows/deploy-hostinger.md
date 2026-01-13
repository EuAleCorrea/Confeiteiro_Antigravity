---
description: Guia Mestre de Deploy na Hostinger VPS (Docker Swarm + Traefik)
---

# 🚀 Guia Mestre: Deploy na Hostinger VPS (Stack Docker)

Este guia documenta o processo definitivo para deploy de aplicações Next.js em VPS Hostinger que já possuam infraestrutura ativa (Portainer, Traefik, n8n, etc).

> **💡 Regra de Ouro:** Antes de começar, verifique o que já está rodando na porta 80/443. Se existir um Proxy Reverso (Traefik/Nginx), **NÃO** instale outro servidor web nativo. Integre-se ao existente via Docker.

## 1. Diagnóstico Inicial (Pre-flight Check)

Antes de qualquer deploy, conecte na VPS e verifique o terreno:

### Verificar Portas em Uso
```bash
ssh root@SEU_IP
ss -tulnp | grep :80
```
-   **Cenário A (Limpo):** Nada na porta 80. -> Pode usar instalação nativa (PM2 + Nginx) ou Docker.
-   **Cenário B (Ocupado):** Resultado mostra `docker-proxy` ou `traefik`. -> **OBRIGATÓRIO** usar Docker e integrar ao Proxy existente.

### Verificar Redes Docker
Descubra o nome da rede pública onde o Traefik está escutando:
```bash
docker network ls
```
*Geralmente chama-se `network_public`, `traefik-public` ou `web_network`.*

---

## 2. Preparação da Aplicação (Local)

Para rodar liso no Docker, sua aplicação Next.js precisa de ajustes específicos.

### A. Next.js Standalone Mode (Crucial!)
O modo standalone reduz o tamanho da imagem de ~1GB+ para ~150MB, copiando apenas o necessário.

**Arquivo:** `next.config.ts` (ou .js)
```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // <--- OBRIGATÓRIO PARA DOCKER
  images: { unoptimized: true }, // Evita erros de otimização de imagem sem sharp
};
export default nextConfig;
```

### B. Dockerfile Otimizado (Multi-stage)
Use este template testado e aprovado. Ele lida com permissões, cache e variáveis de ambiente.

**Arquivo:** `Dockerfile` (na raiz)
```dockerfile
FROM node:20-alpine AS base

# 1. Install Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# 2. Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Production Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next

# Copia apenas o build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copia .env.local se existir (atenção: não use lógica complexa no COPY)
COPY --from=builder --chown=nextjs:nodejs /app/.env.local ./.env.local

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### C. Stack File (Docker Compose para Swarm)
Defina como o Traefik vai enxergar seu serviço.

**Arquivo:** `docker-compose.yml`
```yaml
version: '3.8'

services:
  app:
    image: confeiteiro:latest # Nome da sua imagem
    build: .
    environment:
      - NODE_ENV=production
      # - Adicione outras vars aqui
    deploy:
      replicas: 1
      labels:
        # Habilita Traefik para este container
        - "traefik.enable=true"
        # Regra de Roteamento (Domínio)
        - "traefik.http.routers.confeiteiro.rule=Host(`automacaototal.com`)"
        # Entrypoint (websecure = porta 443 geralmente)
        - "traefik.http.routers.confeiteiro.entrypoints=websecure"
        # Resolver SSL (Certificado automático - verifique o nome no seu Traefik, ex: 'letsencrypt')
        - "traefik.http.routers.confeiteiro.tls.certresolver=letsencrypt"
        # Porta onde o Next.js está rodando DENTRO do container
        - "traefik.http.services.confeiteiro.loadbalancer.server.port=3000"
    networks:
      - network_public # A rede pública do Traefik

networks:
  network_public:
    external: true # Variável externa (já existe no Swarm)
```

---

## 3. Procedimento de Deploy (Na VPS)

### Passo 1: Atualizar Código
```bash
cd /var/www/seu-projeto
git pull origin main
```

### Passo 2: Construir a Imagem
Sempre re-builde a imagem após mudanças no código.
```bash
docker build -t confeiteiro:latest .
```
*> Dica: Se o build falhar com "copy failed", verifique se os arquivos (ex: .env.local) realmente existem no contexto.*

### Passo 3: Deploy da Stack
Atualize o serviço no Swarm sem downtime.
```bash
docker stack deploy -c docker-compose.yml confeiteiro
```

### Passo 4: Verificação (Troubleshooting)
1.  **Status do Serviço:**
    `docker stack ps confeiteiro --no-trunc`
    *Deve estar "Running". Se estiver "Rejected" ou "Shutdown", verifique logs.*

2.  **Logs de Erro:**
    `docker service logs confeiteiro_app --tail 50`
    *Procure por erros de start do Node.js.*

3.  **Rede/Traefik:**
    Verifique se o container está na rede correta:
    `docker service inspect confeiteiro_app | grep Networks`

## 5. DNS e SSL (Cloudflare + Traefik)

Se você usar Cloudflare para gerenciar seu domínio, siga estas regras para evitar conflitos de SSL:

1.  **Registro DNS (CNAME/A):**
    *   Crie um registro apontando para o IP da VPS (ou `server.dominio.com`).
    *   **Proxy Status:** **DNS Only (Nuvem Cinza)** ☁️
    *   *Por que?* O Traefik com Let's Encrypt precisa validar o domínio diretamente. Se você ativar o Proxy (Laranja), o Cloudflare entra no meio e pode quebrar a negociação do certificado inicial.

2.  **Primeiro Acesso (Erro de SSL):**
    *   Ao acessar pela primeira vez, é normal ver um aviso "Site não seguro" ou certificado inválido.
    *   O Traefik demora de 30s a 2min para pedir e instalar o certificado automático.
    *   Aguarde e recarregue a página.

---

## 6. Lições Aprendidas (Troubleshooting Real)

*   **Erro `COPY failed: ... no such file`:** O Docker é estrito. Se você tentar copiar um arquivo que não está no `.dockerignore` ou não existe, ele falha. Evite lógicas condicionais (`|| true`) dentro do `COPY`.
*   **"Port 80 already in use":** Se encontrar isso ao tentar instalar Nginx, **PARE**. Você tem Docker rodando. Use a abordagem Docker descrita acima.
*   **Loop de Deploy:** Se o Portainer/Swarm ficar reiniciando o container, geralmente é erro na aplicação (variável de ambiente faltando) ou na porta exposta (o healthcheck falha).
*   **Conflito de Rota (Domínio em Uso):** Se o domínio principal (`dominio.com`) já apontar para outro site (ex: WordPress), use um **subdomínio** (ex: `app.dominio.com`) para evitar derrubar o site principal. Lembre-se de ajustar a label `Host(...)` no `docker-compose.yml`.
