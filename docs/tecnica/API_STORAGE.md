# API e Storage - Sistema de Gestão para Confeitaria

## 📋 Visão Geral

O sistema utiliza o **LocalStorage** do navegador para persistência de dados através da classe `StorageService` localizada em `lib/storage.ts`.

---

## 🔧 StorageService

### **Inicialização**

```typescript
import { storage } from "@/lib/storage";
```

O `storage` é uma instância singleton do `StorageService` que gerencia todas as operações de dados.

---

## 📦 APIs Disponíveis

### **Produtos**

```typescript
// Listar todos os produtos
const produtos = storage.getProdutos(): Produto[];

// Buscar produto por ID
const produto = storage.getProdutoById(id: string): Produto | undefined;

// Salvar produto (criar ou atualizar)
storage.saveProduto(produto: Produto): void;

// Excluir produto
storage.deleteProduto(id: string): void;
```

**Exemplo de Uso:**
```typescript
// Criar novo produto
const novoProduto: Produto = {
    id: crypto.randomUUID(),
    nome: "Bolo de Chocolate",
    categoria: "Bolo",
    preco: 70.00,
    precosPorTamanho: {
        "P": 50.00,
        "M": 70.00,
        "G": 90.00
    },
    tamanhos: ["P", "M", "G"],
    ativo: true
};

storage.saveProduto(novoProduto);

// Atualizar produto existente
const produtoAtualizado = {
    ...novoProduto,
    preco: 80.00
};

storage.saveProduto(produtoAtualizado);
```

---

### **Clientes**

```typescript
// Listar todos os clientes
const clientes = storage.getClientes(): Cliente[];

// Buscar cliente por ID
const cliente = storage.getClienteById(id: string): Cliente | undefined;

// Salvar cliente
storage.saveCliente(cliente: Cliente): void;

// Excluir cliente
storage.deleteCliente(id: string): void;
```

---

### **Orçamentos**

```typescript
// Listar todos os orçamentos
const orcamentos = storage.getOrcamentos(): Orcamento[];

// Buscar orçamento por ID
const orcamento = storage.getOrcamentoById(id: string): Orcamento | undefined;

// Salvar orçamento
storage.saveOrcamento(orcamento: Orcamento): void;

// Excluir orçamento
storage.deleteOrcamento(id: string): void;

// Gerar próximo número de orçamento
const proximoNumero = storage.getNextOrcamentoNumber(): number;
```

**Exemplo - Criar Orçamento:**
```typescript
const novoOrcamento: Orcamento = {
    id: crypto.randomUUID(),
    numero: storage.getNextOrcamentoNumber(),
    cliente: clienteSelecionado,
    dataCriacao: new Date().toISOString(),
    validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
    status: 'Pendente',
    itens: [...],
    entrega: {...},
    decoracao: {...},
    valorTotal: calcularTotal(),
    atualizadoEm: new Date().toISOString()
};

storage.saveOrcamento(novoOrcamento);
```

---

### **Pedidos**

```typescript
// Listar todos os pedidos
const pedidos = storage.getPedidos(): Pedido[];

// Buscar pedido por ID
const pedido = storage.getPedidoById(id: string): Pedido | undefined;

// Salvar pedido
storage.savePedido(pedido: Pedido): void;

// Excluir pedido
storage.deletePedido(id: string): void;

// Gerar próximo número de pedido
const proximoNumero = storage.getNextPedidoNumber(): number;
```

**Exemplo - Converter Orçamento em Pedido:**
```typescript
function aprovarOrcamento(orcamento: Orcamento) {
    // Atualizar orçamento
    const orcamentoAprovado = {
        ...orcamento,
        status: 'Aprovado' as const
    };
    storage.saveOrcamento(orcamentoAprovado);

    // Criar pedido
    const novoPedido: Pedido = {
        id: crypto.randomUUID(),
        numero: storage.getNextPedidoNumber(),
        orcamentoId: orcamento.id,
        cliente: orcamento.cliente,
        dataCriacao: new Date().toISOString(),
        dataEntrega: orcamento.entrega.data,
        horaEntrega: orcamento.entrega.horario,
        tipo: orcamento.entrega.tipo,
        itens: orcamento.itens,
        decoracao: {...},
        entrega: {...},
        producao: {
            checklist: [],
            fotos: []
        },
        financeiro: {
            valorTotal: orcamento.valorTotal,
            valorPago: 0,
            saldoPendente: orcamento.valorTotal,
            formaPagamento: 'PIX',
            statusPagamento: 'Pendente'
        },
        status: 'Pagamento Pendente',
        prioridade: 'Normal',
        historico: [{
            data: new Date().toISOString(),
            acao: `Gerado a partir do Orçamento #${orcamento.numero}`,
            usuario: 'Sistema'
        }],
        atualizadoEm: new Date().toISOString()
    };

    storage.savePedido(novoPedido);
}
```

---

### **Insumos (Estoque)**

```typescript
// Listar todos os insumos
const insumos = storage.getInsumos(): Insumo[];

// Buscar insumo por ID
const insumo = storage.getInsumoById(id: string): Insumo | undefined;

// Salvar insumo
storage.saveInsumo(insumo: Insumo): void;

// Excluir insumo
storage.deleteInsumo(id: string): void;
```

---

### **Movimentações Financeiras**

```typescript
// Listar todas as movimentações
const movimentacoes = storage.getMovimentacoes(): MovimentacaoFinanceira[];

// Buscar movimentação por ID
const movimentacao = storage.getMovimentacaoById(id: string): MovimentacaoFinanceira | undefined;

// Salvar movimentação
storage.saveMovimentacao(movimentacao: MovimentacaoFinanceira): void;

// Excluir movimentação
storage.deleteMovimentacao(id: string): void;
```

---

### **Sabores (Massa e Recheio)**

```typescript
// Listar sabores de massa
const massas = storage.getSaboresMassa(): Sabor[];

// Listar sabores de recheio
const recheios = storage.getSaboresRecheio(): Sabor[];

// Salvar sabor
storage.saveSabor(sabor: Sabor): void;

// Excluir sabor
storage.deleteSabor(id: string): void;
```

---

## 🔐 Estrutura de Armazenamento

Dados são armazenados no LocalStorage com as seguintes chaves:

```javascript
localStorage.setItem('produtos', JSON.stringify(produtos));
localStorage.setItem('clientes', JSON.stringify(clientes));
localStorage.setItem('orcamentos', JSON.stringify(orcamentos));
localStorage.setItem('pedidos', JSON.stringify(pedidos));
localStorage.setItem('insumos', JSON.stringify(insumos));
localStorage.setItem('movimentacoes', JSON.stringify(movimentacoes));
localStorage.setItem('saboresMassa', JSON.stringify(saboresMassa));
localStorage.setItem('saboresRecheio', JSON.stringify(saboresRecheio));
```

---

## ⚙️ Funções Utilitárias

### **Geração de IDs**

O sistema usa `crypto.randomUUID()` para gerar IDs únicos:

```typescript
const id = crypto.randomUUID(); // Ex: "550e8400-e29b-41d4-a716-446655440000"
```

### **Geração de Números Sequenciais**

Para orçamentos e pedidos:

```typescript
storage.getNextOrcamentoNumber(); // Retorna próximo número disponível
storage.getNextPedidoNumber();
```

---

## 📊 Exemplos Completos

### **Exemplo 1: Criar e Salvar Produto**

```typescript
"use client";

import { useState } from "react";
import { storage, Produto } from "@/lib/storage";

export function ProductForm() {
    const [formData, setFormData] = useState<Partial<Produto>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const novoProduto: Produto = {
            id: crypto.randomUUID(),
            nome: formData.nome!,
            categoria: formData.categoria || 'Bolo',
            preco: Number(formData.preco),
            precosPorTamanho: formData.precosPorTamanho || {},
            tamanhos: formData.tamanhos || [],
            ativo: true
        };

        storage.saveProduto(novoProduto);
        // Recarregar lista ou resetar form
    }

    return <form onSubmit={handleSubmit}>{/* campos */}</form>;
}
```

### **Exemplo 2: Listar Produtos Ativos**

```typescript
"use client";

import { useEffect, useState } from "react";
import { storage, Produto } from "@/lib/storage";

export function ProductList() {
    const [produtos, setProdutos] = useState<Produto[]>([]);

    useEffect(() => {
        loadProdutos();
    }, []);

    function loadProdutos() {
        const all = storage.getProdutos();
        const ativos = all.filter(p => p.ativo);
setProdutos(ativos);
    }

    return (
        <div>
            {produtos.map(produto => (
                <div key={produto.id}>{produto.nome}</div>
            ))}
        </div>
    );
}
```

### **Exemplo 3: Atualizar Status de Pedido**

```typescript
function handleStatusChange(pedidoId: string, novoStatus: Pedido['status']) {
    const pedido = storage.getPedidoById(pedidoId);
    if (!pedido) return;

    const pedidoAtualizado = {
        ...pedido,
        status: novoStatus,
        historico: [
            ...pedido.historico,
            {
                data: new Date().toISOString(),
                acao: `Status alterado para: ${novoStatus}`,
                usuario: 'Admin'
            }
        ],
        atualizadoEm: new Date().toISOString()
    };

    storage.savePedido(pedidoAtualizado);
}
```

---

## ⚠️ Limitações e Considerações

### **Limitações do LocalStorage**

1. **Tamanho:** Limitado a ~5-10MB dependendo do navegador
2. **Segurança:** Dados não são criptografados
3. **Persistência:** Dados podem ser perdidos ao limpar cache
4. **Multi-dispositivo:** Não sincroniza entre dispositivos

### **Recomendações**

- Faça backups regulares exportando dados
- Não armazene informações sensíveis
- Para produção com múltiplos usuários, migre para backend + banco de dados

---

## 🔗 Links Relacionados

- [Modelos de Dados](./MODELOS_DADOS.md)
- [Arquitetura](./README.md)
- [Guia de Contribuição](./CONTRIBUTING.md)
