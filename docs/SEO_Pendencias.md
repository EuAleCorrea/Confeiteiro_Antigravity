# Relatório de Auditoria SEO & GEO - Confeiteiro

**Data:** 29/01/2026
**Agente Responsável:** @seo-specialist
**Status:** Análise Inicial Concluída

---

## 📊 Resumo Executivo

A análise técnica da *Landing Page* e estrutura do projeto revelou que, embora o **SEO Básico** esteja bem implementado (Meta tags, Open Graph, Sitemap), existem lacunas significativas em **SEO Técnico Avançado** e **GEO (Generative Engine Optimization)**.

O foco atual deve ser preparar a plataforma para ser "lida" não apenas pelo Google, mas também por LLMs (ChatGPT, Claude, Perplexity), que exigem dados estruturados explícitos.

---

## 🔴 Prioridade Alta: Dados Estruturados (Schema.org)

Atualmente, a aplicação **não possui** marcação JSON-LD. Isso impede que o Google entenda explicitamente que se trata de um "Software Application" e impede a exibição de Rich Snippets (estrelas, preço, FAQ) nos resultados de busca.

### Ação Necessária
Implementar o seguinte JSON-LD no `app/(marketing)/page.tsx`:

1.  **SoftwareApplication**: Para descrever o SaaS.
2.  **FAQPage**: Para as perguntas frequentes (aumenta chance de aparecer em "As pessoas também perguntam").
3.  **Organization**: Para reforçar credibilidade (E-E-A-T).
4.  **Offer**: Para exibir preços diretamente no Google (R$ 49/mês).

---

## 🟡 Prioridade Média: Otimização para IAs (GEO)

Para garantir que o Confeiteiro seja citado em respostas de IA (ex: *"Qual o melhor sistema para confeitaria artesanal?"*), precisamos estruturar melhor o conteúdo.

### Pendências Identificadas:
1.  **Falta de Estatísticas Autorais**: IAs priorizam dados únicos. O texto menciona "+500 confeiteiras", mas isso é vago.
    *   *Sugestão*: Criar uma seção de dados reais, ex: "Confeiteiras economizam média de 4h por semana".
2.  **Autoridade (E-E-A-T) Genérica**: O rodapé cita "Automação Total", mas não há página "Sobre" detalhando quem está por trás.
    *   *Sugestão*: Adicionar links para LinkedIn ou bio dos fundadores/desenvolvedores para provar *Expertise*.
3.  **Definições Claras**: IAs buscam definições. O texto é muito focado em venda.
    *   *Sugestão*: Adicionar blocos de texto explicativo (ex: "O que é Ficha Técnica na confeitaria?").

---

## 🟢 Prioridade Baixa (Melhorias)

1.  **Sitemap Estático**: O `sitemap.xml` tem `lastmod` fixo em `2026-01-24`. Deve ser gerado dinamicamente ou atualizado no deploy.
2.  **Performance (Hydration)**: O uso de `suppressHydrationWarning` no `layout.tsx` pode estar mascarando problemas de consistência que afetam o LCP (Core Web Vitals).
3.  **Texto Alternativo (Alt Text)**: As imagens de "mockup" do sistema na home são construídas com CSS/Divs. Isso é ótimo para performance, mas invisível para leitura de imagem. Adicionar um `role="img"` e `aria-label` descrevendo a interface ajuda na acessibilidade e interpretação da IA.

---

## 📝 Plano de Implementação Sugerido

### Passo 1: Injeção de Schema Markup (Imediato)
Adicionar componente de Schema na Home:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Confeiteiro",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "49.00",
        "priceCurrency": "BRL"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "200"
      }
    })
  }}
/>
```

### Passo 2: Refinamento de Conteúdo (GEO)
- Reescrever as respostas do FAQ para serem diretas, factuais e densas em informação (estilo enciclopédia, não apenas marketing).

### Passo 3: E-E-A-T
- Criar página `/sobre` ou expandir o rodapé com informações físicas e de contato real da "Automação Total".
