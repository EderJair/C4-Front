import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Para manejar archivos grandes en App Router
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
