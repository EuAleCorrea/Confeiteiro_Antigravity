# Deploy no VPS Hostinger

## Pré-requisitos
- VPS Hostinger com acesso SSH
- Node.js v12.22.9 (já instalado, mas desatualizado)

---

## Etapa 1: Atualizar Node.js para v20

```bash
# 1) Instalar dependências básicas
apt update && apt install -y curl ca-certificates

# 2) Instalar o NVM (Node Version Manager)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 3) Carregar o NVM no shell atual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# 4) Instalar e usar o Node 20
nvm install 20
nvm use 20

# 5) Definir o Node 20 como padrão
nvm alias default 20

# 6) Confirmar a versão
node -v
npm -v
```

---

## Etapa 2: Configurar o Projeto

### 2.1 Clonar o repositório
```bash
cd /var/www
git clone https://github.com/EuAleCorrea/Confeiteiro_Antigravity.git confeiteiro
cd confeiteiro
git checkout feature/mobile-responsiveness
```

### 2.2 Instalar dependências
```bash
npm install
```

### 2.3 Remover modo static export
Editar `next.config.ts` e **remover** a linha:
```ts
output: 'export',  // REMOVER ESTA LINHA
```

### 2.4 Build de produção
```bash
npm run build
```

---

## Etapa 3: Configurar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar a aplicação
pm2 start npm --name "confeiteiro" -- start

# Salvar configuração para restart automático
pm2 save
pm2 startup
```

---

## Etapa 4: Configurar Nginx como Proxy Reverso

```bash
# Instalar Nginx (se não estiver instalado)
apt install nginx -y

# Criar configuração do site
nano /etc/nginx/sites-available/confeiteiro
```

Conteúdo do arquivo:
```nginx
server {
    listen 80;
    server_name seudominio.com.br;  # Substituir pelo seu domínio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar o site
ln -s /etc/nginx/sites-available/confeiteiro /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

## Etapa 5: Configurar SSL (HTTPS) com Certbot

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Gerar certificado SSL
certbot --nginx -d seudominio.com.br
```

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `pm2 status` | Ver status da aplicação |
| `pm2 logs confeiteiro` | Ver logs |
| `pm2 restart confeiteiro` | Reiniciar aplicação |
| `pm2 stop confeiteiro` | Parar aplicação |
| `cd /var/www/confeiteiro && git pull && npm install && npm run build && pm2 restart confeiteiro` | Atualizar deploy |

---

## Checklist de Deploy

- [ ] Atualizar Node para v20
- [ ] Clonar repositório
- [ ] Remover `output: 'export'` do next.config.ts
- [ ] npm install
- [ ] npm run build
- [ ] Configurar PM2
- [ ] Configurar Nginx
- [ ] Configurar SSL
- [ ] Testar aplicação
