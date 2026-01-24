"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { Dialog } from "@/components/ui/Dialog"; // Assuming standard UI component exists or we build a simple modal
// Since I don't know if a Dialog component exists, I'll build a simple custom one to be safe and dependency-free

export default function FeedbackControl({ questionId }: { questionId: string }) {
    const [status, setStatus] = useState<'idle' | 'voted' | 'commenting'>('idle');
    const [vote, setVote] = useState<'up' | 'down' | null>(null);
    const [reasons, setReasons] = useState<string[]>([]);
    const [comment, setComment] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleVote = (type: 'up' | 'down') => {
        setVote(type);
        if (type === 'up') {
            setStatus('voted');
            showThankYou();
        } else {
            setStatus('commenting');
        }
    };

    const showThankYou = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSubmitNegative = () => {
        // Here we would send data to backend
        console.log({ questionId, vote: 'down', reasons, comment });
        setStatus('voted');
        showThankYou();
    };

    if (status === 'voted') {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-col items-center justify-center animate-fade-in">
                <p className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    {vote === 'up' ? '👍' : '👎'} Obrigado pelo seu feedback!
                </p>
                {showToast && (
                    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
                        Feedback enviado com sucesso!
                    </div>
                )}
            </div>
        );
    }

    if (status === 'commenting') {
        return (
            <div className="mt-4 p-4 bg-white border border-border rounded-lg shadow-sm animate-fade-in">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-text-primary">Como podemos melhorar esta resposta?</h4>
                    <button onClick={() => setStatus('idle')} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-2 mb-4">
                    {['Informação incorreta', 'Resposta incompleta', 'Difícil de entender', 'Outro motivo'].map((r) => (
                        <div key={r} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                            <span className="text-sm text-text-secondary">{r}</span>
                            <Toggle
                                checked={reasons.includes(r)}
                                onChange={(checked) => {
                                    if (checked) setReasons([...reasons, r]);
                                    else setReasons(reasons.filter(x => x !== r));
                                }}
                                size="sm"
                            />
                        </div>
                    ))}
                </div>

                <textarea
                    placeholder="Comentário adicional (opcional)"
                    className="w-full p-2 border border-border rounded-md text-sm mb-3 focus:border-primary focus:outline-none"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setStatus('idle')}
                        className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-md"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmitNegative}
                        className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Enviar Feedback
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Esta resposta foi útil?</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleVote('up')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all text-sm font-medium text-text-secondary"
                    >
                        <ThumbsUp size={14} /> Sim
                    </button>
                    <button
                        onClick={() => handleVote('down')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all text-sm font-medium text-text-secondary"
                    >
                        <ThumbsDown size={14} /> Não
                    </button>
                </div>
            </div>
        </div>
    );
}

