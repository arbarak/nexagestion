/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  output: "standalone",
  outputFileTracingRoot: __dirname,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    // Use disk cache for webpack to speed up builds
    config.cache = {
      type: 'filesystem',
      cacheDirectory: '.next/cache',
    };
    return config;
  },
};

module.exports = nextConfig;

