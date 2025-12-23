import { LucideIcon } from "lucide-react";

export interface HelpCategory {
    id: string;
    nome: string;
    icone: string; // We'll store the icon name string or mapped key
    ordem: number;
    totalArtigos: number;
    cor: string; // Hex color for hover effects
}

export interface FAQQuestion {
    id: string;
    categoriaId: string;
    pergunta: string;
    resposta: string;
    ordem: number;
    visualizacoes: number;
    feedbackPositivo: number;
    feedbackNegativo: number;
    ativo: boolean;
    tags: string[];
    criadoEm: string;
    atualizadoEm: string;
}

export interface Feedback {
    id: string;
    perguntaId: string;
    tipo: 'positivo' | 'negativo';
    motivo?: string;
    comentario?: string;
    usuarioId?: string;
    criadoEm: string;
}

export const helpCategories: HelpCategory[] = [
    {
        id: "comecando",
        nome: "Começando",
        icone: "Rocket",
        ordem: 1,
        totalArtigos: 8,
        cor: "#FF5722"
    },
    {
        id: "orcamentos",
        nome: "Orçamentos",
        icone: "FileText",
        ordem: 2,
        totalArtigos: 12,
        cor: "#2196F3"
    },
    {
        id: "pedidos",
        nome: "Pedidos",
        icone: "Package",
        ordem: 3,
        totalArtigos: 15,
        cor: "#4CAF50"
    },
    {
        id: "producao",
        nome: "Produção",
        icone: "Cake",
        ordem: 4,
        totalArtigos: 10,
        cor: "#9C27B0"
    },
    {
        id: "financeiro",
        nome: "Financeiro",
        icone: "DollarSign",
        ordem: 5,
        totalArtigos: 18,
        cor: "#FFC107"
    },
    {
        id: "estoque",
        nome: "Estoque",
        icone: "BarChart",
        ordem: 6,
        totalArtigos: 9,
        cor: "#607D8B"
    },
    {
        id: "configuracoes",
        nome: "Configurações",
        icone: "Settings",
        ordem: 7,
        totalArtigos: 6,
        cor: "#795548"
    },
    {
        id: "suporte",
        nome: "Suporte",
        icone: "Wrench",
        ordem: 8,
        totalArtigos: 5,
        cor: "#F44336"
    }
];

export const faqQuestions: FAQQuestion[] = [
    // COMEÇANDO
    {
        id: "1",
        categoriaId: "comecando",
        pergunta: "Como criar meu primeiro orçamento?",
        resposta: `Para criar um orçamento:

1. Acesse o menu "Orçamentos"
2. Clique em "+ Novo Orçamento"
3. Selecione o cliente ou crie um novo
4. Adicione os produtos desejados
5. Configure data e horário de entrega
6. Descreva a decoração desejada
7. Revise todas as informações
8. Clique em "Finalizar e Gerar PDF"

💡 Dica: Você pode salvar como rascunho a qualquer momento e continuar depois.`,
        ordem: 1,
        visualizacoes: 234,
        feedbackPositivo: 45,
        feedbackNegativo: 3,
        ativo: true,
        tags: ["orçamento", "início", "tutorial"],
        criadoEm: "2025-01-15",
        atualizadoEm: "2025-12-01"
    },
    {
        id: "2",
        categoriaId: "comecando",
        pergunta: "Como cadastrar produtos e sabores?",
        resposta: "Acesse o menu Produtos > Novo Produto. Preencha os dados básicos, ficha técnica e precificação.",
        ordem: 2,
        visualizacoes: 120,
        feedbackPositivo: 20,
        feedbackNegativo: 1,
        ativo: true,
        tags: ["produtos", "cadastro"],
        criadoEm: "2025-01-16",
        atualizadoEm: "2025-12-01"
    },
    // ORÇAMENTOS
    {
        id: "3",
        categoriaId: "orcamentos",
        pergunta: "Como converter orçamento em pedido?",
        resposta: "Abra o orçamento aprovado e clique no botão 'Gerar Pedido' no canto superior direito.",
        ordem: 1,
        visualizacoes: 156,
        feedbackPositivo: 30,
        feedbackNegativo: 0,
        ativo: true,
        tags: ["orçamento", "pedido", "conversão"],
        criadoEm: "2025-01-20",
        atualizadoEm: "2025-12-01"
    },
    {
        id: "4",
        categoriaId: "orcamentos",
        pergunta: "Como enviar orçamento para o cliente?",
        resposta: "Após finalizar o orçamento, clique em 'Compartilhar' para enviar via WhatsApp ou E-mail.",
        ordem: 2,
        visualizacoes: 180,
        feedbackPositivo: 40,
        feedbackNegativo: 2,
        ativo: true,
        tags: ["compartilhar", "whatsapp"],
        criadoEm: "2025-01-21",
        atualizadoEm: "2025-12-01"
    },
    // PEDIDOS
    {
        id: "5",
        categoriaId: "pedidos",
        pergunta: "Como gerenciar pedidos?",
        resposta: "Utilize o quadro Kanban em 'Pedidos' para arrastar os cards entre as colunas de status.",
        ordem: 1,
        visualizacoes: 90,
        feedbackPositivo: 15,
        feedbackNegativo: 0,
        ativo: true,
        tags: ["kanban", "gestão"],
        criadoEm: "2025-02-01",
        atualizadoEm: "2025-12-01"
    },
    // FINANCEIRO
    {
        id: "6",
        categoriaId: "financeiro",
        pergunta: "Como usar o fluxo de caixa?",
        resposta: "O fluxo de caixa mostra suas entradas e saídas. Lance as despesas manualmente ou automaticamente pelos pedidos.",
        ordem: 1,
        visualizacoes: 300,
        feedbackPositivo: 50,
        feedbackNegativo: 5,
        ativo: true,
        tags: ["financeiro", "caixa"],
        criadoEm: "2025-03-01",
        atualizadoEm: "2025-12-01"
    }
];

export function buscarConteudo(termoBusca: string): { faq: FAQQuestion[], total: number } {
    const termo = termoBusca.toLowerCase().trim();
    if (!termo) return { faq: [], total: 0 };

    // Buscar em perguntas
    const resultadosFAQ = faqQuestions.filter(p =>
        p.pergunta.toLowerCase().includes(termo) ||
        p.resposta.toLowerCase().includes(termo) ||
        p.tags.some(tag => tag.toLowerCase().includes(termo))
    );

    // Ordenar por relevância
    resultadosFAQ.sort((a, b) => {
        const scoreA = calcularRelevancia(a, termo);
        const scoreB = calcularRelevancia(b, termo);
        return scoreB - scoreA;
    });

    return {
        faq: resultadosFAQ,
        total: resultadosFAQ.length
    };
}

function calcularRelevancia(item: FAQQuestion, termo: string): number {
    let score = 0;

    // Peso maior se estiver no título
    if (item.pergunta.toLowerCase().includes(termo)) score += 10;

    // Peso médio se estiver na resposta
    if (item.resposta.toLowerCase().includes(termo)) score += 5;

    // Peso menor se estiver nas tags
    if (item.tags.some(tag => tag.toLowerCase().includes(termo))) score += 2;

    // Bonificação por popularidade
    score += Math.log(item.visualizacoes + 1);

    // Bonificação por feedback positivo
    const taxaPositiva = item.feedbackPositivo /
        (item.feedbackPositivo + item.feedbackNegativo + 1);
    score += taxaPositiva * 3;

    return score;
}
