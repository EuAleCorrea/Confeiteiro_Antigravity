"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Book,
    MessageCircle,
    Video,
    HelpCircle,
    Search,
    ChevronRight
} from "lucide-react";

const helpCategories = [
    {
        icon: Book,
        title: "Primeiros Passos",
        description: "Aprenda a configurar sua conta e começar a usar",
        articles: 8,
        href: "#primeiros-passos",
    },
    {
        icon: MessageCircle,
        title: "Pedidos e Clientes",
        description: "Gerenciar pedidos, orçamentos e clientes",
        articles: 12,
        href: "#pedidos",
    },
    {
        icon: Video,
        title: "Vídeo Tutoriais",
        description: "Assista vídeos explicativos passo a passo",
        articles: 6,
        href: "#videos",
    },
    {
        icon: HelpCircle,
        title: "Perguntas Frequentes",
        description: "Respostas para as dúvidas mais comuns",
        articles: 15,
        href: "#faq",
    },
];

const popularArticles = [
    "Como criar meu primeiro pedido?",
    "Como calcular o preço de venda?",
    "Como adicionar ingredientes ao estoque?",
    "Como emitir um orçamento para cliente?",
    "Como conectar o WhatsApp?",
    "Como gerar relatórios financeiros?",
];

export default function CentralAjudaPage() {
    return (
        <main className="min-h-screen bg-[#FFFBF7]">
            {/* Header */}
            <header className="bg-[#3E2723] text-white py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Voltar para Home
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Central de Ajuda
                    </h1>
                    <p className="text-xl text-white/70 max-w-2xl">
                        Encontre respostas, tutoriais e guias para aproveitar ao máximo o Confeiteiro.
                    </p>

                    {/* Search */}
                    <div className="mt-8 relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar artigos, tutoriais..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
                        />
                    </div>
                </div>
            </header>

            {/* Categories */}
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-[#3E2723] mb-8">
                        Categorias
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {helpCategories.map((category, index) => (
                            <a
                                key={index}
                                href={category.href}
                                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <category.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[#3E2723] group-hover:text-primary transition-colors">
                                            {category.title}
                                        </h3>
                                        <p className="text-[#5D4037]/70 text-sm mt-1">
                                            {category.description}
                                        </p>
                                        <span className="text-xs text-primary font-medium mt-2 inline-block">
                                            {category.articles} artigos
                                        </span>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" size={20} />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Articles */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-[#3E2723] mb-8">
                        Artigos Populares
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {popularArticles.map((article, index) => (
                            <a
                                key={index}
                                href="#"
                                className="flex items-center gap-3 p-4 rounded-xl hover:bg-[#FFFBF7] transition-colors group"
                            >
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">
                                    {index + 1}
                                </div>
                                <span className="text-[#3E2723] group-hover:text-primary transition-colors">
                                    {article}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Não encontrou o que procura?
                        </h2>
                        <p className="text-white/80 mb-8 max-w-lg mx-auto">
                            Nossa equipe de suporte está pronta para ajudar você.
                        </p>
                        <Link
                            href="/contato"
                            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform"
                        >
                            <MessageCircle size={20} />
                            Falar com Suporte
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-gray-200">
                <div className="max-w-5xl mx-auto px-6 text-center text-[#5D4037]/60 text-sm">
                    © {new Date().getFullYear()} Confeiteiro. Todos os direitos reservados.
                </div>
            </footer>
        </main>
    );
}

