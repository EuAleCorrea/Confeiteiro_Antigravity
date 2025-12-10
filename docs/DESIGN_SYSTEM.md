# GUIA DE DESIGN SYSTEM - UX/UI
## Sistema de Design para Confeitaria Artesanal

**Use este guia ANTES de construir qualquer etapa do sistema**

---

## 1. PALETA DE CORES

### Cores Principais
```
Primary (Laranja Vibrante):
- Main: #FF5722 (botões principais, destaques)
- Light: #FF8A65 (hover states)
- Dark: #E64A19 (pressed states)

Secondary (Coral/Salmão):
- Main: #FFB4A8
- Light: #FFCFC7
- Usado para badges secundários e highlights suaves

Neutral:
- Background: #F5F5F5 (fundo da página)
- Cards: #FFFFFF (fundo de cards)
- Text Primary: #1A1A1A (títulos e textos principais)
- Text Secondary: #757575 (subtítulos e textos secundários)
- Borders: #E0E0E0 (bordas sutis)
- Dividers: #F0F0F0
```

### Cores de Status
```
Success (Verde):
- Main: #4CAF50
- Light: #81C784
- Uso: "+ R$ 85,00", indicadores positivos, "Pronto"

Warning (Amarelo/Laranja):
- Main: #FFA726
- Light: #FFB74D
- Uso: "Em Produção", "A Fazer", alertas

Error (Vermelho):
- Main: #EF5350
- Uso: "- R$ 32,50", "Nível crítico", despesas

Info (Azul):
- Main: #42A5F5
- Light: #64B5F6
- Uso: badges informativos
```

### Gradientes
```
Não usar gradientes complexos.
Manter design flat e minimalista.
```

---

## 2. TIPOGRAFIA

### Família de Fontes
```
Font Family: 'Inter', 'Roboto', -apple-system, sans-serif
Fallback: system-ui, sans-serif

Pesos disponíveis:
- Regular: 400 (textos normais)
- Medium: 500 (subtítulos, labels)
- Semibold: 600 (títulos de cards)
- Bold: 700 (números grandes, valores)
```

### Escala Tipográfica
```
Display (Valores Grandes):
- Size: 32px - 48px
- Weight: 700
- Line-height: 1.2
- Uso: "R$ 5.480,00", "R$ 1.250,75"

H1 (Títulos de Página):
- Size: 24px
- Weight: 600
- Line-height: 1.3
- Uso: "Gestão Financeira", "Pedidos", "Painel de Controle"

H2 (Seções):
- Size: 20px
- Weight: 600
- Line-height: 1.4
- Uso: "Resumo do Mês", "Pedidos", "Finanças"

H3 (Subtítulos):
- Size: 16px
- Weight: 600
- Line-height: 1.5
- Uso: "A Fazer", "Em Produção"

Body Large:
- Size: 16px
- Weight: 400
- Line-height: 1.5
- Uso: textos principais

Body:
- Size: 14px
- Weight: 400
- Line-height: 1.5
- Uso: descrições, textos de cards

Small:
- Size: 12px
- Weight: 400
- Line-height: 1.4
- Uso: "15 de Julho, 2024", labels pequenos

Caption:
- Size: 11px
- Weight: 500
- Line-height: 1.3
- Uso: "Últimos 30 dias", legendas
```

---

## 3. COMPONENTES BASE

### Cards
```css
Estilo padrão:
- Background: #FFFFFF
- Border-radius: 16px (arredondamento generoso)
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04)
- Padding: 20px - 24px
- Hover: elevação suave (shadow mais pronunciado)

Cards pequenos (resumo):
- Padding: 16px
- Mínimo height: 120px

Cards de lista:
- Padding: 16px
- Border-radius: 12px
```

### Botões

**Botão Principal (Primary):**
```css
- Background: #FF5722
- Color: #FFFFFF
- Border-radius: 12px
- Padding: 12px 24px
- Font-size: 15px
- Font-weight: 600
- Box-shadow: 0 4px 12px rgba(255, 87, 34, 0.25)
- Hover: background #E64A19
- Ícone + Texto (quando aplicável)
```

**Botão FAB (Floating Action Button):**
```css
- Circular
- Diameter: 56px
- Background: #FF5722
- Icon: branco, 24px
- Box-shadow: 0 6px 20px rgba(255, 87, 34, 0.4)
- Position: fixed, bottom-right
- Margin: 24px from edges
```

**Botão Secundário:**
```css
- Background: transparente
- Color: #FF5722
- Border: 1px solid #FF5722
- Border-radius: 12px
```

**Botão Texto:**
```css
- Background: transparente
- Color: #FF5722
- No border
- Underline no hover
```

### Badges de Status
```css
Estrutura base:
- Display: inline-flex
- Padding: 4px 12px
- Border-radius: 20px (pill shape)
- Font-size: 12px
- Font-weight: 500

Variações:
"A Fazer":
- Background: #FFF3E0
- Color: #F57C00

"Em Produção":
- Background: #E3F2FD
- Color: #1976D2

"Pronto":
- Background: #E8F5E9
- Color: #388E3C

"Entregue":
- Background: #E0E0E0
- Color: #616161

"Nível crítico":
- Background: #FFEBEE
- Color: #D32F2F

"Nível baixo":
- Background: #FFF8E1
- Color: #F57F17
```

### Inputs e Forms
```css
Input padrão:
- Height: 48px
- Border: 1px solid #E0E0E0
- Border-radius: 10px
- Padding: 0 16px
- Font-size: 15px
- Focus: border #FF5722, outline 0

Label:
- Font-size: 13px
- Font-weight: 500
- Color: #616161
- Margin-bottom: 6px

Textarea:
- Min-height: 120px
- Padding: 12px 16px
- Line-height: 1.6
```

### Tabs
```css
Container:
- Background: transparent
- Border-bottom: 1px solid #E0E0E0

Tab ativo:
- Color: #FF5722
- Border-bottom: 2px solid #FF5722
- Font-weight: 600

Tab inativo:
- Color: #9E9E9E
- No border
- Font-weight: 400

Padding: 12px 20px
```

---

## 4. LAYOUT E ESPAÇAMENTO

### Grid System
```
Mobile: 16px margins
Tablet: 24px margins
Desktop: 32px margins

Max-width content: 1200px
Centralizado na página
```

### Espaçamento (usar múltiplos de 4px)
```
4px  - espaçamento mínimo
8px  - entre elementos muito próximos
12px - entre label e input
16px - padding de cards pequenos
20px - espaçamento entre elementos
24px - padding de cards médios, seções
32px - entre seções grandes
48px - entre módulos principais
64px - separação de áreas distintas
```

### Ícones
```
Tamanho padrão: 20px - 24px
Cards com ícone: 40px - 48px (circular background)
FAB: 24px
Menu/Navigation: 24px

Usar ícones do Lucide React (linha, não preenchidos)
Stroke-width: 2px
Color: herdar do parent
```

---

## 5. PADRÕES ESPECÍFICOS

### Cards de Resumo Financeiro
```
Layout:
┌────────────────────────┐
│ Label (small, gray)    │
│ R$ 5.480,00 (grande)   │
│ +12% (verde, pequeno)  │
└────────────────────────┘

- Alinhamento: left
- Background: branco
- Padding: 20px
- Border-radius: 16px
```

### Cards de Pedido
```
Layout com imagem:
┌────────────────────────┐
│ [Imagem do bolo]       │
│ [Nome do cliente]      │
│ [Badge status]         │
│ 📅 Entrega: 25/10-16:00│
│ [Descrição do pedido]  │
│ R$ 150,00              │
└────────────────────────┘

- Imagem: aspect-ratio 16:9
- Border-radius: 12px no topo
- Padding interno: 16px
```

### Lista de Atividades/Transações
```
Layout:
┌────────────────────────────────────┐
│ [Ícone]  Título              Valor │
│          Data                      │
└────────────────────────────────────┘

Ícone:
- 40px circular
- Background suave da cor correspondente
- Ícone centralizado

Ícone verde (venda): 🧾
Ícone vermelho (despesa): 🛒
```

### Calendário
```
Estrutura:
- Header: mês/ano centralizado
- Grid 7 colunas (D-S)
- Células: 48px × 48px
- Dia selecionado: circular, background laranja
- Indicadores: pontos pequenos abaixo do número
- Border-radius: 50% para células
- Hover: background cinza claro
```

### Bottom Navigation (Mobile)
```
5 itens:
- Início
- Receitas  
- Despesas
- Clientes
- Finanças

Cada item:
- Ícone 24px
- Label 11px
- Ativo: color laranja (#FF5722)
- Inativo: color cinza (#9E9E9E)
- Height: 64px
- Background: branco
- Border-top: 1px solid #E0E0E0
```

---

## 6. GRÁFICOS E VISUALIZAÇÕES

### Gráficos de Barra
```
Estilo:
- Barras com border-radius no topo: 4px
- Largura: responsiva, espaçamento de 8px
- Cor ativa: #FF5722
- Cor inativa: #FFE0D8 (laranja muito claro)
- Sem bordas
- Sem grid lines
- Labels abaixo: 11px, cinza
```

### Cards com Números Grandes
```
Hierarquia visual:
1. Número grande (32px-48px, bold)
2. Label descritivo (12px, gray)
3. Indicador de variação (12px, color coded)

Alinhamento: left
Indicadores: ícone seta + porcentagem
```

---

## 7. ESTADOS E INTERAÇÕES

### Hover States
```
Cards: 
- Elevação aumenta (shadow maior)
- Transition: 0.2s ease

Botões:
- Background escurece levemente
- Cursor: pointer
- Transition: 0.15s ease

Links/Text buttons:
- Opacity: 0.8
- Ou underline
```

### Loading States
```
- Skeleton screens (placeholders animados)
- Cor: #F5F5F5 com shimmer
- Spinner circular laranja quando necessário
- Tamanho spinner: 32px
```

### Empty States
```
Centralizado:
- Ícone grande (64px), cinza claro
- Título: "Nenhum pedido por aqui"
- Subtítulo: "Que tal adicionar o primeiro?"
- Botão CTA (opcional)
```

---

## 8. RESPONSIVIDADE

### Breakpoints
```
Mobile: < 768px
Tablet: 768px - 1024px  
Desktop: > 1024px
```

### Mobile First Approach
```
- Começar com layout mobile
- Cards full-width
- Sidebar vira bottom nav
- Reduzir padding em 25%
- Font-sizes 10% menores
- Botões full-width quando apropriado
```

### Adaptações Tablet
```
- Grid 2 colunas
- Sidebar colapsável
- Cards com width: 48%
```

### Adaptações Desktop
```
- Grid 3-4 colunas
- Sidebar fixa expandida
- Max-width: 1200px centralizado
```

---

## 9. ACESSIBILIDADE

```
- Contraste mínimo: 4.5:1 para textos
- Foco visível em todos elementos interativos
- Labels descritivos em inputs
- Alt text em imagens
- Touch targets mínimo: 44×44px
- Feedback visual em todas ações
```

---

## 10. ANIMAÇÕES

```
Transições padrão:
- Duration: 200ms - 300ms
- Easing: ease-in-out

Usar animações em:
- Hover de cards (elevation)
- Modals (fade + scale)
- Tabs switching (slide)
- Loading states (shimmer)

NÃO usar em:
- Scrolling
- Entradas iniciais de página
```

---

## EXEMPLO DE IMPLEMENTAÇÃO EM CSS

```css
/* Variáveis CSS */
:root {
  --primary: #FF5722;
  --primary-dark: #E64A19;
  --primary-light: #FF8A65;
  
  --secondary: #FFB4A8;
  
  --success: #4CAF50;
  --warning: #FFA726;
  --error: #EF5350;
  --info: #42A5F5;
  
  --bg-page: #F5F5F5;
  --bg-card: #FFFFFF;
  
  --text-primary: #1A1A1A;
  --text-secondary: #757575;
  
  --border: #E0E0E0;
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  --transition: 0.2s ease-in-out;
}

/* Card padrão */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 24px;
  transition: box-shadow var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* Botão primário */
.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
}

.btn-primary:hover {
  background: var(--primary-dark);
}

/* Badge */
.badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}

.badge-warning {
  background: #FFF3E0;
  color: #F57C00;
}

.badge-success {
  background: #E8F5E9;
  color: #388E3C;
}
```

---

## CHECKLIST DE QUALIDADE

Antes de considerar uma tela pronta, verifique:

✅ Paleta de cores seguida corretamente
✅ Tipografia com tamanhos e pesos corretos
✅ Espaçamentos usando múltiplos de 4px
✅ Border-radius consistente (16px para cards)
✅ Sombras sutis e apropriadas
✅ Ícones com tamanho correto (20-24px)
✅ Botões com altura mínima de 44px
✅ Estados de hover implementados
✅ Loading states considerados
✅ Empty states implementados
✅ Responsivo mobile/tablet/desktop
✅ Contraste de texto adequado
✅ FAB posicionado corretamente (bottom-right)
✅ Badges com estilo pill (arredondados)
✅ Cards com imagem usando aspect-ratio 16:9

---

**USE ESTE GUIA COMO REFERÊNCIA OBRIGATÓRIA EM TODAS AS ETAPAS!**
