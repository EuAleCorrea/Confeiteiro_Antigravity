"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { TutorialVideo, getThumbnailUrl } from "@/lib/help-data-videos";
import { helpCategories } from "@/lib/help-data";

interface VideoCardProps {
    video: TutorialVideo;
    onClick: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
    // Find category name
    const categoryName = helpCategories.find(c => c.id === video.categoriaId)?.nome || video.categoriaId;

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full bg-black">
                <img
                    src={getThumbnailUrl(video.youtubeId)}
                    alt={video.titulo}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
                    {video.duracao}
                </div>

                {/* Overlay with large Play button on hover */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play fill="white" className="text-white ml-1" size={28} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-text-primary line-clamp-2 mb-2 flex-1">
                    {video.titulo}
                </h3>

                <div className="flex items-center justify-between text-xs text-text-secondary mt-auto">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full font-medium">
                        {/* Get icon based on category? Just text for now to keep it simple or minimal styling */}
                        🚀 {categoryName}
                    </span>
                    <span>
                        📊 {video.visualizacoes} views
                    </span>
                </div>
            </div>
        </div>
    );
}

