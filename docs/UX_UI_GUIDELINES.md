# ORIENTAÇÃO VISUAL PARA ANTIGRAVITY
## Como Criar o Visual do Web App

**IMPORTANTE: Use este prompt junto com o GUIA DE DESIGN SYSTEM em TODAS as etapas**

---

## IDENTIDADE VISUAL GERAL

### Estilo e Atmosfera
O sistema deve transmitir:
- **Profissionalismo** - design limpo e organizado
- **Sofisticação** - elementos elegantes sem exageros
- **Acessibilidade** - fácil de usar e navegar
- **Modernidade** - tendências atuais de UI/UX
- **Confiança** - visual sólido e consistente

**Referência de estilo:** Apps financeiros modernos (Nubank, Notion, Linear)
**NÃO fazer:** Designs carregados, gradientes excessivos, muitas cores

---

## PRINCÍPIOS DE DESIGN A SEGUIR

### 1. MINIMALISMO FUNCIONAL
```
✅ FAZER:
- Muito espaço em branco
- Um foco principal por tela
- Hierarquia visual clara
- Elementos limpos e organizados

❌ NÃO FAZER:
- Muita informação junta
- Cores demais competindo
- Elementos decorativos desnecessários
- Densidade visual alta
```

### 2. COR LARANJA COMO PROTAGONISTA
```
Cor principal: #FF5722 (laranja vibrante)

✅ USAR LARANJA EM:
- Botões de ação principal (CTAs)
- FAB (botão + circular flutuante)
- Elementos ativos/selecionados
- Indicadores de progresso
- Links e ações importantes
- Barras ativas em gráficos

❌ NÃO USAR LARANJA EM:
- Backgrounds grandes
- Texto corrido
- Bordas de todos os cards
- Elementos decorativos
```

### 3. CARDS COMO ESTRUTURA BASE
```
TUDO deve estar em cards:
- Resumos financeiros
- Lista de pedidos
- Detalhes de produtos
- Formulários
- Gráficos

Anatomia do card:
┌─────────────────────────┐
│ [padding 20-24px]       │
│                         │
│ Conteúdo bem espaçado   │
│                         │
│ [border-radius 16px]    │
└─────────────────────────┘

Background: branco
Shadow: sutil (0 2px 8px rgba(0,0,0,0.04))
Hover: shadow aumenta
```

### 4. TIPOGRAFIA COM HIERARQUIA CLARA
```
Regra de ouro: 
- Números grandes e bold
- Títulos médios e semibold
- Textos normais e regular
- Labels pequenos e leves

Exemplo real (Resumo Financeiro):
R$ 5.480,00  ← 40px, bold, #1A1A1A
Receita Mensal ← 13px, regular, #757575
+12% ← 12px, medium, #4CAF50
```

### 5. ÍCONES CONSISTENTES
```
Biblioteca: Lucide React
Estilo: Outline (linha, não preenchidos)
Tamanho: 20-24px (padrão)
Stroke: 2px
Cor: herdar do contexto

Em cards com ícone grande:
- Background circular colorido (suave)
- Ícone centralizado
- Diâmetro: 40-48px
```

---

## ANATOMIA DAS TELAS

### ESTRUTURA GERAL (Desktop)
```
┌──────────────────────────────────────────┐
│ [Header] Logo | Title | Avatar           │
├────────┬─────────────────────────────────┤
│        │                                 │
│ [Side] │ [Content Area]                  │
│ [bar]  │                                 │
│        │ Breadcrumb > Path               │
│ Menu   │                                 │
│ Items  │ [Cards com conteúdo]            │
│        │                                 │
│        │                                 │
│        │                                 │
└────────┴─────────────────────────────────┘

Sidebar: 240px width (expandida)
Content: max-width 1200px, centralizado
Padding: 32px nos lados
```

### ESTRUTURA MOBILE
```
┌──────────────────┐
│ [Header]         │ ← Fixo no topo
├──────────────────┤
│                  │
│ [Content]        │ ← Scroll
│                  │
│ Cards full-width │
│                  │
│                  │
├──────────────────┤
│ [Bottom Nav]     │ ← Fixo embaixo
└──────────────────┘

Bottom Nav: 5 ícones
FAB: sobreposto (bottom-right)
```

---

## COMPONENTES ESPECÍFICOS

### 1. CARDS DE RESUMO (Dashboard)
```
Visual Reference: Imagem 1 - "Gestão Financeira"

Layout vertical:
┌────────────────────┐
│ Receita Mensal     │ ← Label (pequeno, cinza)
│ R$ 5.480,00        │ ← Valor (grande, bold)
│ +12%               │ ← Variação (pequeno, verde)
└────────────────────┘

Cores por tipo:
- Receitas: indicador verde
- Despesas: indicador vermelho
- Lucro: indicador verde ou azul

Largura: 
- Mobile: full-width
- Tablet: 48% (2 por linha)
- Desktop: 23% (4 por linha)
```

### 2. GRÁFICOS DE BARRA
```
Visual Reference: Imagem 1 - "Desempenho Financeiro"

Características:
- Barras arredondadas no topo (4px radius)
- Barra ativa: #FF5722 (laranja)
- Barras inativas: #FFE0D8 (laranja claro)
- Espaçamento entre barras: 8px
- Labels abaixo: Sem1, Sem2, etc.
- Título acima: 16px, semibold
- Subtítulo: "Últimos 30 dias" (12px, cinza)
- Sem grid lines
- Background do gráfico: branco (dentro do card)
```

### 3. LISTA DE ATIVIDADES/TRANSAÇÕES
```
Visual Reference: Imagem 1 - "Atividade Recente"

Layout por item:
┌──────────────────────────────────┐
│ [🧾] Venda: Bolo de        +R$ 85│
│     Chocolate                    │
│     15 de Julho, 2024            │
├──────────────────────────────────┤
│ [🛒] Despesa: Farinha     -R$ 32 │
│     14 de Julho, 2024            │
└──────────────────────────────────┘

Ícone circular:
- Diâmetro: 40px
- Background suave (verde para venda, vermelho para despesa)
- Ícone centralizado, 20px

Valor:
- Verde se positivo (+)
- Vermelho se negativo (-)
- Alinhado à direita
- Bold, 16px

Data:
- Cinza claro
- 12px
- Abaixo do título
```

### 4. CALENDÁRIO
```
Visual Reference: Imagem 2 - "Agenda de Entregas"

Cabeçalho:
- Mês/Ano centralizado (20px, semibold)
- Setas de navegação nas laterais

Grid:
- 7 colunas (D S T Q Q S S)
- Células: 48px × 48px
- Números: 16px, centralizados

Dia atual/selecionado:
- Background: #FF5722 (laranja)
- Texto: branco
- Border-radius: 50% (circular)

Indicadores de eventos:
- Pontinhos pequenos abaixo do número
- Cores: laranja, verde, azul (por tipo)
- Tamanho: 4px diameter
- Até 3 pontos por dia
```

### 5. CARDS DE PEDIDO COM IMAGEM
```
Visual Reference: Imagem 3 - "Pedidos"

Estrutura:
┌─────────────────────┐
│ [Foto do bolo]      │ ← Aspect ratio 16:9
│                     │   Border-radius 12px no topo
├─────────────────────┤
│ Ana Silva    [Badge]│ ← Nome + Status
│ 📅 Entrega: 25/10   │
│    16:00            │
│                     │
│ Bolo de Chocolate,  │ ← Descrição
│ 50 Brigadeiros      │
│                     │
│ R$ 150,00           │ ← Valor (bold, 18px)
└─────────────────────┘

Badge de status:
- Posição: top-right
- Pill shape (rounded-full)
- Cores por status:
  • A Fazer: amarelo/laranja
  • Em Produção: azul
  • Pronto: verde
  • Entregue: cinza

Foto do bolo:
- Usar placeholder se não tiver imagem
- Efeito hover: leve zoom
```

### 6. BADGES DE STATUS
```
Visual Reference: Imagem 2 e 3

Formato pill (cápsula):
- Padding: 4px 12px
- Border-radius: 20px (arredondado completo)
- Font: 12px, weight 500
- Uppercase: não (use "A Fazer", não "A FAZER")

Cores específicas:
"A Fazer":
- Background: #FFF3E0
- Text: #F57C00

"Em Produção":
- Background: #E3F2FD
- Text: #1976D2

"Pronto para Entrega":
- Background: #E8F5E9
- Text: #388E3C

"Entregue":
- Background: #E0E0E0
- Text: #616161
```

### 7. BOTÃO FAB (Floating Action Button)
```
Visual Reference: Imagem 1, 2, 3 - canto inferior direito

Especificações:
- Forma: circular perfeito
- Diâmetro: 56px
- Background: #FF5722 (laranja)
- Ícone: + (branco, 24px)
- Shadow: 0 6px 20px rgba(255, 87, 34, 0.4)
- Position: fixed
- Bottom: 24px
- Right: 24px
- Z-index: 1000

Hover:
- Scale: 1.05
- Shadow aumenta

Mobile:
- Bottom: 80px (para não sobrepor bottom nav)
```

### 8. BOTTOM NAVIGATION (Mobile)
```
Visual Reference: Imagem 1, 3, 4 - rodapé mobile

5 itens principais:
1. Painel/Início (ícone: gráfico)
2. Pedidos (ícone: sacola)
3. Estoque (ícone: caixa)
4. Clientes (ícone: pessoas)
5. Finanças (ícone: gráfico linha)

Layout:
- Height: 64px
- Background: branco
- Border-top: 1px solid #E0E0E0
- Items distribuídos igualmente

Item ativo:
- Ícone: #FF5722 (laranja)
- Label: #FF5722
- Font-weight: 600

Item inativo:
- Ícone: #9E9E9E (cinza)
- Label: #9E9E9E
- Font-weight: 400

Cada item:
- Ícone: 24px
- Label: 11px
- Vertical stack (ícone sobre label)
```

### 9. CARDS DE ALERTA (Estoque)
```
Visual Reference: Imagem 4 - "Alerta de Estoque"

Layout horizontal:
┌─────────────────────────────┐
│ [⚠️] Farinha de Trigo   2kg │
│     Nível crítico           │
└─────────────────────────────┘

Ícone de alerta:
- Background: vermelho suave ou amarelo
- Forma: circular, 40px
- Ícone: ⚠️ ou ! centralizado

Nível crítico:
- Text: vermelho (#EF5350)
- Label: "Nível crítico"

Nível baixo:
- Text: laranja (#FFA726)
- Label: "Nível baixo"
```

### 10. PAINEL DE CONTROLE
```
Visual Reference: Imagem 4 - "Painel de Controle"

Saudação personalizada:
- "Olá, Ana! Aqui está o resumo."
- Font: 20px, semibold
- Padding-top: 24px

Tabs de período:
- "Hoje" | "Esta Semana"
- Estilo pill
- Ativo: background branco, shadow
- Inativo: transparente

Seções:
1. Pedidos (cards com contadores)
2. Finanças (card com gráfico)
3. Alerta de Estoque (lista)

Link "Ver detalhes":
- Laranja (#FF5722)
- 14px, medium
- Alinhado à direita
```

---

## PADRÕES DE INTERAÇÃO

### Hover States
```
Cards:
- Shadow aumenta suavemente
- Transição: 200ms ease

Botões:
- Background escurece 10%
- Cursor: pointer

Links:
- Cor mais escura
- Ou underline aparece
```

### Loading States
```
Use skeleton screens:
- Background: #F5F5F5
- Animação shimmer (gradiente que passa)
- Manter estrutura do conteúdo final

OU spinner circular:
- Cor: #FF5722
- Tamanho: 32px
- Centralizado
```

### Empty States
```
Centralizado verticalmente:
- Ícone grande (64px, cinza claro)
- Texto principal: "Nenhum [item] por aqui"
- Texto secundário: "Que tal adicionar o primeiro?"
- Botão CTA (opcional)

Exemplo:
     📦
Nenhum pedido por aqui
Que tal adicionar o primeiro?
```

---

## RESPONSIVIDADE

### Mobile (< 768px)
```
- Cards: full-width
- Padding: 16px
- Font-sizes: 10% menores
- Bottom navigation aparece
- Sidebar vira menu hambúrguer
- Gráficos: height reduzido
- Tabelas: scroll horizontal ou cards
```

### Tablet (768px - 1024px)
```
- Cards: 2 colunas
- Padding: 24px
- Sidebar: colapsável
- Bottom nav: opcional
```

### Desktop (> 1024px)
```
- Cards: 3-4 colunas
- Padding: 32px
- Sidebar: fixa expandida
- Max-width: 1200px
```

---

## CHECKLIST POR TELA

Antes de finalizar qualquer tela, verifique:

### Visual
- [ ] Paleta de cores respeitada
- [ ] Laranja usado corretamente nos CTAs
- [ ] Cards com border-radius 16px
- [ ] Sombras sutis aplicadas
- [ ] Espaçamentos múltiplos de 4px
- [ ] Tipografia com hierarquia clara
- [ ] Ícones 20-24px, stroke 2px

### Funcionalidade
- [ ] Estados de hover implementados
- [ ] Loading states considerados
- [ ] Empty states implementados
- [ ] Validações visuais claras
- [ ] Feedback de ações (toasts/alerts)

### Responsividade
- [ ] Mobile testado (< 768px)
- [ ] Tablet testado (768-1024px)
- [ ] Desktop testado (> 1024px)
- [ ] Touch targets mínimo 44px

### Acessibilidade
- [ ] Contraste adequado (4.5:1)
- [ ] Labels descritivos
- [ ] Foco visível
- [ ] Alt text em imagens

---

## PALAVRAS-CHAVE PARA O ANTIGRAVITY

Ao descrever o visual desejado, use estas palavras:

✅ **USAR:**
- Minimalista
- Limpo
- Profissional
- Moderno
- Espaçoso
- Elegante
- Organizado
- Sutil
- Flat design
- Material design suave

❌ **EVITAR:**
- Colorido demais
- Gradientes
- Sombras pesadas
- Bordas grossas
- Efeitos 3D
- Animações excessivas
- Densidade alta
- Decorativo

---

## EXEMPLO DE PROMPT PARA ANTIGRAVITY

```
"Crie um dashboard para confeitaria com design minimalista e profissional.

Use a cor laranja (#FF5722) apenas em botões principais e elementos ativos.
Todos os conteúdos devem estar em cards brancos com border-radius de 16px e sombra sutil.
A tipografia deve ter hierarquia clara: valores grandes e bold, labels pequenos e cinza.
Inclua cards de resumo mostrando receita mensal, despesas e lucro líquido.
Adicione um gráfico de barras com barras laranjas arredondadas no topo.
Liste atividades recentes com ícones circulares (verde para vendas, vermelho para despesas).
No mobile, use bottom navigation com 5 ícones e um FAB laranja circular no canto inferior direito.

Referência visual: apps financeiros modernos como Nubank.
Estilo: flat, limpo, muito espaço em branco."
```

---

**ESTE É SEU GUIA VISUAL DEFINITIVO. CONSULTE-O SEMPRE!**
