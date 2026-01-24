"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { tutorialVideos, videoPlaylists, TutorialVideo } from "@/lib/help-data-videos";
import { helpCategories } from "@/lib/help-data";
import VideoCard from "@/components/ajuda/VideoCard";
import PlaylistCard from "@/components/ajuda/PlaylistCard";
import VideoPlayerModal from "@/components/ajuda/VideoPlayerModal";
import { cn } from "@/lib/utils";

export default function VideosPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("todos");
    const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter Logic
    const filteredVideos = useMemo(() => {
        return tutorialVideos.filter(video => {
            const matchesSearch =
                video.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === "todos" || video.categoriaId === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const handleOpenVideo = (video: TutorialVideo) => {
        setSelectedVideo(video);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/ajuda" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            🎥 Vídeos Tutoriais
                        </h1>
                    </div>
                </div>

                {/* Sub-header with Search and Filters */}
                <div className="border-t border-gray-100 bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto md:mx-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar vídeo tutorial..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={() => setSelectedCategory("todos")}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                    selectedCategory === "todos"
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                                )}
                            >
                                Todos
                            </button>
                            {helpCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                        selectedCategory === cat.id
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                                    )}
                                >
                                    {cat.nome}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                {/* Search Results / Video Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-text-primary">
                            {searchQuery ? `Resultados para "${searchQuery}"` : "Todos os Vídeos"}
                        </h2>
                        <span className="text-sm text-text-secondary">
                            {filteredVideos.length} vídeos
                        </span>
                    </div>

                    {filteredVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map(video => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    onClick={() => handleOpenVideo(video)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-border dashed">
                            <p className="text-text-secondary">Nenhum vídeo encontrado para sua busca.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("todos"); }}
                                className="mt-4 text-primary font-medium hover:underline"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* Playlists Section (Only show if not searching or if relevant) */}
                {!searchQuery && selectedCategory === 'todos' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8">
                        <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
                            <h2 className="text-xl font-bold text-text-primary">📚 Playlists Completas</h2>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Cursos</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {videoPlaylists.map(playlist => (
                                <PlaylistCard key={playlist.id} playlist={playlist} />
                            ))}
                        </div>
                    </div>
                )}

            </main>

            <VideoPlayerModal
                video={selectedVideo}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

