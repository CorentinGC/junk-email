import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  output: 'standalone',
  
  // Enable instrumentation hook for server-side initialization
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  
  // Exclude server-only packages from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'better-sqlite3': false,
        'smtp-server': false,
      };
    }
    return config;
  },
};

export default nextConfig;

