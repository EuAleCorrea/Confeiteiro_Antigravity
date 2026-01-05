import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR mode - compatible with Hostinger VPS/Cloud
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

