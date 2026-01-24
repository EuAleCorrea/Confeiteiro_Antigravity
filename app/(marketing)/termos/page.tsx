"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermosPage() {
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
                        Termos de Uso
                    </h1>
                    <p className="text-white/70">
                        Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </header>

            {/* Content */}
            <article className="py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none">

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                1. Aceitação dos Termos
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                Ao acessar e usar o Confeiteiro, você concorda em cumprir e estar vinculado
                                a estes Termos de Uso. Se você não concordar com qualquer parte destes termos,
                                não poderá acessar o serviço.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                2. Descrição do Serviço
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                O Confeiteiro é um sistema de gestão online projetado para confeitarias artesanais.
                                Nosso serviço inclui:
                            </p>
                            <ul className="list-disc list-inside text-[#5D4037]/80 mt-4 space-y-2">
                                <li>Gestão de pedidos e clientes</li>
                                <li>Controle de estoque e ingredientes</li>
                                <li>Gestão financeira (receitas e despesas)</li>
                                <li>Cálculo de custos e precificação</li>
                                <li>Integração com WhatsApp</li>
                                <li>Relatórios e análises</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                3. Conta do Usuário
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                Para usar o Confeiteiro, você deve criar uma conta fornecendo informações
                                precisas e completas. Você é responsável por manter a confidencialidade
                                de sua senha e por todas as atividades que ocorrem em sua conta.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                4. Uso Aceitável
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed mb-4">
                                Você concorda em não usar o serviço para:
                            </p>
                            <ul className="list-disc list-inside text-[#5D4037]/80 space-y-2">
                                <li>Violar leis ou regulamentos aplicáveis</li>
                                <li>Transmitir conteúdo ilegal, ofensivo ou prejudicial</li>
                                <li>Tentar acessar sistemas sem autorização</li>
                                <li>Interferir no funcionamento do serviço</li>
                                <li>Revender ou redistribuir o serviço sem autorização</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                5. Pagamentos e Assinaturas
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                O Confeiteiro oferece planos de assinatura mensal. Os pagamentos são
                                processados automaticamente na data de renovação. Você pode cancelar
                                sua assinatura a qualquer momento, e o acesso continuará até o fim
                                do período pago.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                6. Propriedade Intelectual
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                O Confeiteiro e todo o seu conteúdo, recursos e funcionalidades são
                                propriedade da nossa empresa e protegidos por leis de direitos autorais.
                                Você mantém a propriedade de todos os dados que inserir no sistema.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                7. Limitação de Responsabilidade
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                O Confeiteiro é fornecido "como está". Não garantimos que o serviço
                                será ininterrupto ou livre de erros. Em nenhum caso seremos responsáveis
                                por danos indiretos, incidentais ou consequenciais decorrentes do uso
                                do serviço.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                8. Modificações
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                Reservamo-nos o direito de modificar estes termos a qualquer momento.
                                Notificaremos os usuários sobre mudanças significativas por email ou
                                através do aplicativo. O uso continuado após as modificações constitui
                                aceitação dos novos termos.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
                                9. Contato
                            </h2>
                            <p className="text-[#5D4037]/80 leading-relaxed">
                                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
                            </p>
                            <div className="mt-4 p-4 bg-[#FFFBF7] rounded-xl">
                                <p className="text-[#5D4037]">
                                    <strong>Email:</strong>{" "}
                                    <a href="mailto:legal@confeiteiro.com.br" className="text-primary hover:underline">
                                        legal@confeiteiro.com.br
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

