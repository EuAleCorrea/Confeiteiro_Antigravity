export interface VideoChapter {
    tempo: string; // "MM:SS" or "HH:MM:SS"
    titulo: string;
    segundos: number; // easier for seeking
}

export interface VideoRelacionado {
    id: string;
    tipo: 'video' | 'artigo';
    titulo: string;
    duracao?: string; // only for videos
}

export interface TutorialVideo {
    id: string;
    titulo: string;
    descricao: string;
    categoriaId: string;
    youtubeId: string;
    duracao: string;
    visualizacoes: number;
    ordem: number;
    tags: string[];
    chapters: VideoChapter[];
    relacionados: VideoRelacionado[];
    criadoEm: string;
    ativo: boolean;
}

export interface Playlist {
    id: string;
    titulo: string;
    descricao: string;
    categoriaId: string;
    icone: string;
    videosIds: string[];
    duracaoTotal: string;
    ordem: number;
    ativo: boolean;
}

export const tutorialVideos: TutorialVideo[] = [
    {
        id: "v1",
        titulo: "Como criar seu primeiro orçamento",
        descricao: `Aprenda passo a passo como criar um orçamento profissional no sistema. 
        
Este tutorial cobre:
• Seleção e cadastro de cliente
• Adição de produtos e serviços
• Configuração de data e horário de entrega
• Descrição detalhada da decoração
• Revisão e geração de PDF profissional`,
        categoriaId: "comecando",
        youtubeId: "dQw4w9WgXcQ", // Placeholder
        duracao: "12:34",
        visualizacoes: 1200,
        ordem: 1,
        tags: ["orçamento", "início"],
        chapters: [
            { tempo: "00:00", titulo: "Introdução", segundos: 0 },
            { tempo: "01:15", titulo: "Acessando o módulo", segundos: 75 },
            { tempo: "02:30", titulo: "Selecionando cliente", segundos: 150 },
            { tempo: "04:45", titulo: "Adicionando produtos", segundos: 285 },
            { tempo: "09:50", titulo: "Finalizando", segundos: 590 },
        ],
        relacionados: [
            { id: "v2", tipo: "video", titulo: "Gerenciando Pedidos", duracao: "08:15" },
        ],
        criadoEm: "2025-01-20",
        ativo: true
    },
    {
        id: "v2",
        titulo: "Gerenciando pedidos e entregas",
        descricao: "Veja como organizar sua produção e entregas usando o Kanban.",
        categoriaId: "pedidos",
        youtubeId: "L_jWHffIx5E", // Placeholder (Smash Mouth?)
        duracao: "08:15",
        visualizacoes: 856,
        ordem: 2,
        tags: ["pedidos", "kanban", "entrega"],
        chapters: [],
        relacionados: [],
        criadoEm: "2025-01-21",
        ativo: true
    },
    {
        id: "v3",
        titulo: "Fluxo de caixa completo",
        descricao: "Entenda suas finanças: entradas, saídas e relatórios.",
        categoriaId: "financeiro",
        youtubeId: "3tmd-ClpJxA", // Placeholder
        duracao: "15:42",
        visualizacoes: 2100,
        ordem: 3,
        tags: ["financeiro", "fluxo de caixa"],
        chapters: [],
        relacionados: [],
        criadoEm: "2025-01-22",
        ativo: true
    },
    {
        id: "v4",
        titulo: "Planejamento de produção automático",
        descricao: "Como o sistema calcula ingredientes automaticamente.",
        categoriaId: "producao",
        youtubeId: "jNQXAC9IVRw", // Placeholder
        duracao: "10:20",
        visualizacoes: 645,
        ordem: 4,
        tags: ["produção", "ingredientes"],
        chapters: [],
        relacionados: [],
        criadoEm: "2025-01-23",
        ativo: true
    },
    {
        id: "v5",
        titulo: "Controle de estoque simplificado",
        descricao: "Mantenha seu estoque sempre atualizado.",
        categoriaId: "estoque",
        youtubeId: "CEvxZvSJUx8", // Placeholder
        duracao: "06:45",
        visualizacoes: 421,
        ordem: 5,
        tags: ["estoque", "inventário"],
        chapters: [],
        relacionados: [],
        criadoEm: "2025-01-24",
        ativo: true
    },
    {
        id: "v6",
        titulo: "Relatórios e análises",
        descricao: "Tome decisões baseadas em dados reais.",
        categoriaId: "financeiro",
        youtubeId: "fJ9rUzIMcZQ", // Placeholder
        duracao: "18:30",
        visualizacoes: 890,
        ordem: 6,
        tags: ["relatórios", "análise"],
        chapters: [],
        relacionados: [],
        criadoEm: "2025-01-25",
        ativo: true
    }
];

export const videoPlaylists: Playlist[] = [
    {
        id: "p1",
        titulo: "Curso Completo: Começando",
        descricao: "Este curso te guia desde o primeiro acesso até criar seu primeiro orçamento completo.",
        categoriaId: "comecando",
        icone: "Rocket",
        videosIds: ["v1", "v2"], // Reusing IDs
        duracaoTotal: "20:49",
        ordem: 1,
        ativo: true
    },
    {
        id: "p2",
        titulo: "Dominando Pedidos",
        descricao: "Domine a gestão de pedidos e fluxo de produção.",
        categoriaId: "pedidos",
        icone: "Package",
        videosIds: ["v2", "v4"],
        duracaoTotal: "18:35",
        ordem: 2,
        ativo: true
    },
    {
        id: "p3",
        titulo: "Gestão Financeira Completa",
        descricao: "Tudo sobre o financeiro da sua confeitaria.",
        categoriaId: "financeiro",
        icone: "DollarSign",
        videosIds: ["v3", "v6"],
        duracaoTotal: "34:12",
        ordem: 3,
        ativo: true
    }
];

export function getThumbnailUrl(youtubeId: string): string {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}
