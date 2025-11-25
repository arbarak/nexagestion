/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  // Don't prerender error pages - they'll be rendered on-demand
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    maxMemoryUsageSize: 50 * 1024 * 1024,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    // Disable webpack cache to avoid build issues
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
