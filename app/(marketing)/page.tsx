"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
    ChefHat,
    ShoppingBag,
    Package,
    DollarSign,
    Calendar,
    MessageCircle,
    CheckCircle,
    ArrowRight,
    Star,
    Play,
    Menu,
    X
} from "lucide-react";

// ============================================
// LANDING PAGE - CONFEITEIRO
// Design: Sweet Brutalism (Anti-Template)
// ============================================

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="relative overflow-hidden">
            {/* ========== NAVIGATION ========== */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
                    : "bg-transparent py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white text-2xl transform group-hover:rotate-[-8deg] transition-transform duration-300">
                            🎂
                        </div>
                        <span className="text-2xl font-bold text-[#5D4037] tracking-tight">
                            Confeiteiro
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#funcionalidades" className="text-[#5D4037]/80 hover:text-primary font-medium transition-colors">
                            Funcionalidades
                        </a>
                        <a href="#precos" className="text-[#5D4037]/80 hover:text-primary font-medium transition-colors">
                            Preços
                        </a>
                        <a href="#depoimentos" className="text-[#5D4037]/80 hover:text-primary font-medium transition-colors">
                            Depoimentos
                        </a>
                        <Link
                            href="/login"
                            className="text-[#5D4037] font-semibold hover:text-primary transition-colors"
                        >
                            Entrar
                        </Link>
                        <Link
                            href="/login"
                            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
                        >
                            Teste Grátis
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-[#5D4037]"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl p-6 space-y-4 animate-in slide-in-from-top duration-200">
                        <a href="#funcionalidades" className="block text-[#5D4037] font-medium py-2">Funcionalidades</a>
                        <a href="#precos" className="block text-[#5D4037] font-medium py-2">Preços</a>
                        <a href="#depoimentos" className="block text-[#5D4037] font-medium py-2">Depoimentos</a>
                        <Link href="/login" className="block text-[#5D4037] font-medium py-2">Entrar</Link>
                        <Link
                            href="/login"
                            className="block bg-primary text-white font-bold px-6 py-3 rounded-full text-center"
                        >
                            Teste Grátis
                        </Link>
                    </div>
                )}
            </nav>

            {/* ========== HERO SECTION ========== */}
            <section className="relative min-h-screen flex items-center pt-24 pb-16">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#FFE4D6] to-[#FFD1DC] rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#FFF3E0] to-[#FFE0B2] rounded-full blur-3xl opacity-50" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-[#5D4037]">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            +500 confeiteiras já usam
                        </div>

                        {/* Headline - MASSIVE TYPOGRAPHY */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#3E2723] leading-[1.1] tracking-tight">
                            Sua confeitaria
                            <span className="block text-primary">organizada</span>
                            <span className="block">como nunca.</span>
                        </h1>

                        {/* Sub-headline */}
                        <p className="text-xl text-[#5D4037]/80 max-w-xl leading-relaxed">
                            Pedidos, estoque, finanças e clientes em um só lugar.
                            Pare de usar cadernos e planilhas. <strong>Comece a crescer.</strong>
                        </p>

                        {/* CTA Group */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/login"
                                className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
                            >
                                Começar Grátis
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <button className="group inline-flex items-center justify-center gap-2 bg-white border-2 border-[#5D4037]/20 text-[#5D4037] font-semibold text-lg px-8 py-4 rounded-full hover:border-primary hover:text-primary transition-all">
                                <Play size={20} className="group-hover:scale-110 transition-transform" />
                                Ver Demo
                            </button>
                        </div>

                        {/* Trust Signals */}
                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-sm text-[#5D4037]/60">
                                4.9/5 • Avaliado por +200 confeiteiras
                            </span>
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="relative lg:pl-12">
                        {/* Phone Mockup or Dashboard Preview */}
                        <div className="relative">
                            {/* Floating Cards */}
                            <div className="absolute -top-8 -left-8 bg-white rounded-2xl shadow-2xl p-4 animate-float z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Novo Pedido</p>
                                        <p className="font-bold text-[#3E2723]">Bolo de Chocolate</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 animate-float-delayed z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <DollarSign className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Faturamento Hoje</p>
                                        <p className="font-bold text-[#3E2723]">R$ 1.847,00</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main Visual */}
                            <div className="bg-gradient-to-br from-[#FFE4EC] via-[#FFF0F5] to-[#FFE4D6] rounded-[32px] p-8 shadow-2xl">
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                    {/* Mock Dashboard Header */}
                                    <div className="bg-[#FFFBF7] border-b border-gray-100 p-4 flex items-center gap-3">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-green-400" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-400">Dashboard</div>
                                    </div>
                                    {/* Mock Content */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-primary/5 rounded-xl p-4">
                                                <p className="text-xs text-gray-500 mb-1">Pedidos Hoje</p>
                                                <p className="text-2xl font-bold text-primary">12</p>
                                            </div>
                                            <div className="flex-1 bg-green-50 rounded-xl p-4">
                                                <p className="text-xs text-gray-500 mb-1">Concluídos</p>
                                                <p className="text-2xl font-bold text-green-600">8</p>
                                            </div>
                                        </div>
                                        <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl flex items-end p-4 gap-2">
                                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-primary rounded-t-lg transition-all hover:bg-primary-dark"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FEATURES SECTION ========== */}
            <section id="funcionalidades" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                            Funcionalidades
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-[#3E2723] mt-4 mb-6">
                            Tudo que você precisa para crescer
                        </h2>
                        <p className="text-xl text-[#5D4037]/70">
                            Desenvolvido por quem entende de confeitaria.
                            Cada recurso foi pensado para facilitar seu dia a dia.
                        </p>
                    </div>

                    {/* Features Grid - STAGGERED */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: ShoppingBag,
                                title: "Gestão de Pedidos",
                                description: "Organize todos os seus pedidos em um só lugar. Acompanhe status, prazos e entregas.",
                                color: "bg-primary/10 text-primary",
                            },
                            {
                                icon: Package,
                                title: "Controle de Estoque",
                                description: "Saiba exatamente o que tem disponível. Alertas automáticos de reposição.",
                                color: "bg-blue-50 text-blue-600",
                            },
                            {
                                icon: DollarSign,
                                title: "Finanças Simplificadas",
                                description: "Receitas, despesas e lucro real. Relatórios que você entende de verdade.",
                                color: "bg-green-50 text-green-600",
                            },
                            {
                                icon: Calendar,
                                title: "Agenda Inteligente",
                                description: "Visualize sua produção por dia, semana ou mês. Nunca mais perca um prazo.",
                                color: "bg-yellow-50 text-yellow-600",
                            },
                            {
                                icon: ChefHat,
                                title: "Fichas Técnicas",
                                description: "Calcule custos automaticamente. Precifique seus produtos com segurança.",
                                color: "bg-purple-50 text-purple-600",
                            },
                            {
                                icon: MessageCircle,
                                title: "WhatsApp Integrado",
                                description: "Envie orçamentos e confirmações direto pelo app. Comunicação profissional.",
                                color: "bg-emerald-50 text-emerald-600",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-[#FFFBF7] hover:bg-white border border-transparent hover:border-primary/10 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-[#3E2723] mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-[#5D4037]/70 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== SOCIAL PROOF / TESTIMONIALS ========== */}
            <section id="depoimentos" className="py-24 bg-gradient-to-b from-[#FFFBF7] to-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                            Depoimentos
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-[#3E2723] mt-4 mb-6">
                            Quem usa, recomenda
                        </h2>
                    </div>

                    {/* Testimonials */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Maria Clara",
                                role: "Doces da Má",
                                avatar: "🧁",
                                text: "Finalmente consigo ver quanto realmente estou lucrando! O Confeiteiro mudou minha forma de trabalhar.",
                            },
                            {
                                name: "Juliana Santos",
                                role: "Ateliê de Bolos",
                                avatar: "🎂",
                                text: "Antes eu anotava tudo em cadernos e perdia pedidos. Agora tenho controle total e meus clientes adoram a organização.",
                            },
                            {
                                name: "Fernanda Lima",
                                role: "Brigadeiros Gourmet",
                                avatar: "🍫",
                                text: "O controle de estoque é incrível! Nunca mais fiquei sem ingredientes no meio de uma encomenda.",
                            },
                        ].map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-[#5D4037] text-lg leading-relaxed mb-6">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#3E2723]">{testimonial.name}</p>
                                        <p className="text-sm text-[#5D4037]/60">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== PRICING SECTION ========== */}
            <section id="precos" className="py-24 bg-[#3E2723] relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-full h-full"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                            Planos
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-6">
                            Simples e sem surpresas
                        </h2>
                        <p className="text-xl text-white/70">
                            Teste grátis por 14 dias. Cancele quando quiser.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                id: "basico",
                                name: "Básico",
                                price: "49",
                                description: "Ideal para quem está começando",
                                features: ["Até 50 pedidos/mês", "Gestão de clientes", "Agenda básica", "Suporte por email"],
                                highlighted: false,
                            },
                            {
                                id: "profissional",
                                name: "Profissional",
                                price: "99",
                                description: "Para confeitarias em crescimento",
                                features: ["Pedidos ilimitados", "Controle de estoque", "Finanças completas", "WhatsApp integrado", "Relatórios avançados", "Suporte prioritário"],
                                highlighted: true,
                            },
                            {
                                id: "premium",
                                name: "Premium",
                                price: "199",
                                description: "Para operações maiores",
                                features: ["Tudo do Profissional", "Multi-usuários", "API de integração", "Onboarding dedicado", "Suporte 24/7"],
                                highlighted: false,
                            },
                        ].map((plan, index) => (
                            <div
                                key={index}
                                className={`rounded-3xl p-8 ${plan.highlighted
                                    ? "bg-primary text-white scale-105 shadow-2xl shadow-primary/30"
                                    : "bg-white text-[#3E2723]"
                                    }`}
                            >
                                {plan.highlighted && (
                                    <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                                        MAIS POPULAR
                                    </div>
                                )}
                                <h3 className={`text-2xl font-bold ${plan.highlighted ? "text-white" : "text-[#3E2723]"}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm mt-2 ${plan.highlighted ? "text-white/80" : "text-[#5D4037]/70"}`}>
                                    {plan.description}
                                </p>
                                <div className="mt-6 mb-8">
                                    <span className={`text-5xl font-black ${plan.highlighted ? "text-white" : "text-[#3E2723]"}`}>
                                        R${plan.price}
                                    </span>
                                    <span className={plan.highlighted ? "text-white/70" : "text-[#5D4037]/60"}>/mês</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle size={18} className={plan.highlighted ? "text-white" : "text-primary"} />
                                            <span className={plan.highlighted ? "text-white/90" : "text-[#5D4037]"}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={`/checkout/${plan.id}`}
                                    className={`block w-full text-center font-bold py-4 rounded-full transition-all hover:scale-105 ${plan.highlighted
                                        ? "bg-white text-primary hover:shadow-lg"
                                        : "bg-primary text-white hover:bg-primary-dark"
                                        }`}
                                >
                                    Começar Agora
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FAQ SECTION ========== */}
            <section className="py-24 bg-white">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                            Dúvidas
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-[#3E2723] mt-4">
                            Perguntas Frequentes
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                question: "Posso testar antes de pagar?",
                                answer: "Sim! Você tem 14 dias para testar todas as funcionalidades sem pagar nada. Não pedimos cartão de crédito para começar.",
                            },
                            {
                                question: "Funciona no celular?",
                                answer: "Sim! O Confeiteiro funciona perfeitamente em qualquer dispositivo: celular, tablet ou computador.",
                            },
                            {
                                question: "Posso cancelar quando quiser?",
                                answer: "Claro! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento diretamente pelo app.",
                            },
                            {
                                question: "Como funciona o suporte?",
                                answer: "Oferecemos suporte por email para todos os planos. Planos Profissional e Premium têm suporte prioritário via WhatsApp.",
                            },
                        ].map((faq, index) => (
                            <details
                                key={index}
                                className="group bg-[#FFFBF7] rounded-2xl overflow-hidden"
                            >
                                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-[#3E2723] text-lg">
                                    {faq.question}
                                    <span className="text-primary group-open:rotate-45 transition-transform text-2xl">
                                        +
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-[#5D4037]/80 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FINAL CTA ========== */}
            <section className="py-24 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-[-50%] right-[-20%] w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                        Pronta para organizar sua confeitaria?
                    </h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Junte-se a mais de 500 confeiteiras que já transformaram seu negócio.
                        Comece grátis hoje mesmo.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-white text-primary font-bold text-lg px-10 py-5 rounded-full hover:scale-105 hover:shadow-2xl transition-all"
                    >
                        Começar Teste Grátis
                        <ArrowRight size={20} />
                    </Link>
                    <p className="text-white/60 mt-6 text-sm">
                        Sem cartão de crédito • Cancele quando quiser
                    </p>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="bg-[#2D1F1B] text-white/70 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl">
                                    🎂
                                </div>
                                <span className="text-xl font-bold text-white">Confeiteiro</span>
                            </div>
                            <p className="text-white/60 max-w-sm">
                                O sistema de gestão mais completo para confeitarias artesanais do Brasil.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-bold text-white mb-4">Produto</h4>
                            <ul className="space-y-3">
                                <li><a href="#funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                                <li><a href="#precos" className="hover:text-primary transition-colors">Preços</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Atualizações</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Suporte</h4>
                            <ul className="space-y-3">
                                <li><Link href="/ajuda" className="hover:text-primary transition-colors">Central de Ajuda</Link></li>
                                <li><Link href="/contato" className="hover:text-primary transition-colors">Contato</Link></li>
                                <li><Link href="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                                <li><Link href="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-sm">
                        © {new Date().getFullYear()} Confeiteiro. Todos os direitos reservados.
                    </div>
                </div>
            </footer>

            {/* ========== ANIMATIONS ========== */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float 4s ease-in-out infinite 1s;
                }
                @keyframes slide-in-from-top {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-in.slide-in-from-top {
                    animation: slide-in-from-top 0.2s ease-out;
                }
            `}</style>
        </main>
    );
}

