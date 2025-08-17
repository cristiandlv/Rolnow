import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚫 No parar el build por errores de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚫 No parar el build por errores de TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
