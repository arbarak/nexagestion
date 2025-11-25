/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  // Use standalone output to avoid prerendering issues with error pages
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
