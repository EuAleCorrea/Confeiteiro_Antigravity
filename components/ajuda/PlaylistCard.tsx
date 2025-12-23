"use client";

import { PlayCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Playlist } from "@/lib/help-data-videos";

interface PlaylistCardProps {
    playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
    return (
        <div className="bg-white rounded-xl border border-border p-5 hover:border-primary/50 transition-colors flex flex-col h-full shadow-sm hover:shadow-md group">
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {/* Basic icon logic or just unified icon */}
                    <PlayCircle size={28} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
                        {playlist.titulo}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                        {playlist.videosIds.length} vídeos • {playlist.duracaoTotal}
                    </p>
                </div>
            </div>

            <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                {playlist.descricao}
            </p>

            <Link
                href={`/ajuda/videos/playlist/${playlist.id}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all mt-auto"
            >
                Ver Playlist <ArrowRight size={16} />
            </Link>
        </div>
    );
}
