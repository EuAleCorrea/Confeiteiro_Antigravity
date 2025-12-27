# 🎂 Confeiteiro - Sistema de Gestão para Confeitarias

Sistema completo para gestão de confeitarias, desenvolvido em Next.js com foco em produtividade e experiência do usuário.

## ✨ Funcionalidades Principais

### 📋 Gestão de Orçamentos
- Wizard intuitivo para criação de orçamentos
- Campo de ocasião (Aniversário, Casamento, Formatura, etc.)
- Geração de PDF profissional
- Fluxo de status: Pendente → Enviado → Aprovado → Convertido

### 📦 Gestão de Pedidos
- Conversão automática de orçamento para pedido
- Controle de pagamento (Pendente, Parcial, Pago)
- Tabs organizadas: Resumo, Adereços, Produção, Entrega, Financeiro, Histórico
- Vinculação de adereços decorativos ao pedido

### 🏭 Planejamento de Produção
- Calendário mensal e visão semanal
- Lista diária de produção
- Resumo consolidado por período
- **Fechar Agenda** - finaliza planejamento semanal
- Exportação para PDF

### 💎 Módulo de Adereços e Materiais
- Cadastro de adereços com categorias configuráveis
- Gestão de fornecedores
- Controle de estoque com alertas de baixa
- Sistema de compras com status (Pendente → Recebido → Pago)
- Atualização automática de estoque ao receber compras

### 👥 Cadastros
- **Clientes**: CPF opcional, histórico de pedidos
- **Produtos**: Preço por tamanho (P, M, G, Fatia)
- **Sabores e Recheios**: Categorização flexível
- **Insumos**: Controle de estoque e custos
- **Fornecedores**: Gestão de parceiros

### 💰 Financeiro
- Fluxo de caixa
- Controle de pagamentos
- Contas a pagar (compras de adereços)

### ⚙️ Configurações
- Termos padrão para orçamentos
- Categorias de adereços personalizáveis
- Configurações gerais do sistema

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🛠️ Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **PDF**: jsPDF + jsPDF-AutoTable
- **Armazenamento**: LocalStorage (dados persistem no navegador)

## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se a:
- Desktop (sidebar expandida)
- Tablet (sidebar colapsável)
- Mobile (navegação otimizada)

## 📂 Estrutura do Projeto

```
app/
├── (dashboard)/           # Páginas protegidas
│   ├── dashboard/         # Tela inicial
│   ├── orcamentos/        # Gestão de orçamentos
│   ├── pedidos/           # Gestão de pedidos
│   ├── producao/          # Planejamento de produção
│   ├── clientes/          # Cadastro de clientes
│   ├── produtos/          # Cadastro de produtos
│   ├── aderecos/          # Gestão de adereços
│   │   └── compras/       # Compras de adereços
│   ├── fornecedores/      # Gestão de fornecedores
│   └── ...
components/
├── ui/                    # Componentes base (Button, Dialog, etc.)
├── layout/                # Sidebar, Header
├── pedidos/               # Componentes de pedidos
├── orcamentos/            # Componentes de orçamentos
└── producao/              # Componentes de produção
lib/
├── storage.ts             # Gerenciamento de dados (LocalStorage)
├── pdf-generator.ts       # Geração de PDFs
└── utils.ts               # Utilitários
```

## 📝 Licença

Projeto privado - Todos os direitos reservados.
