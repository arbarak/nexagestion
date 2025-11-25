/** @type {import('next').NextConfig} */

// Force cache invalidation to ensure clean builds in Docker
const buildId = new Date().getTime();

const nextConfig = {
  generateBuildId: async () => {
    return `build-${buildId}`;
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  // Use standalone output for containerized deployment
  output: 'standalone',
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    config.cache = false;
    return config;
  },
  // Ensure all pages are rendered on-demand, not prerendered
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
