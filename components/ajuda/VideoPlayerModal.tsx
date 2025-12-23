"use client";

import { useEffect, useRef, useState } from "react";
import { X, ThumbsUp, Link as LinkIcon, Share2, Play } from "lucide-react";
// import { Dialog, DialogContent } from "@/components/ui/Dialog"; // Unused import removed
import { TutorialVideo, getThumbnailUrl } from "@/lib/help-data-videos";
import { helpCategories } from "@/lib/help-data";
import { cn } from "@/lib/utils";

interface VideoPlayerModalProps {
    video: TutorialVideo | null;
    open: boolean;
    onClose: () => void;
}

export default function VideoPlayerModal({ video, open, onClose }: VideoPlayerModalProps) {
    const [seekTime, setSeekTime] = useState<number>(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Reset seek when video changes
    useEffect(() => {
        setSeekTime(0);
    }, [video]);

    if (!video) return null;

    const category = helpCategories.find(c => c.id === video.categoriaId);

    // Construct Embed URL
    // Standard embed: https://www.youtube.com/embed/ID?rel=0
    // With seek: &start=SS
    const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?modestbranding=1&rel=0&autoplay=1${seekTime > 0 ? `&start=${seekTime}` : ''}`;

    const handleChapterClick = (seconds: number) => {
        setSeekTime(seconds);
        // Force re-render of iframe by updating key or just state? 
        // Setting state triggers re-render, thus updating src.
    };

    return (
        // Using a fixed overlay instead of Dialog component to ensure custom styling without limitations if Dialog is restricted
        // But let's try to use the pattern of a full screen overlay div if "Dialog" is not perfectly fitted for this specific verified layout
        // Actually, let's use a custom fixed div implementation for maximum control as per spec
        open ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Video Player */}
                    <div className="aspect-video w-full bg-black relative">
                        <iframe
                            key={seekTime} // Force reload on seek
                            src={embedUrl}
                            title={video.titulo}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Content Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide text-white",
                                        "bg-gray-800" // Fallback color, could use dynamic color from category
                                    )} style={{ backgroundColor: category?.cor || '#666' }}>
                                        {category?.nome || video.categoriaId}
                                    </span>
                                    <span className="text-gray-500 text-sm flex items-center gap-1">
                                        ⏱ {video.duracao} • 📊 {video.visualizacoes.toLocaleString()} visualizações
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-text-primary">{video.titulo}</h2>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-full transition-colors" title="Gostei">
                                    <ThumbsUp size={20} />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-full transition-colors" title="Copiar Link">
                                    <LinkIcon size={20} />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-full transition-colors" title="Compartilhar">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        <hr className="border-border mb-6" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Descrição</h3>
                                    <p className="text-text-secondary whitespace-pre-line leading-relaxed">
                                        {video.descricao}
                                    </p>
                                </div>

                                {/* Chapters if any */}
                                {video.chapters.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Tópicos do Vídeo</h3>
                                        <div className="space-y-1">
                                            {video.chapters.map((chapter, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleChapterClick(chapter.segundos)}
                                                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left group transition-colors"
                                                >
                                                    <span className="font-mono text-primary font-medium bg-orange-50 px-2 py-0.5 rounded text-xs">
                                                        {chapter.tempo}
                                                    </span>
                                                    <span className="text-text-secondary group-hover:text-primary transition-colors">
                                                        {chapter.titulo}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar / Related */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Veja Também</h3>
                                    {video.relacionados.length > 0 ? (
                                        <div className="space-y-3">
                                            {video.relacionados.map(rel => (
                                                <div key={rel.id} className="group cursor-pointer flex gap-3 items-start">
                                                    <div className="mt-1">
                                                        {rel.tipo === 'video' ? <Play size={16} className="text-gray-400 group-hover:text-primary" /> : <LinkIcon size={16} className="text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary group-hover:text-primary line-clamp-2">
                                                            {rel.titulo}
                                                        </p>
                                                        {rel.duracao && <p className="text-xs text-gray-400">{rel.duracao}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Static placeholder for demo */}
                                            <div className="group cursor-pointer flex gap-3 items-start">
                                                <div className="mt-1"><LinkIcon size={16} className="text-gray-400" /></div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary group-hover:text-primary line-clamp-2">
                                                        Guia: Primeiros Passos
                                                    </p>
                                                    <p className="text-xs text-gray-400">Artigo • 5 min</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">Nenhum conteúdo relacionado.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
}
