import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Uncomment for static export/deploy. Comment during dev.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
