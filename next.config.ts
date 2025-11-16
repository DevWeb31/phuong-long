import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Basic Config */
  reactStrictMode: true,
  poweredByHeader: false,
  
  /* Image Optimization */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'us.123rf.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.ladepeche.fr',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  /* Headers */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  /* Redirects */
  async redirects() {
    return [
      {
        source: '/admin/dashboard',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/dashboard/profile',
        permanent: false,
      },
    ];
  },
  
  /* Experimental Features */
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'react-hook-form'],
  },
  
  /* TypeScript */
  typescript: {
    ignoreBuildErrors: false,
  },
  
  /* ESLint */
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  
  /* Webpack (optional customization) */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  /* Server Components External Packages - Exclure @supabase/realtime-js du bundling Edge Runtime */
  serverExternalPackages: ['@supabase/realtime-js'],
};

export default nextConfig;

