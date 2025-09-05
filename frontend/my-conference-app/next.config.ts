import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking during build for Railway deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  // Ensure proper production build
  output: "standalone",
  // Disable telemetry (moved to package.json)
};

export default nextConfig;
