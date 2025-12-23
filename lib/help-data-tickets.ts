
export type TicketStatus = 'aberto' | 'em_analise' | 'aguardando_resposta' | 'em_andamento' | 'resolvido' | 'fechado' | 'cancelado';
export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TicketType = 'duvida' | 'bug' | 'sugestao' | 'erro';
export type MessageSenderType = 'usuario' | 'suporte';

export interface TicketAttachment {
    nome: string;
    url: string; // Fake URL for now
    tamanho: number; // bytes
    tipo: string;
}

export interface TicketMessage {
    id: string;
    remetente: {
        tipo: MessageSenderType;
        nome: string;
        avatar?: string;
    };
    conteudo: string;
    anexos: TicketAttachment[];
    criadoEm: string;
}

export interface SupportTicket {
    id: string;
    numero: number;
    usuarioId: string;
    tipo: TicketType;
    categoriaId: string; // Using existing HelpCategory IDs
    assunto: string;
    descricao: string;
    prioridade: TicketPriority;
    status: TicketStatus;

    mensagens: TicketMessage[];

    anexos: TicketAttachment[];

    criadoEm: string;
    atualizadoEm: string;
    resolvidoEm?: string;
}

// Mock Data
export const mockTickets: SupportTicket[] = [
    {
        id: "t1",
        numero: 1023,
        usuarioId: "u1",
        tipo: "duvida",
        categoriaId: "financeiro",
        assunto: "Dúvida sobre DRE",
        descricao: "Gostaria de entender melhor como o DRE é calculado na plataforma, especificamente a linha de custos variáveis.",
        prioridade: "media",
        status: "aberto",
        anexos: [],
        mensagens: [],
        criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        atualizadoEm: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
        id: "t2",
        numero: 1022,
        usuarioId: "u1",
        tipo: "bug",
        categoriaId: "producao", // Assuming 'producao' category exists, mapped to 'tecnico' conceptually if not
        assunto: "Erro ao exportar relatório",
        descricao: "Quando tento exportar o relatório de produção em PDF, ocorre um erro desconhecido.",
        prioridade: "alta",
        status: "em_analise",
        anexos: [],
        mensagens: [
            {
                id: "m1",
                remetente: { tipo: "suporte", nome: "Equipe Técnica" },
                conteudo: "Olá! Estamos analisando sua solicitação. Poderia informar qual navegador está usando?",
                anexos: [],
                criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
            }
        ],
        criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        atualizadoEm: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    {
        id: "t3",
        numero: 1021,
        usuarioId: "u1",
        tipo: "duvida",
        categoriaId: "produtos",
        assunto: "Como cadastrar receitas?",
        descricao: "Não estou encontrando onde cadastro os ingredientes da receita.",
        prioridade: "baixa",
        status: "resolvido",
        anexos: [],
        mensagens: [
            {
                id: "m2",
                remetente: { tipo: "suporte", nome: "Maria Atendente" },
                conteudo: "Olá! Para cadastrar, vá em Produtos > Novo Produto e selecione a aba 'Ficha Técnica'.",
                anexos: [],
                criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString()
            }
        ],
        criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        atualizadoEm: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
        resolvidoEm: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString()
    }
];

export const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
        case 'aberto': return 'Aberto';
        case 'em_analise': return 'Em Análise';
        case 'aguardando_resposta': return 'Aguardando Resposta';
        case 'em_andamento': return 'Em Andamento';
        case 'resolvido': return 'Resolvido';
        case 'fechado': return 'Fechado';
        case 'cancelado': return 'Cancelado';
        default: return status;
    }
};

export const getStatusColor = (status: TicketStatus) => {
    switch (status) {
        case 'aberto': return 'bg-green-100 text-green-700 border-green-200';
        case 'em_analise': return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Using yellow for consistency with 'analysis' often implying wait/warning
        case 'aguardando_resposta': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'em_andamento': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'resolvido': return 'bg-gray-100 text-gray-700 border-gray-200'; // Resolved typically neutral or green, used gray to differentiate creating open/resolved visual hierarchy 
        // Wait, spec said Resolved: verde, Aberto: laranja. Let me align with SPEC.
        // Spec: Abertos: laranja, Em Análise: azul, Resolvidos: verde.
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

// Start Over with Spec Colors
export const getStatusColorSpec = (status: TicketStatus) => {
    switch (status) {
        case 'aberto': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'em_analise': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'resolvido': return 'bg-green-100 text-green-700 border-green-200';
        case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export const getPriorityLabel = (priority: TicketPriority) => {
    switch (priority) {
        case 'baixa': return 'Baixa';
        case 'media': return 'Média';
        case 'alta': return 'Alta';
        case 'urgente': return 'Urgente';
        default: return priority;
    }
};
