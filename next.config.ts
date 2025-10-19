import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {
    // Turbopack will respect the tsconfig.json exclude settings
    // No additional configuration needed here
  },
};

export default nextConfig;
