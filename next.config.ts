import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: false
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

export default withNextIntl(nextConfig);
