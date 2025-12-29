import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed to allow NextAuth.js (Google Login) to work with server-side features
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
