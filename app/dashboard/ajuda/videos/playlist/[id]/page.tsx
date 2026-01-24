import { videoPlaylists } from "@/lib/help-data-videos";
import PlaylistClient from "./PlaylistClient";

export async function generateStaticParams() {
    return videoPlaylists.map((p) => ({
        id: p.id,
    }));
}

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
    return <PlaylistClient params={params} />;
}
