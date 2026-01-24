"use client";

import { useState, useRef } from "react";
import { X, HelpCircle, Bug, Lightbulb, AlertTriangle, Upload, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
// ... (lines 5-219 remain same, need to be careful with range)

// We need to do this in two chunks because the file is large and range logic might be tricky if I don't see exact lines.
// Let's just fix the import first.
import { helpCategories } from "@/lib/help-data";
import { TicketPriority, TicketType } from "@/lib/help-data-tickets";
import { cn } from "@/lib/utils";

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

interface TicketForm {
    tipo: TicketType | '';
    categoriaId: string;
    assunto: string;
    descricao: string;
    prioridade: TicketPriority;
    email: string;
    telefone: string;
    termosAceitos: boolean;
    contatoAutorizado: boolean;
}

const initialForm: TicketForm = {
    tipo: '',
    categoriaId: '',
    assunto: '',
    descricao: '',
    prioridade: 'media',
    email: 'usuario@email.com', // Pre-filled mock
    telefone: '(51) 99999-9999', // Pre-filled mock
    termosAceitos: false,
    contatoAutorizado: true
};

export default function CreateTicketModal({ isOpen, onClose, onSubmit }: CreateTicketModalProps) {
    const [form, setForm] = useState<TicketForm>(initialForm);
    const [mockAttachments, setMockAttachments] = useState<{ name: string, size: string }[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof TicketForm, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: any = {};
        if (!form.tipo) newErrors.tipo = "Selecione o tipo de solicitação";
        if (!form.categoriaId) newErrors.categoriaId = "Selecione a categoria";
        if (form.assunto.length < 10) newErrors.assunto = "Assunto muito curto (min: 10)";
        if (form.descricao.length < 50) newErrors.descricao = "Descrição muito curta (min: 50)";
        if (!form.email.includes('@')) newErrors.email = "E-mail inválido";
        if (!form.termosAceitos) newErrors.termosAceitos = "Você deve aceitar os termos";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        onSubmit({
            ...form,
            anexos: mockAttachments.map(a => ({
                nome: a.name,
                url: '#', // In a real app we would upload and get URL
                tamanho: 1024, // simplified
                tipo: a.name.endsWith('png') || a.name.endsWith('jpg') ? 'image/jpeg' : 'application/pdf'
            }))
        });

        setForm(initialForm);
        setMockAttachments([]);
        setIsSubmitting(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            // Limit to 5 files total
            const remainingSlots = 5 - mockAttachments.length;
            const filesToAdd = files.slice(0, remainingSlots).map(f => ({
                name: f.name,
                size: (f.size / 1024 / 1024).toFixed(2) + 'MB'
            }));

            setMockAttachments([...mockAttachments, ...filesToAdd]);

            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Abrir Ticket de Suporte</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* 1. Tipo */}
                    <section>
                        <label className="block text-sm font-bold text-text-primary mb-3">TIPO DE SOLICITAÇÃO *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { id: 'duvida', label: 'Dúvida', desc: 'Preciso de ajuda', icon: HelpCircle },
                                { id: 'bug', label: 'Problema Técnico', desc: 'Algo não funciona', icon: Bug },
                                { id: 'sugestao', label: 'Sugestão', desc: 'Ideia de melhoria', icon: Lightbulb },
                                { id: 'erro', label: 'Reportar Erro', desc: 'Comportamento estranho', icon: AlertTriangle },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setForm({ ...form, tipo: item.id as TicketType })}
                                    className={cn(
                                        "p-3 rounded-xl border text-left transition-all flex items-start gap-3",
                                        form.tipo === item.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border hover:bg-gray-50"
                                    )}
                                >
                                    <div className={cn("mt-0.5", form.tipo === item.id ? "text-primary" : "text-gray-400")}>
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-text-primary">{item.label}</div>
                                        <div className="text-xs text-text-secondary">{item.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>}
                    </section>

                    {/* 2. Categoria e Assunto */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-1">CATEGORIA *</label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-border bg-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                value={form.categoriaId}
                                onChange={e => setForm({ ...form, categoriaId: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {helpCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                                <option value="outro">Outro</option>
                            </select>
                            {errors.categoriaId && <p className="text-red-500 text-xs mt-1">{errors.categoriaId}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-1">PRIORIDADE</label>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {['baixa', 'media', 'alta', 'urgente'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setForm({ ...form, prioridade: p as TicketPriority })}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all",
                                            form.prioridade === p
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-text-secondary hover:text-text-primary"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section>
                        <label className="block text-sm font-bold text-text-primary mb-1">ASSUNTO *</label>
                        <input
                            type="text"
                            placeholder="Descreva resumidamente o problema..."
                            className="w-full p-2.5 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            value={form.assunto}
                            onChange={e => setForm({ ...form, assunto: e.target.value })}
                        />
                        {errors.assunto && <p className="text-red-500 text-xs mt-1">{errors.assunto}</p>}
                    </section>

                    {/* 3. Descrição */}
                    <section>
                        <label className="block text-sm font-bold text-text-primary mb-1">DESCRIÇÃO DETALHADA *</label>
                        <div className="relative">
                            <textarea
                                rows={5}
                                placeholder="Conte em detalhes: o que aconteceu, o que esperava, passos para reproduzir..."
                                className="w-full p-3 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                value={form.descricao}
                                onChange={e => setForm({ ...form, descricao: e.target.value })}
                            />
                            <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                                {form.descricao.length} chars
                            </span>
                        </div>
                        {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
                    </section>

                    {/* 4. Anexos */}
                    <section>
                        <label className="block text-sm font-bold text-text-primary mb-2">ANEXOS (Opcional)</label>
                        <div
                            className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={triggerFileInput}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                accept=".png,.jpg,.jpeg,.pdf"
                                onChange={handleFileSelect}
                            />
                            <Upload className="text-gray-400 mb-2" size={24} />
                            <p className="text-sm text-text-secondary font-medium">Clique para adicionar arquivo</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF até 10MB</p>
                        </div>

                        {mockAttachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {mockAttachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-border">
                                        <div className="flex items-center gap-2">
                                            {file.name.endsWith('pdf') ? <FileText size={16} className="text-red-500" /> : <ImageIcon size={16} className="text-blue-500" />}
                                            <span className="text-sm text-text-primary truncate max-w-[200px]">{file.name}</span>
                                            <span className="text-xs text-gray-400">({file.size})</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMockAttachments(mockAttachments.filter((_, i) => i !== idx));
                                            }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* 5. Contato e Termos */}
                    <section className="bg-gray-50 p-4 rounded-xl border border-border space-y-4">
                        <h3 className="font-bold text-sm text-text-primary">SEUS DADOS DE CONTATO</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">E-mail</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    readOnly
                                    className="w-full p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Telefone</label>
                                <input
                                    type="text"
                                    value={form.telefone}
                                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                                    className="w-full p-2 bg-white border border-border rounded text-sm text-gray-800 focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-gray-200">
                            <div className="flex items-start gap-3">
                                <Toggle
                                    checked={form.termosAceitos}
                                    onChange={(checked) => setForm({ ...form, termosAceitos: checked })}
                                    size="sm"
                                />
                                <span className="text-sm text-text-secondary pt-1">Li e aceito os termos de suporte e política de privacidade.</span>
                            </div>
                            {errors.termosAceitos && <p className="text-red-500 text-xs ml-11 -mt-2">{errors.termosAceitos}</p>}

                            <div className="flex items-start gap-3">
                                <Toggle
                                    checked={form.contatoAutorizado}
                                    onChange={(checked) => setForm({ ...form, contatoAutorizado: checked })}
                                    size="sm"
                                />
                                <span className="text-sm text-text-secondary pt-1">Autorizo contato por e-mail e telefone para resolução deste ticket.</span>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            'Abrir Ticket'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

