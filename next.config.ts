import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Required for Cloudflare Pages static deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
