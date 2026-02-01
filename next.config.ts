import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  // Desabilitar trailing slash para compatibilidade
  trailingSlash: false,
};

export default nextConfig;
