import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Desabilitar trailing slash para compatibilidade com Cloudflare
  trailingSlash: false,
};

export default nextConfig;
