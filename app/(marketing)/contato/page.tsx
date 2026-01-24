"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ArrowLeft,
    Mail,
    MessageCircle,
    Phone,
    MapPin,
    Send,
    CheckCircle,
    Loader2
} from "lucide-react";

export default function ContatoPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simular envio
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

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
                        Fale Conosco
                    </h1>
                    <p className="text-xl text-white/70 max-w-2xl">
                        Estamos aqui para ajudar! Envie sua mensagem e responderemos o mais rápido possível.
                    </p>
                </div>
            </header>

            {/* Content */}
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[#3E2723] mb-6">
                                    Informações de Contato
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <Mail size={22} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#3E2723]">Email</p>
                                            <a href="mailto:suporte@confeiteiro.com.br" className="text-primary hover:underline">
                                                suporte@confeiteiro.com.br
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                            <MessageCircle size={22} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#3E2723]">WhatsApp</p>
                                            <a href="https://wa.me/5511999999999" className="text-green-600 hover:underline">
                                                (11) 99999-9999
                                            </a>
                                            <p className="text-sm text-[#5D4037]/60 mt-1">
                                                Seg-Sex, 9h às 18h
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            <Phone size={22} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#3E2723]">Telefone</p>
                                            <a href="tel:+551140028922" className="text-blue-600 hover:underline">
                                                (11) 4002-8922
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                            <MapPin size={22} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#3E2723]">Endereço</p>
                                            <p className="text-[#5D4037]/70">
                                                São Paulo, SP - Brasil
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Response Time */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-[#3E2723] mb-2">
                                    ⏱️ Tempo de Resposta
                                </h3>
                                <p className="text-[#5D4037]/70 text-sm">
                                    Normalmente respondemos em até <strong>24 horas</strong> em dias úteis.
                                    Clientes Premium têm suporte prioritário.
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                {isSubmitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="text-green-600" size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-[#3E2723] mb-2">
                                            Mensagem Enviada!
                                        </h3>
                                        <p className="text-[#5D4037]/70 mb-6">
                                            Recebemos sua mensagem e responderemos em breve.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                setFormData({ name: "", email: "", subject: "", message: "" });
                                            }}
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            Enviar outra mensagem
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                                                    Seu Nome
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Maria Silva"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#3E2723] mb-2">
                                                    Seu Email
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="maria@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#3E2723] mb-2">
                                                Assunto
                                            </label>
                                            <select
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                            >
                                                <option value="">Selecione um assunto</option>
                                                <option value="duvida">Dúvida sobre o sistema</option>
                                                <option value="suporte">Suporte técnico</option>
                                                <option value="financeiro">Financeiro/Pagamento</option>
                                                <option value="parceria">Parceria comercial</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[#3E2723] mb-2">
                                                Sua Mensagem
                                            </label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                                placeholder="Descreva sua dúvida ou solicitação..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={20} />
                                                    Enviar Mensagem
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
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

