"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Clock, CheckCircle } from "lucide-react";
import { videoPlaylists, tutorialVideos, TutorialVideo } from "@/lib/help-data-videos";
import VideoPlayerModal from "@/components/ajuda/VideoPlayerModal";
import { cn } from "@/lib/utils";

export default function PlaylistClient({ params }: { params: Promise<{ id: string }> }) {
    const [playlistId, setPlaylistId] = useState<string>("");

    useEffect(() => {
        params.then(p => setPlaylistId(p.id));
    }, [params]);

    const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
    const [isComponentReady, setIsComponentReady] = useState(false);

    useEffect(() => {
        if (playlistId) setIsComponentReady(true);
    }, [playlistId]);


    if (!isComponentReady) return null;

    const playlist = videoPlaylists.find(p => p.id === playlistId);

    if (!playlist) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Playlist não encontrada</h1>
                    <Link href="/ajuda/videos" className="text-primary hover:underline">Voltar para vídeos</Link>
                </div>
            </div>
        );
    }

    const playlistVideos = playlist.videosIds.map(id => tutorialVideos.find(v => v.id === id)).filter(Boolean) as TutorialVideo[];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-border">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <Link href="/ajuda/videos" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition-colors">
                        <ArrowLeft size={18} /> Voltar para Galeria
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 md:items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">📚</span>
                                <h1 className="text-3xl font-bold text-text-primary">{playlist.titulo}</h1>
                            </div>
                            <p className="text-text-secondary text-lg mb-4 leading-relaxed max-w-2xl">
                                {playlist.descricao}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Clock size={16} /> {playlist.duracaoTotal}</span>
                                <span className="flex items-center gap-1">🎥 {playlistVideos.length} vídeos</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedVideo(playlistVideos[0])}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-orange-200 transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                        >
                            <Play size={20} fill="currentColor" />
                            Assistir Playlist
                        </button>
                    </div>
                </div>
            </div>

            {/* Video List */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-border flex justify-between items-center">
                        <h2 className="font-bold text-gray-700 uppercase text-sm tracking-wide">Conteúdo do Curso</h2>
                    </div>

                    <div className="divide-y divide-border">
                        {playlistVideos.map((video, index) => (
                            <div
                                key={video.id}
                                className="p-4 hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer group"
                                onClick={() => setSelectedVideo(video)}
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 font-bold flex items-center justify-center text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                                            {video.titulo}
                                        </h3>
                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            {video.duracao}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1 line-clamp-1">
                                        {video.descricao}
                                    </p>
                                </div>

                                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play size={20} className="text-primary" fill="currentColor" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <VideoPlayerModal
                video={selectedVideo}
                open={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />
        </div>
    );
}
