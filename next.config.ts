import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Desabilitar trailing slash para compatibilidade com Cloudflare
  trailingSlash: false,
};

export default nextConfig;
