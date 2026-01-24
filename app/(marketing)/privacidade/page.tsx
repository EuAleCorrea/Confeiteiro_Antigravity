"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, UserCheck } from "lucide-react";

export default function PrivacidadePage() {
    return (
        <main className="min-h-screen bg-[#FFFBF7]">
            {/* Header */}
            <header className="bg-[#3E2723] text-white py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Voltar para Home
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Política de Privacidade
                    </h1>
                    <p className="text-white/70">
                        Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </header>

            {/* Quick Summary */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-xl font-bold text-[#3E2723] mb-6">
                        Resumo da Nossa Política
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#3E2723]">Dados Protegidos</h3>
                                <p className="text-sm text-[#5D4037]/70">Seus dados são criptografados e armazenados com segurança.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#3E2723]">Nunca Vendemos</h3>
                                <p className="text-sm text-[#5D4037]/70">Nunca vendemos ou compartilhamos seus dados com terceiros.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#3E2723]">Você no Controle</h3>
                                <p className="text-sm text-[#5D4037]/70">Você pode exportar ou excluir seus dados a qualquer momento.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">

                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="text-primary" size={24} />
                                <h2 className="text-2xl font-bold text-[#3E2723]">
                                    1. Dados que Coletamos
                                </h2>
                            </div>
                            <p className="text-[#5D4037]/80 leading-relaxed mb-4">
                                Coletamos apenas os dados necessários para fornecer nosso serviço:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold shrink-0">1</span>
                                    <div>
                                        <strong className="text-[#3E2723]">Dados da Conta:</strong>
                                        <span className="text-[#5D4037]/80"> Nome, email, telefone e senha criptografada.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold shrink-0">2</span>
                                    <div>
                                        <strong className="text-[#3E2723]">Dados do Negócio:</strong>
                                        <span className="text-[#5D4037]/80"> Pedidos, clientes, produtos, estoque e finanças que você cadastra.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold shrink-0">3</span>
                                    <div>
                                        <strong className="text-[#3E2723]">Dados de Uso:</strong>
                                        <span className="text-[#5D4037]/80"> Como você interage com o app para melhorarmos o serviço.</span>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Eye className="text-primary" size={24} />
                                <h2 className="text-2xl font-bold text-[#3E2723]">
                                    2. Como Usamos seus Dados
                                </h2>
                            </div>
                            <p className="text-[#5D4037]/80 leading-relaxed mb-4">
                                Usamos seus dados apenas para:
                            </p>
                            <ul className="list-disc list-inside text-[#5D4037]/80 space-y-2">
                                <li>Fornecer e manter o serviço Confeiteiro</li>
                                <li>Processar pagamentos e gerenciar sua assinatura</li>
                                <li>Enviar notificações importantes sobre sua conta</li>
                                <li>Melhorar e personalizar sua experiência</li>
                                <li>Responder suas solicitações de suporte</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="text-primary" size={24} />
                                <h2 className="text-2xl font-bold text-[#3E2723]">
                                    3. Como Protegemos seus Dados
                                </h2>
                            </div>
                            <p className="text-[#5D4037]/80 leading-relaxed mb-4">
                                Implementamos medidas de segurança rigorosas:
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-[#FFFBF7] rounded-xl p-4">
                                    <h4 className="font-semibold text-[#3E2723] mb-2">🔐 Criptografia</h4>
                                    <p className="text-sm text-[#5D4037]/70">
                                        Todos os dados são criptografados em trânsito (TLS) e em repouso (AES-256).
                                    </p>
                                </div>
                                <div className="bg-[#FFFBF7] rounded-xl p-4">
                                    <h4 className="font-semibold text-[#3E2723] mb-2">🔒 Autenticação Segura</h4>
                                    <p className="text-sm text-[#5D4037]/70">
                                        Senhas são hasheadas com algoritmos modernos e seguros.
                                    </p>
                                </div>
                                <div className="bg-[#FFFBF7] rounded-xl p-4">
                                    <h4 className="font-semibold text-[#3E2723] mb-2">☁️ Infraestrutura</h4>
                                    <p className="text-sm text-[#5D4037]/70">
                                        Hospedagem em servidores com certificações de segurança.
                                    </p>
                                </div>
                                <div className="bg-[#FFFBF7] rounded-xl p-4">
                                    <h4 className="font-semibold text-[#3E2723] mb-2">👁️ Monitoramento</h4>
                                    <p className="text-sm text-[#5D4037]/70">
                                        Monitoramento 24/7 para detectar atividades suspeitas.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Bell className="text-primary" size={24} />
                                <h2 className="text-2xl font-bold text-[#3E2723]">
                                    4. Seus Direitos (LGPD)
                                </h2>
                            </div>
                            <p className="text-[#5D4037]/80 leading-relaxed mb-4">
                                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                            </p>
                            <ul className="list-disc list-inside text-[#5D4037]/80 space-y-2">
                                <li><strong>Acessar</strong> seus dados pessoais armazenados</li>
                                <li><strong>Corrigir</strong> dados incompletos ou desatualizados</li>
                                <li><strong>Excluir</strong> seus dados (direito ao esquecimento)</li>
                                <li><strong>Exportar</strong> seus dados em formato legível</li>
                                <li><strong>Revogar</strong> consentimentos dados anteriormente</li>
                                <li><strong>Opor-se</strong> ao tratamento de dados em certos casos</li>
                            </ul>
                            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <p className="text-[#3E2723] text-sm">
                                    Para exercer qualquer um desses direitos, entre em contato pelo email{" "}
                                    <a href="mailto:privacidade@confeiteiro.com.br" className="text-primary font-semibold hover:underline">
                                        privacidade@confeiteiro.com.br
                                    </a>
                                </p>
                            </div>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                5. Cookies
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                Usamos cookies essenciais para o funcionamento do sistema (autenticação,
                                preferências) e cookies de análise para entender como melhorar o serviço.
                                Você pode configurar seu navegador para recusar cookies, mas isso pode
                                afetar algumas funcionalidades.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                6. Atualizações desta Política
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                Podemos atualizar esta política periodicamente. Quando fizermos alterações
                                significativas, notificaremos você por email ou através de um aviso no aplicativo.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                7. Contato
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed mb-4">
                                Se você tiver dúvidas sobre nossa Política de Privacidade:
                            </p>
                            <div className="p-4 bg-[#FFFBF7] rounded-xl space-y-2">
                                <p className="text-[#5D4037]">
                                    <strong>Email:</strong>{" "}
                                    <a href="mailto:privacidade@confeiteiro.com.br" className="text-primary hover:underline">
                                        privacidade@confeiteiro.com.br
                                    </a>
                                </p>
                                <p className="text-[#5D4037]">
                                    <strong>Encarregado de Dados (DPO):</strong>{" "}
                                    <a href="mailto:dpo@confeiteiro.com.br" className="text-primary hover:underline">
                                        dpo@confeiteiro.com.br
                                    </a>
                                </p>
                            </div>
                        </section>

                    </div>
                </div>
            </article>

            {/* Footer */}
            <footer className="py-8 border-t border-gray-200">
                <div className="max-w-5xl mx-auto px-6 text-center text-[#5D4037]/60 text-sm">
                    © {new Date().getFullYear()} Confeiteiro. Todos os direitos reservados.
                </div>
            </footer>
        </main>
    );
}

