# Guias do Usuário - Sistema de Gestão para Confeitaria

## 📋 Índice

1. [Início Rápido](#início-rápido)
2. [Manual do Usuário](#manual-do-usuário)
3. [Perguntas Frequentes](#perguntas-frequentes)

---

## 🚀 Início Rápido

### **Primeiro Acesso**

1. **Acesse o sistema:** `http://localhost:3000` ou URL fornecida
2. **Dashboard:** Você verá a tela inicial com resumo do negócio
3. **Navegação:** Use o menu lateral para acessar as funcionalidades

### **Primeiros Passos**

#### **1. Cadastrar Produtos** (⌛ 5 minutos)
```
Menu → Produtos → Novo Produto
→ Nome: "Bolo de Chocolate"
→ Categoria: "Bolo"
→ Selecionar tamanhos: P, M, G
→ Definir preços:
   P: R$ 50,00
   M: R$ 70,00
   G: R$ 90,00
→ Salvar
```

#### **2. Cadastrar Cliente** (⌛ 3 minutos)
```
Menu → Clientes → Novo Cliente
→ Nome: "Maria Silva"
→ Telefone: "(11) 98765-4321"
→ CEP: "01310-100" (autocompleta endereço)
→ Salvar
```

#### **3. Criar Orçamento** (⌛ 10 minutos)
```
Menu → Orçamentos → Novo Orçamento
→ Passo 1: Selecionar "Maria Silva"
→ Passo 2: Adicionar "Bolo de Chocolate" tamanho M
→ Passo 3: Descrever decoração
→ Passo 4: Data entrega + tipo (Entrega/Retirada)
→ Revisar e Salvar
```

---

## 📖 Manual do Usuário

### **Módulo: Produtos**

#### **Cadastrar Novo Produto**
1. Clique em "Produtos" no menu
2. Clique no botão "+ Novo Produto"
3. Preencha:
   - **Nome:** Nome do produto
   - **Categoria:** Bolo, Adicional ou Serviço
   - **Preço Base:** Preço padrão (pode ser sobrescrito por tamanho)
   - **Tamanhos:** Selecione P, M, G conforme aplicável
   - **Preços por Tamanho:** Digite o preço ao lado de cada tamanho selecionado
   - **Descrição:** (Opcional) Detalhes do produto
4. Clique em "Salvar"

**💡 Dica:** Se você definir preços por tamanho, o sistema usará esses valores automaticamente nos orçamentos!

#### **Editar Produto**
1. Na lista de produtos, clique no ícone de lápis (✏️)
2. Faça as alterações
3. Salve

#### **Desativar Produto**
1. Edite o produto
2. Desmarque "Ativo"
3. Salve

---

### **Módulo: Clientes**

#### **Cadastrar Cliente**
1. Menu → Clientes → "+ Novo Cliente"
2. Preencha:
   - **Nome:** Nome completo
   - **Telefone:** (Obrigatório) WhatsApp/celular
   - **CPF:** (Opcional)
   - **E-mail:** (Opcional)
   - **CEP:** Digite e aguarde autocompletar
   - **Endereço:** Complete os dados
3. Salve

**💡 Dica:** O sistema busca automaticamente rua, bairro e cidade pelo CEP!

---

### **Módulo: Orçamentos**

#### **Criar Orçamento - Passo a Passo**

**Passo 1: Cliente**
- Selecione um cliente existente ou clique "Novo Cliente" para cadastrar

**Passo 2: Itens**
- Clique em "+ Adicionar Item"
- Selecione o produto
- Escolha o tamanho (o preço atualiza automaticamente!)
- Escolha massa e recheios (até 3 recheios)
- Defina a quantidade
- Clique em "Adicionar ao Orçamento"
- Repita para adicionar mais itens

**Passo 3: Decoração**
- Descreva a decoração desejada
- (Opcional) Adicione imagens de referência
- Adicione observações

**Passo 4: Entrega**
- Escolha data e horário
- Selecione tipo:
  - **Entrega:** Preencha endereço e taxa
  - **Retirada:** Adicione instruções
- Revise todos os dados
- Salve o orçamento

#### **Enviar Orçamento**
1. Na lista de orçamentos, localize o orçamento "Pendente"
2. Clique no ícone de "Enviar" (📤)
3. Status muda para "Enviado"
4. *Envie o orçamento para o cliente por WhatsApp/e-mail*

#### **Aprovar Orçamento**
1. Após confirmação do cliente, localize o orçamento "Enviado"
2. Clique no ícone "Aprovar" (✅)
3. Confirme a ação
4. **Sistema cria automaticamente um Pedido**
5. Você é redirecionado para a tela de Pedidos

---

### **Módulo: Pedidos**

#### **Visualizações Disponíveis**

**📅 Agenda Semanal** (Padrão)
- Visão por dia da semana
- Ideal para ver entregas diárias

**📆 Calendário Mensal**
- Visão completa do mês
- Clique em um dia para ver detalhes

**📋 Lista**
- Tabela com todos os pedidos
- Filtragem e busca

**📊 Kanban**
- Fluxo visual por status
- Arraste cards para mudar status

#### **Confirmar Pagamento**
1. Localize o pedido com status "Pagamento Pendente"
2. Clique no ícone "$" (verde)
3. Confirme
4. Status muda para "Aguardando Produção"

#### **Mudar Status (Kanban)**
1. Acesse visualização "Kanban"
2. Arraste o card do pedido para a coluna desejada
3. Status atualiza automaticamente

---

### **Módulo: Produção**

#### **Visualizar Agenda**
1. Menu → Produção
2. Visualização padrão: Calendário de entregas
3. Clique em um dia para ver pedidos daquela data

#### **Gerar Resumo de Produção**
1. Clique em "Resumo" (no topo)
2. Selecione período:
   - Data Inicial (ex: 23/12/2024)
   - Data Final (ex: 29/12/2024)
3. Veja totais de:
   - Massas por sabor
   - Recheios por sabor
   - Lista de pedidos
4. Clique em "Exportar PDF" para gerar lista de compras

**💡 Dica:** Use o resumo no início da semana para planejar compras!

---

### **Módulo: Estoque**

#### **Cadastrar Insumo**
1. Menu → Estoque → "+ Novo Insumo"
2. Preencha:
   - Nome (ex: "Chocolate em Pó")
   - Categoria (Ingrediente, Embalagem, Decoração)
   - Quantidade atual
   - Unidade (kg, L, un, etc)
   - Estoque Mínimo (para alertas)
   - Custo Unitário
3. Salve

#### **Atualizar Estoque**
1. Localize o insumo
2. Clique em "Editar"
3. Atualize a quantidade
4. Salve

**⚠️ Alertas Automáticos:**
- Vermelho: Abaixo do mínimo
- Amarelo: Próximo ao mínimo
- Verde: Estoque ok

---

### **Módulo: Financeiro**

#### **Registrar Movimentação**
1. Menu → Financeiro → "+ Nova Movimentação"
2. Preencha:
   - Tipo: Entrada ou Saída
   - Categoria
   - Descrição
   - Valor
   - Forma de Pagamento
   - (Opcional) Vincular a pedido
3. Salve

#### **Visualizar Fluxo de Caixa**
1. Menu → Financeiro → Fluxo de Caixa
2. Selecione mês
3. Veja resumo de entradas, saídas e saldo

---

## ❓ Perguntas Frequentes

### **1. Como alterar o preço de um produto que já tem preços por tamanho?**
Edite o produto, altere os valores nos campos de preço ao lado de cada tamanho, e salve.

### **2. Posso ter múltiplos recheios em um bolo?**
Sim! Ao adicionar um item no orçamento, você pode selecionar até 3 recheios diferentes.

### **3. Como sei quanto comprar de cada ingrediente?**
Use o **Resumo de Produção**. Ele agrega todas as massas e recheios do período selecionado.

### **4. O que acontece quando aprovo um orçamento?**
O sistema cria automaticamente um **Pedido** com status "Pagamento Pendente" e com todos os dados do orçamento.

### **5. Posso editar um pedido depois de criado?**
Atualmente, não há edição direta. Você pode criar um novo pedido ou ajustar manualmente os dados.

### **6. Como imprimir a lista de produção?**
Acesse Produção → Resumo, selecione o período e clique em "Exportar PDF".

### **7. Os dados ficam salvos onde?**
Todos os dados ficam salvos no navegador (LocalStorage). **Importante:** Se limpar o cache do navegador, os dados serão perdidos. Faça backups regulares exportando os PDFs!

### **8. Posso acessar de outro computador?**
Não, atualmente os dados ficam apenas no navegador local. Para versão multi-dispositivo, seria necessário implementar um backend com banco de dados.

### **9. Como fazer backup dos dados?**
Atualmente, não há exportação automática. Recomenda-se:
- Exportar PDFs dos relatórios importantes
- Não limpar o cache do navegador
- (Futuro) Implementar exportação/importação JSON

### **10. O CPF do cliente é obrigatório?**
Não! Após a última atualização, o CPF tornou-se opcional.

---

## 🎓 Próximos Passos

- Explore o sistema criando orçamentos de teste
- Configure seus produtos e sabores
- Cadastre seus clientes principais
- Experimente as diferentes visualizações de pedidos

---

## 📞 Suporte

Para dúvidas adicionais, entre em contato através do GitHub.
