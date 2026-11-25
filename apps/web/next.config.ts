import type { NextConfig } from 'next';
import { LEGACY_REDIRECTS } from '@kt/core';

const nextConfig: NextConfig = {
  transpilePackages: ['@kt/core', '@kt/bots'],
  serverExternalPackages: ['node:sqlite'],
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === '1' || process.env.VERCEL === '1',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
      ...LEGACY_REDIRECTS,
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
